/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/*
 * We need to include multiple components in this module due to circular dependencies
 *
 * ContainerComponent -> RowComponent -> CellComponent ->
 *     ContainerComponent|ModelContainerComponent|ArrayContainerComponent
 *
 * ArrayContainerComponent -> ModelContainerComponent -> ContainerComponent
 *
 */

/* eslint-disable react/no-multi-comp */

import '../typedefs';

const _ = require('lodash');
import * as React from 'react';
import {Row, Col, Tabs, Tab} from 'react-bootstrap';

const TogglePanel = require('cy-bootstrap/src/components/toggle-panel');

import {default as componentUtils, BunsenComponentProps} from './utils';
import {getLabel, removeProperty} from '../utils';
import {getCellDefaults} from '../validator/defaults';

import {default as BunsenInput} from './input';

/**
 * @class
 * The container that represents an object type in the model
 * he is responsible for prepending his id onto change events from his children
 * so that 'name' becomes 'host.name' etc.
 */
export class ModelContainerComponent extends React.Component<BunsenComponentProps, {}> {
    public static defaultProps: BunsenComponentProps = {
        cellConfig: getCellDefaults()
    };

    public displayName: string = 'ModelContainerComponent';

    /* React method */
    public render(): React.ReactElement<any> {
        const cell = this.props.cellConfig;
        const customLabel = (this.props.label) ? this.props.label : cell.label;
        const label = getLabel(customLabel, this.props.model, this.props.id);

        const container = (
            <ContainerComponent
                cellConfig={cell}
                id={this.props.id}
                model={this.props.model}
                onChange={this.props.onChange.bind(this)}
                reactKey={this.props.reactKey}
                readOnly={this.props.readOnly}
                ref='container'
                store={this.props.store}
            />
        );

        if (this.props.label === null) {
            return container;
        }

        return (
            <TogglePanel
                className='model-container'
                data-id={this.props.id}
                ref='togglePanel'
                title={label}
            >
                {container}
            </TogglePanel>
        );
    }
}

/**
 * @typedef ItemInfo
 * The info required to render an array item
 * @property {Cell} cellConfig - the cell config for the
 * @property {String} reactKey - the key to give a react component so it knows when to re-render
 * @property {String} label - the label for the individual item (minus an index)
 * @property {Model} model - the sub-model for the item
 */

export interface ArrayContainerState {
    items?: Array<any>;
    key?: number;
}

/**
 * @class
 * The container that represents an array type in the model
 * he is responsible for creating a title with a plus button to add items, as well as
 * rendering each individual ModelContainerComponent within the array, and a minus button for removing items
 * He also needs to prepend his id onto change events from his children
 * so that '[1].name' becomes 'hosts[0].name' etc.
 */
export class ArrayContainerComponent extends React.Component<BunsenComponentProps, ArrayContainerState> {
    public _counter: number = 0;
    public displayName: string = 'ArrayContainerComponent';

    constructor(props: BunsenComponentProps) {
        super(props);

        this.state = {
            items: [],
            key: 0,
        };
    }

    /**
     * Handle new values coming in as props (either during initial render or during update)
     * @param {Object} props - the properties (current or incoming)
     */
    private _handleNewValues(props: BunsenComponentProps): void {
        const values: any = _.get(props.store.formValue, this.props.id);
        if (!_.isEqual(values, _.pluck(this.state.items, 'data'))) {

            const items = (values === undefined) ? [] : values.map((value: any) => ({
                data: value,
                key: this._getUniqueKey(),
            }));

            this.setState({items});
        }
    }

    /* React method */
    public componentWillMount(): void {
        this._handleNewValues(this.props);
    }

    /* React method */
    public componentWillReceiveProps(nextProps: BunsenComponentProps): void {
        this._handleNewValues(nextProps);
    }

