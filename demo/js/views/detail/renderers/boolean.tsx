/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import {default as componentUtils, BunsenComponentProps} from 'cy-bunsen/src/components/utils';
import {getLabel} from 'cy-bunsen/src/utils';

export default class BooleanRenderer extends React.Component<BunsenComponentProps, {}> {
    public displayName: string = 'BooleanRenderer';

    /**
     * Render the value (or a dash if not present
     * @param {Boolean} value - the value to render
     * @param {Cell} cellConfig - the cell config
     * @returns {ReactComponent} the rendered value
     */
    private _renderValue(value: any, cellConfig: any): React.ReactElement<any> {
        if (value === undefined) {
            return (
                <span>{cellConfig.placeholder}</span>
            );
        }

        return (
            <span className={value ? 'icon-check' : 'icon-exclude'} />
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const cellConfig: any = componentUtils.getCellConfig(this);
        const customLabel: string = this.props.label || cellConfig.label;
        const label: string = getLabel(customLabel, this.props.model, this.props.id);
        const value: any = _.get(this.props.formValue, this.props.id);

        return (
            <div className='form-group' key={this.props.reactKey}>
                <label className={`control-label ${cellConfig.labelClassName}`}>{`${label}:`}</label>
                <div className={cellConfig.inputClassName}>
                    <p className='form-control-static'>
                        {this._renderValue(value, cellConfig)}
                    </p>
                </div>
            </div>
        );
    }
}
