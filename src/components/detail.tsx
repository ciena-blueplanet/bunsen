/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import {Grid} from 'react-bootstrap';

import validateView, {validateModel, validateValue} from '../validator';
import {getDefaultView} from '../generator';
import {ContainerComponent, ValidationResult} from './index';

export interface DetailProps extends React.Props<any> {
    model: any;
    value?: any;
    renderers?: any;
    view?: any;
}

export interface DetailState {
    propValidationResult?: any;
}

/**
 * @class Detail
 * The Detail component is used to display the value of an object in detail.
 * The object being displayed 'value' will be an instance of the 'model'.
 * The 'view' is used to customize the layout of the details, much in the same way
 * as the 'view' is used in the 'Form' component.
 */
export default class DetailComponent extends React.Component<DetailProps, DetailState> {
    public static defaultProps: DetailProps = {
        model: {},
        renderers: {},
    };

    public displayName: string = 'Detail';

    constructor(props: DetailProps) {
        super(props);

        this.state = {
            propValidationResult: {
                valid: false,
                errors: [],
                warnings: [],
            },
        };
    }

    /**
     * Get the view (from props or from generator)
     * @param {View} view - the view to use (if given)
     * @param {Model} model - the model schema to use to generate a view (if view is undefined)
     * @returns {View} the view
     */
    private _getView(view: any, model: any): any {
        if (!_.isEmpty(view)) {
            return view;
        }

        return getDefaultView(model);
    }

    /**
     * Validate the model given as props
     * @param {View} view - the view to validate
     * @param {Model} model - the model schema to validate
     * @param {Object} value - the value to vthe model schema to validate
     * @param {RendererSet} renderers - the set of available rendereres
     */
    private _validateProps(view: any, model: any, value: any, renderers: any = {}): void {
        let result = validateModel(model);
        if (result.valid) {
            result = validateView(this._getView(view, model), model, _.keys(renderers));
        }

        if (result.valid) {
            result = validateValue(value, model, false);
        }

        this.setState({
            propValidationResult: result
        });
    }

    /**
     * Validate model and view when we get updated ones
     * @param {Object} nextProps - the incoming props
     */
    public componentWillReceiveProps(nextProps: DetailProps): void {
        this._validateProps(nextProps.view, nextProps.model, nextProps.value, nextProps.renderers);
    }

    /**
     * Validate model and view when we first get them
     */
    public componentWillMount(): void {
        this._validateProps(this.props.view, this.props.model, this.props.value, this.props.renderers);
    }

    private _onChange(): void {
        // nothing to do, but it's required by ContainerComponent (for now)
    }

    /**
     * Render the actual form
     * @returns {ReactComponent} the rendered form, based on the model/view
     */
    private _renderDetails(): React.ReactElement<any> {
        if (!this.state.propValidationResult.valid) {
            return null;
        }

        // currently we only support one root container
        const view = this._getView(this.props.view, this.props.model);

        // placeholder until we have a proper Flux store
        const store = {
            formValue: this.props.value,
            renderers: this.props.renderers,
            view: this.props.view,
        };

        return (
            <form className='form-horizontal'>
                <ContainerComponent
                    cellConfig={view.rootContainers[0]}
                    model={this.props.model}
                    onChange={this._onChange.bind(this)}
                    reactKey='root[0]'
                    readOnly={true}
                    ref='rootContainer'
                    store={store}
                />
            </form>
        );
    }

    /**
     * Render the validation result (for when it's invalid)
     * @param {ValidationResult} result - the result to render
     * @returns {ReactComponent} a representation of the validation errors
     */
    private _renderValidationResult(result: any): React.ReactElement<any> {
        if (result.valid) {
            return null;
        }

        return (
            <ValidationResult
                ref='propValidationResult'
                result={result}
            />
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        return (
            <Grid className='cy-bunsen cy-bunsen-detail' fluid={true}>
                {this._renderValidationResult(this.state.propValidationResult)}
                {this._renderDetails()}
            </Grid>
        );
    }
}