    /**
     * Pass along any change events
     *
     * Since we keep an internal state of the array of items as well, we need to update
     * our copy of the item that changed before bubbling the event up.
     *
     * @param {ChangeEvent} e - the change event to pass along
     */
    private _onChange(e: any): void {
        const items = _.pluck(this.state.items, 'data');
        const itemId = e.id.replace(this.props.id, '');

        if (e.value === '') {
            removeProperty(items, itemId);
        } else {
            _.set(items, itemId, e.value);
        }

        this.setState({
            items: items.map((item: any, index: number) => {
                return {
                    key: this.state.items[index].key,
                    data: item,
                };
            }),
        });

        this.props.onChange(e);
    }

    /**
     * Fire an initial ChangeEvent to let parent know that a new item was added to the array
     * @param {Object} item - the item being added
     * @param {Number} index - the index of the item
     */
    private _notifyParentOfNewItem(item: any, index: number): void {
        this.props.onChange({
            id: `${this.props.id}[${index}]`,
            value: item,
        });
    }

    /**
     * Add an empty item then focus on it after it's been rendererd
     */
    private _addItem(): void {
        const newItem = {
            key: this._getUniqueKey(),
            data: this.props.model.items.type === 'object' ? {} : '',
        };
        const items = this.state.items;
        const index = items.length;

        items.push(newItem);
        this.setState({items}, () => {
            this.setState({key: index});
        });

        this._notifyParentOfNewItem(newItem.data, index);
    }

    /**
     * Remove an item at the given index
     * @param {Number} index - the index of the item to remove
     * @param {SyntheticEvent} e - the click event
     */
    private _removeItem(index: number, e: any): void {
        e.preventDefault();
        e.stopPropagation();

        const items = this.state.items;
        items.splice(index, 1);

        const newIndex = (this.state.key >= index) ? this.state.key - 1 : this.state.key;
        this.setState({items}, () => {
            this.setState({key: newIndex});
        });

        // since the onChange mechanism doesn't allow for removing things
        // we basically need to re-set the whole array
        this.props.onChange({
            id: this.props.id,
            value: _.pluck(items, 'data'),
        });
    }

    /**
     * Get a unique key to use to let React know when this portion of the DOM should really be updated
     * @returns {String} a unique key to be appended to the "normal" react key
     */
    private _getUniqueKey(): string {
        return '' + this._counter++;
    }

    /**
     * Render the item in a ModelContainerComponent
     * @param {String} itemLabel - the label for this particular item
     * @param {Number} index - the index of this item in the array
     * @param {String} reactKey - the React key to use for the item
     * @returns {ReactComponent} the rendererd ModelContainerComponent
     */
    private _renderModel(itemLabel: string, index: number, reactKey: string): React.ReactElement<any> {
        const label = (itemLabel) ? `${itemLabel} ${index + 1}` : itemLabel;
        return (
            <ModelContainerComponent
                cellConfig={this.props.cellConfig.item}
                id={`${this.props.id}[${index}]`}
                label={label}
                model={this.props.model.items}
                onChange={this._onChange.bind(this)}
                reactKey={reactKey}
                readOnly={this.props.readOnly}
                ref={`item-${index}-model`}
                store={this.props.store}
            />
        );
    }

    /**
     * Render the item in a BunsenInput
     * @param {String} itemLabel - the label for this particular item
     * @param {Number} index - the index of this item in the array
     * @param {String} reactKey - the React key to use for the item
     * @returns {ReactComponent} the rendererd BunsenInput
     */
    private _renderInput(itemLabel: string, index: number, reactKey: string): React.ReactElement<any> {
        const id = `${this.props.id}[${index}]`;
        const initialValue = _.get(this.props.store.formValue, id);
        const label = (itemLabel) ? `${itemLabel} ${index + 1}` : null;
        return (
            <BunsenInput
                cellConfig={this.props.cellConfig.item}
                id={id}
                initialValue={initialValue}
                label={label}
                model={this.props.model.items}
                onChange={this._onChange.bind(this)}
                reactKey={reactKey}
                readOnly={this.props.readOnly}
                ref={`item-${index}`}
                store={this.props.store}
            />
        );
    }

