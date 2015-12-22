/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../../typedefs';

const _ = require('lodash');
import {getLabel, getInitialValue} from '../../utils';

/**
 * @typedef BooleanInput.State
 * @property {Boolean} value - the current value of the input
 * @property {ValidationResult} - the result of validating the value of this input
 */

import * as React from 'react';
import {default as componentUtils, BunsenComponentProps} from '../utils';

const Checkbox = require('cy-bootstrap/src/components/checkbox');

export interface BooleanProps extends BunsenComponentProps {
}

export interface BooleanState {
    errorMessage?: any;
    value?: any;
}

export default class BooleanComponent extends React.Component<BooleanProps, BooleanState> {
    public displayName: string = 'BooleanInput';

    constructor(props: BooleanProps) {
        super(props);

        const value = getInitialValue(props.id, props.store.formValue, props.initialValue, props.model, false);
        let errorMessage = '';
        if (value !== '') {
            errorMessage = componentUtils.getErrorMessage(this);
        }

        // for truly boolean inputs (two-state not three-state) we need to immediately report the initial state
        props.onChange({
            id: props.id,
            value,
        });

        this.state = {
            errorMessage,
            value,
        };
    }

    /**
     * Handle change event on the input
     */
    private _onChange(): void {
        const oldValue = this.state.value;
        this._onNewValue(!oldValue);
    }

    /**
     * Handle a new value for the input
     * @param {Boolean} value - the new value
     */
    private _onNewValue(value: Boolean): void {
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

    /* React method */
    public componentWillReceiveProps(nextProps: BooleanProps): void {
        let value: boolean = _.get(nextProps.store.formValue, this.props.id);

        if (value === undefined) {
            value = false;
        }

        if (value !== this.state.value) {
            this._onNewValue(value);
        }

        if (this.state.errorMessage !== '') {
            this.setState({errorMessage: componentUtils.getErrorMessage(this, nextProps.store.validationResult.errors)});
        }
    }

    /**
     * Render the help text (if any)
     * @param {String} helpText - the text (if any) to render
     * @returns {ReactComponent} the rendered help text
     */
    private _maybeRenderHelp(helpText: string): React.ReactElement<any> {
        if (!helpText) {
            return null;
        }

        return (
            <span className='help-block' ref='help'>{helpText}</span>
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cell = componentUtils.getCellConfig(this);
        const bsStyle = (this.state.errorMessage !== '') ? 'has-error' : undefined;

        const customLabel = this.props.label || cell.label;
        const label = getLabel(customLabel, this.props.model, this.props.id);

        const helpComponent = this._maybeRenderHelp(this.state.errorMessage);

        return (
            <div
                className={`form-group ${bsStyle}`}
                key={`${this.props.reactKey}-${this.props.id}`}
                ref='group'
            >
                <label className={`control-label ${cell.labelClassName}`} ref='label' />
                <div className={cell.inputClassName} ref='wrapper'>
                    <Checkbox
                        checked={this.state.value}
                        data-id={this.props.id}
                        id={this.props.id}
                        label={label}
                        onBlur={this._onBlur.bind(this)}
                        onChange={this._onChange.bind(this)}
                        ref='input'
                    />
                    {helpComponent}
                </div>
            </div>
        );
    }
}
