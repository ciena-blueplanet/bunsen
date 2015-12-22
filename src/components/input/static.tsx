/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../../typedefs';

const _ = require('lodash');
import {getLabel, getInitialValue} from '../../utils';

import * as React from 'react';
import {default as componentUtils, BunsenComponentProps} from '../utils';

export interface StaticProps extends BunsenComponentProps {
}

export interface StaticState {
    errorMessage?: any;
    value?: any;
}

export default class StaticComponent extends React.Component<StaticProps, StaticState> {
    public displayName: string = 'StaticInput';

    constructor(props: StaticProps) {
        super(props);

        const value = getInitialValue(
            props.id, props.store.formValue, props.initialValue, props.model
        );

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
     * Handle an update to the value (including updating the state for both value and validation)
     * @param {Object} value - the new value
     */
    private _onNewValue(value: any): void {
        this.setState({value});
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
    public componentWillReceiveProps(nextProps: StaticProps): void {
        const value = _.get(nextProps.store.formValue, this.props.id);
        if (value !== this.state.value) {
            this._onNewValue((value !== undefined) ? value : '');
        }

        if (this.state.errorMessage !== '') {
            this.setState({errorMessage: componentUtils.getErrorMessage(this, nextProps.store.validationResult.errors)});
        }
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cellConfig = componentUtils.getCellConfig(this);
        _.defaults(cellConfig, {
            placeholder: '—'
        });

        const customLabel = this.props.label || cellConfig.label;
        const label = getLabel(customLabel, this.props.model, this.props.id);

        let value = this.state.value;

        if (_.isBoolean(value)) {
            value = (value) ? 'true' : 'false';
        }

        if (value === '') {
            value = cellConfig.placeholder;
        }

        return (
            <div className='form-group' key={this.props.reactKey}>
                <label className={`control-label ${cellConfig.labelClassName}`}>{`${label}:`}</label>
                <div className={cellConfig.inputClassName}>
                    <p className='form-control-static'>{value}</p>
                </div>
            </div>
        );
    }
}