    /**
     * Render the item in a custom component
     * @param {String} itemLabel - the label for this particular item
     * @param {Number} index - the index of this item in the array
     * @param {String} reactKey - the React key to use for the item
     * @param {String} itemRenderer - the name of the custom renderer to use to render the item
     * @returns {ReactComponent} the rendererd custom component
     */
    private _renderCustom(itemLabel: string, index: number, reactKey: string, itemRenderer: string): React.ReactElement<any> {
        const CustomComponent = this.props.store.renderers[itemRenderer];
        const label = (itemLabel) ? `${itemLabel} ${index + 1}` : null;
        return (
            <CustomComponent
                cellConfig={this.props.cellConfig}
                id={`${this.props.id}[${index}]`}
                isArrayItem={true}
                label={label}
                model={this.props.model.items}
                onChange={this._onChange.bind(this)}
                reactKey={reactKey}
                readOnly={this.props.readOnly}
                ref={`item-${index}`}
                store={this.props.store}
            />
        );
    }

    /**
     * Get the info needed to render an item
     * @param {ArrayItem} item - the item to get info for
     * @returns {ItemInfo} the info
     */
    private _getItemInfo(item: any): any {
        const cell: any = _.defaults(componentUtils.getCellConfig(this), {item: {}});
        const itemContainerConfig: any = (cell.item.container) ? componentUtils.getContainerConfig(this, cell.item.container) : null;
        const itemId: string = (itemContainerConfig) ? itemContainerConfig.id : '';

        return {
            cell,
            label: getLabel(cell.item.label, this.props.model, itemId),
            model: this.props.model.items,
            reactKey: `${this.props.reactKey}-item-${item.key}`,
        };
    }

    /**
     * Render an individual item in the inline array
     * @param {ArrayItem} item - the item to render
     * @param {Number} index - the index in the array of the item
     * @returns {ReactComponent} the rendered component for the item
     */
    private _renderInlineItem(item: any, index: number): React.ReactElement<any> {

        const info = this._getItemInfo(item);

        let itemComponent = null;
        if (info.cell.item.renderer) {
            itemComponent = this._renderCustom(info.label, index, info.reactKey, info.cell.item.renderer);
        } else if (info.model.type === 'object') {
            itemComponent = this._renderModel(info.label, index, info.reactKey);
        } else {
            itemComponent = this._renderInput(info.label, index, info.reactKey);
        }

        const itemCols = this.props.readOnly ? 12 : 11;
        const removeCols = this.props.readOnly ? 0 : 1;

        return (
            <Row
                className='item-wrapper'
                key={info.reactKey}
                ref={`item-${index}`}
            >
                <Col md={itemCols}>
                    {itemComponent}
                </Col>
                <Col md={removeCols}>
                    <button
                        className='remove-item'
                        onClick={this._removeItem.bind(this, index)}
                        type='button'
                    >
                        <span className='icon-remove'></span>
                    </button>
                </Col>
            </Row>
        );
    }

    /**
     * Render the inline view for items
     * @param {Cell} cellConfig - the cell configuration for this array container
     * @returns {ReactComponent} the rendered inline view
     */
    private _renderInline(cellConfig: any): React.ReactElement<any> {
        const items = (this.state.items || []).map(this._renderInlineItem.bind(this));
        const label = getLabel(cellConfig.label, this.props.model, this.props.id);

        return (
            <fieldset className='array-container' data-id={this.props.id}>
                <legend>
                    {label}
                    <button
                        className='add-item'
                        onClick={this._addItem.bind(this)}
                        type='button'
                    >
                        <span className='icon-add'></span>
                    </button>
                </legend>
                {items}
            </fieldset>
        );
    }

    /**
     * Render the title DOM for the tab item
     * @param {ItemInfo} info - the item info to render
     * @param {Number} index - the index in the array of the item
     * @returns {ReactComponent} the rendered tab title component
     */
    private _renderTabItemTitle(info: any, index: number): React.ReactElement<any> {

        return (
            <span>
                {`${info.label} ${index + 1}`}

                <button
                    className='remove-item'
                    onClick={this._removeItem.bind(this, index)}
                    type='button'
                >
                    <span className='icon-close'></span>
                </button>
            </span>
        );
    }

