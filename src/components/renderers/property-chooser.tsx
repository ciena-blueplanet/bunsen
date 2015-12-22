/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import {default as componentUtils, BunsenComponentProps} from '../utils';
import {getLabel} from '../../utils';

const DropDownFormField = require('cy-drop-down').DropDownFormField;

export interface PropertyChooserProps extends BunsenComponentProps {
}

export interface PropertyChooserState {
    value?: any;
}

/**
 * @class PropertyChooser
 * This custom renderer is used to allow the user to set only one of a set of possible boolean properties
 * in the model. This is used to facilitate schema dependencies
 * http://spacetelescope.github.io/understanding-json-schema/reference/object.html#schema-dependencies
 * Since there is no mechanism to have conditional schema based on the value of a given property, we need to use
 * the existance of a particular property to trigger schema changes.
 */
export default class PropertyChooserComponent extends React.Component<PropertyChooserProps, PropertyChooserState> {
    public displayName: string = 'PropertyChooser';

    constructor(props: PropertyChooserProps) {
        super(props);

        this.state = {
            value: ''
        };
    }

    /**
     * Handle change event and notify parent
     *
     * This looks a bit odd and deserves some explaination. In order to simulate schema dependencies
     * based on the value of a property, we "aggregate" a set of properties and treat them kind of like a single
     * property with a choice of enumerations. So that they don't get initialized to false, we use "string" types
     * for the enumerations. We want only one of the properties to exist in formValue at any given time. We use
     * the arbitrarty string of "selected" to set the value of the selected enumeration, and when a value of "" is
     * given, the property will be removed. We track the property that is currently selected in this.state.value.
     *
     * For example, if we are choosing a payment method, and we have 3 string properties: useEft, useCreditCard, and
     * usePaypal, and our current value is useCreditCard when this method is called with useEft, the following two
     * calls will be made to this.props.onChange:
     *
     * this.props.onChange({id: `${this.props.id}.useCreditCard`, value: ''})
     * this.props.onChange({id: `${this.props.id}.useEft`, value: 'selected'})
     *
     * This, in effect de-selects userCreditCard and selects useEft
     *
     * @param {String} value - the new value
     */
    private _onChange(value: string): void {
        if (this.state.value) {
            this.props.onChange({
                id: `${this.props.id}.${this.state.value}`,
                value: '', // clear selection
            });
        }

        if (value) {
            this.props.onChange({
                id: `${this.props.id}.${value}`,
                value: 'selected',
            });
        }

        this.setState({value});
    }

    /* React Method */
    public componentDidUpdate(prevProps: PropertyChooserProps): void {
        if (_.isEqual(prevProps.store.formValue, this.props.store.formValue)) {
            return;
        }

        const cell = this.props.cellConfig;
        const somethingChosen = _.some(cell.properties.choices, (choice: any) => {
            const choiceId = this.props.id.replace(cell, choice.value);
            const choiceValue = _.get(this.props.store.formValue, choiceId);
            return (choiceValue !== '') && (choiceValue !== undefined);
        });

        if (!somethingChosen) {
            const fn: any = this.refs['dropDown']['setValue'];
            fn('');
        }
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cell = componentUtils.getCellConfig(this);
        const customLabel = this.props.label || cell.label;
        const label = getLabel(customLabel, this.props.model, this.props.id);
        const allowClear = _.get(cell, 'properties.allowClear', true);

        return (
            <DropDownFormField
                allowClear={allowClear}
                data={cell.properties.choices}
                data-id={this.props.id}
                key={`${this.props.reactKey}-${this.props.id}`}
                label={`${label}:`}
                labelClassName={cell.labelClassName}
                onChange={this._onChange.bind(this)}
                ref='dropDown'
                wrapperClassName={cell.inputClassName}
            />
        );
    }
}
