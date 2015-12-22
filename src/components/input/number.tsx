/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../../typedefs';

const _ = require('lodash');
import {getLabel, getInitialValue} from '../../utils';

/**
 * @typedef NumberInput.State
 * @property {Number} value - the current value of the input
 * @property {ValidationResult} - the result of validating the value of this input
 */

import * as React from 'react';
const Input = require('react-bootstrap').Input;
import {default as componentUtils, BunsenComponentProps} from '../utils';

export interface NumberProps extends BunsenComponentProps {
}

export interface NumberState {
    errorMessage?: any;
    value?: any;
}

export default class NumberComponent extends React.Component<NumberProps, NumberState> {
    public displayName: string = 'NumberInput';

    constructor(props: NumberProps) {
        super(props);

        const value = getInitialValue(props.id, props.store.formValue, props.initialValue, props.model);
        let errorMessage = '';
        if (value !== '') {
            errorMessage = componentUtils.getErrorMessage(this);
        }

        this.state = {
            errorMessage,
            value,
        };
    }

    /**
     * Handle change event on the input
     * @param {SyntheticEvent} e - the change event being handled
     */
    private _onChange(e: any): void {
        const stringValue = e.target.value;
        let value = parseFloat(stringValue);

        if (value.toString() !== stringValue) {
            value = stringValue;
        }

        this._onNewValue(value);
    }

    /**
     * Handle a new value for the input
     * @param {Number|String} value - the new value
     */
    private _onNewValue(value: any): void {
        this.props.onChange({
            id: this.props.id,
            value,
        });

        this.setState({value});
    }

    /**
     * Handle blur event on the input
     */
    private _onBlur(): void {
        this.setState({
            errorMessage: componentUtils.getErrorMessage(this)
        });
    }

    /**
     * React method
     * If we've been given a new value, treat it like the user changed the value
     * @param {Object} nextProps - the incoming props
     */
    public componentWillReceiveProps(nextProps: NumberProps): void {
        let value = _.get(nextProps.store.formValue, this.props.id);
        if (value === undefined) {
            value = '';
        }

        if (value !== this.state.value) {
            this._onNewValue(value);
        }

        if (this.state.errorMessage !== '') {
            this.setState({errorMessage: componentUtils.getErrorMessage(this, nextProps.store.validationResult.errors)});
        }
    }

    /**
     * React method
     * If we have been given an initialValue or default from the model
     * make sure our parent knows about it.
     */
    public componentDidMount(): void {
        if (this.state.value !== '') {
            this.props.onChange({
                id: this.props.id,
                value: this.state.value,
            });
        }
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cell = componentUtils.getCellConfig(this);
        const bsStyle = (this.state.errorMessage !== '') ? 'error' : undefined;

        const showRequired = this.props.required && (this.state.value.length === 0);
        const className = showRequired ? 'required' : '';

        const customLabel = this.props.label || cell.label;
        const label = getLabel(customLabel, this.props.model, this.props.id);

        return (
            <Input
                bsStyle={bsStyle}
                className={className}
                data-id={this.props.id}
                help={this.state.errorMessage}
                key={`${this.props.reactKey}-${this.props.id}`}
                label={`${label}:`}
                labelClassName={cell.labelClassName}
                onBlur={this._onBlur.bind(this)}
                onChange={this._onChange.bind(this)}
                placeholder={cell.placeholder}
                ref='input'
                type='number'
                value={this.state.value}
                wrapperClassName={cell.inputClassName}
            />
        );
    }
}