    /**
     * Render an individual item in the tab based array
     * @param {ArrayItem} item - the item to render
     * @param {Number} index - the index in the array of the item
     * @returns {ReactComponent} the rendered component for the item
     */
    private _renderTabItem(item: any, index: number): React.ReactElement<any> {

        const info = this._getItemInfo(item);
        const title = this._renderTabItemTitle(info, index);

        let itemComponent = null;
        if (info.cell.item.renderer) {
            itemComponent = this._renderCustom(null, index, info.reactKey, info.cell.item.renderer);
        } else if (info.model.type === 'object') {
            itemComponent = this._renderModel(null, index, info.reactKey);
        } else {
            itemComponent = this._renderInput(null, index, info.reactKey);
        }

        return (
            <Tab
                className='item-wrapper'
                eventKey={index}
                key={`${info.reactKey}-tab`}
                ref={`item-${index}`}
                title={title}
            >
                {itemComponent}
            </Tab>
        );
    }

    /**
     * Handle navigation selection on the tabs
     * @param {Number} key: the key that was selected
     */
    private _onSelect(key: number): void {
        if (key !== undefined) {
            this.setState({key});
        }
    }

    /**
     * Render the tab view for items
     * @param {Cell} cellConfig - the cell configuration for this array container
     * @returns {ReactComponent} the rendered tab view
     */
    private _renderTabs(cellConfig: any): React.ReactElement<any> {
        const items = (this.state.items || []).map(this._renderTabItem.bind(this));
        const label = getLabel(cellConfig.label, this.props.model, this.props.id);

        const addButton = (
            <button
                className='add-item'
                onClick={this._addItem.bind(this)}
                type='button'
            >
                <span className='icon-add-square'></span>
            </button>
        );

        return (
            <fieldset className='array-container' data-id={this.props.id}>
                <legend>
                    {label}
                </legend>
                <Tabs activeKey={this.state.key} onSelect={this._onSelect.bind(this)}>
                    {items}
                    <Tab title={addButton} />
                </Tabs>
            </fieldset>
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cellConfig = componentUtils.getCellConfig(this);
        if (cellConfig.item.inline) {
            return this._renderInline(cellConfig);
        } else {
            return this._renderTabs(cellConfig);
        }
    }
}

interface CellProps extends BunsenComponentProps {
    config?: any;
    defaultClassName?: string;
}

/**
 * @class
 * An individual cell (or column) within a RowComponent.
 * Cells can be references to ContainerComponents, ModelContainerComponents,
 * ArrayContainerComponents, or BunsenInputs.
 */
export class CellComponent extends React.Component<CellProps, {}> {
    public displayName: string = 'CellComponent';

    /**
     * Get the className for this cell, either from the default of the parent or from the
     * config of this cell itself
     * @returns {String} the className for the cell
     */
    private _getClassName(): string {
        let className = this.props.defaultClassName || 'col-md-12';
        if (this.props.config.className) {
            className = this.props.config.className;
        }

        return className;
    }

    /**
     * Get the model contents of this cell, based on the config
     * @param {Cell} config - the config of the cell to render
     * @param {Model} model - the model to use (a subset of the whole model)
     * @param {Boolean} required - true if the model is required
     * @returns {ReactComponent} the jsx for the contents of the cell
     */
    private _getModelContents(config: any, model: any, required: boolean): React.ReactElement<any> {
        const id = (this.props.id) ? `${this.props.id}.${config.model}` : config.model;
        if ((model.type === 'object') && (!config.renderer)) {
            return (
                <ModelContainerComponent
                    cellConfig={config}
                    id={id}
                    model={model}
                    onChange={this.props.onChange.bind(this)}
                    reactKey={this.props.reactKey}
                    readOnly={this.props.readOnly}
                    ref='model'
                    required={required}
                    store={this.props.store}
                />
            );
        } else if ((model.type === 'array') && (!config.renderer)) {
            return (
                <ArrayContainerComponent
                    cellConfig={config}
                    id={id}
                    model={model}
                    onChange={this.props.onChange.bind(this)}
                    reactKey={this.props.reactKey}
                    readOnly={this.props.readOnly}
                    ref='array'
                    required={required}
                    store={this.props.store}
                />
            );
        } else {
            const initialValue = _.get(this.props.store.formValue, id);
            return (
                <BunsenInput
                    cellConfig={config}
                    id={id}
                    initialValue={initialValue}
                    model={model}
                    onChange={this.props.onChange.bind(this)}
                    reactKey={this.props.reactKey}
                    readOnly={this.props.readOnly}
                    ref='input'
                    required={required}
                    store={this.props.store}
                />
            );
        }
    }

