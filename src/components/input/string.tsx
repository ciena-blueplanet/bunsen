/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../../typedefs';

const _ = require('lodash');
import {getLabel, getInitialValue} from '../../utils';

/**
 * @typedef StringInput.State
 * @property {String} value - the current value of the input
 * @property {ValidationResult} - the result of validating the value of this input
 */

import * as React from 'react';
const Input = require('react-bootstrap').Input;
import {default as componentUtils, BunsenComponentProps} from '../utils';

export interface StringProps extends BunsenComponentProps {
}

export interface StringState {
    errorMessage?: any;
    focused?: boolean;
    value?: any;
}

export default class StringComponent extends React.Component<StringProps, StringState> {
    public displayName: string = 'StringInput';

    constructor(props: StringProps) {
        super(props);

        const value = getInitialValue(props.id, props.store.formValue, props.initialValue, props.model);

        let errorMessage = '';
        if (value !== '') {
            errorMessage = componentUtils.getErrorMessage(this);
        }

        this.state = {
            errorMessage,
            focused: true,
            value,
        };
    }

    /**
     * Handle an update to the value (including updating the state for both value and validation)
     * @param {Object} value - the new value
     */
    private _onNewValue(value: any): void {
        this.setState({value});
    }

    /**
     * Handle change event on the input
     * @param {SyntheticEvent} e - the change event being handled
     */
    private _onChange(e: any): void {
        const value = e.target.value;

        this.props.onChange({
            id: this.props.id,
            value,
        });

        this._onNewValue(value);
    }

    /**
     * Handle blur event on the input
     */
    private _onBlur(): void {
        this.setState({
            focused: false,
            errorMessage: componentUtils.getErrorMessage(this),
        });
    }

    /**
     * Handle focus event on the input
     */
    private _onFocus(): void {
        this.setState({
            focused: true
        });
    }

    /* React method */
    public componentWillReceiveProps(nextProps: StringProps): void {
        const value = _.get(nextProps.store.formValue, this.props.id);
        if (value !== this.state.value) {
            this._onNewValue((value !== undefined) ? value : '');
        }

        if (!this.state.focused || this.state.errorMessage !== '') {
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
        const type = _.get(cell, 'properties.type', 'text');

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
                onFocus={this._onFocus.bind(this)}
                placeholder={cell.placeholder}
                ref='input'
                type={type}
                value={this.state.value}
                wrapperClassName={cell.inputClassName}
            />
        );
    }
}