    /**
     * Get the contents of this cell, based on the cellConfig
     * @returns {ReactComponent} the jsx for the contents of the cell
     */
    private _getCellContents(): React.ReactElement<any> {
        const config = this.props.config;

        if (config.model) {
            const model = componentUtils.getSubModel(this, config.model, config.dependsOn);
            const required = componentUtils.isRequired(this, config.model, config.dependsOn);
            return this._getModelContents(config, model, required);
        } else if (config.container) {
            return (
                <ContainerComponent
                    cellConfig={config}
                    model={this.props.model}
                    onChange={this.props.onChange.bind(this)}
                    reactKey={this.props.reactKey}
                    readOnly={this.props.readOnly}
                    ref='container'
                    store={this.props.store}
                />
            );
        }
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cellContents = this._getCellContents();

        return (
            <div className={this._getClassName()}>
                {cellContents}
            </div>
        );
    }
}

interface RowProps extends BunsenComponentProps {
    cellConfigs?: Array<any>;
    defaultClassName?: string;
}

export class RowComponent extends React.Component<RowProps, {}> {
    public displayName: string = 'RowComponent';

    /**
     * Render an individual cell
     * @param {Cell} config - the config for a single cell
     * @param {Number} index - the index of the cell within the row
     * @returns {ReactComponent} the rendered cell
     */
    private _renderCell(config: any, index: number): React.ReactElement<any> {
        const reactKey = `${this.props.reactKey}-${index}`;
        return (
            <CellComponent
                config={config}
                defaultClassName={this.props.defaultClassName}
                id={this.props.id}
                key={reactKey}
                model={this.props.model}
                onChange={this.props.onChange.bind(this)}
                reactKey={reactKey}
                readOnly={this.props.readOnly}
                ref={`cell-${index}`}
                store={this.props.store}
            />
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cells = this.props.cellConfigs.map(this._renderCell.bind(this));
        return (
            <Row>
                {cells}
            </Row>
        );
    }
}

export class ContainerComponent extends React.Component<BunsenComponentProps, {}> {
    public displayName: string = 'ContainerComponent';

    /**
     * Render an individual row
     * @param {Cell[]} cellConfigs - the cell definitions
     * @param {Number} index - index of the row
     * @returns {ReactComponent} the rendered row
     */
    private _renderRow(cellConfigs: Array<any>, index: number): React.ReactElement<any> {
        const reactKey = `${this.props.reactKey}-row-${index}`;
        const config = componentUtils.getContainerConfig(this, this.props.cellConfig.container);

        return (
            <RowComponent
                cellConfigs={cellConfigs}
                defaultClassName={config.defaultClassName}
                id={this.props.id}
                key={reactKey}
                model={this.props.model}
                onChange={this.props.onChange.bind(this)}
                reactKey={reactKey}
                readOnly={this.props.readOnly}
                ref={`row-${index}`}
                store={this.props.store}
            />
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const config = componentUtils.getContainerConfig(this, this.props.cellConfig.container) || {};
        const rows = (config.rows || []).map(this._renderRow.bind(this));
        const container = (
            <div className={config.className}>
                {rows}
            </div>
        );

        if (config.label) {
            return (
                <TogglePanel
                    className='model-container'
                    data-id={this.props.id}
                    title={config.label}
                >
                    {container}
                </TogglePanel>
            );
        }

        return container;
    }
}

// convenience exports
export {default as  ErrorComponent} from './validation/error-component';
export {default as  BunsenInput} from './input';
export {default as  ValidationResult} from './validation/result';
