/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import StringInput from './string';
import NumberInput from './number';
import BooleanInput from './boolean';
import StaticInput from './static';

import {default as componentUtils, BunsenComponentProps} from '../utils';

export interface InputState {
    cellConfig?: any;
    model?: any;
    required?: boolean;
    store?: any;
}

export default class InputComponent extends React.Component<BunsenComponentProps, InputState> {
    public displayName: string = 'BunsenInput';

    /**
     * Get the the Component for the given model Field
     * @returns {ReactClass} the class for rendering the model
     * @throws Error when model has invalid type
     */
    private _getRealInputComponent(): any {
        // TODO: add support for more types
        switch (this.props.model.type) {
            case 'string':
                return StringInput;
            case 'number':
                return NumberInput;
            case 'boolean':
                return BooleanInput;
            default:
                throw new Error('Only "string", "number", or "boolean" fields are currently supported.');
        }
    }

    /**
     * Get the the Component for the given model Field
     * @returns {ReactClass} the class for rendering the model
     * @throws Error when model has invalid type
     */
    private _getInputComponent(): any {
        const cell = this.props.cellConfig;
        if (cell.renderer) {
            return componentUtils.getRenderer(this, cell.renderer);
        }

        if (this.props.readOnly || this.props.model.editable === false) {
            return StaticInput;
        }

        return this._getRealInputComponent();
    }

    /**
     * Check if the dependency for this input is met
     * i.e. does the `dependsOn` attribute exist in the current value
     * @returns {Boolean} true if the dependency has been met
     */
    private _isDependencyMet(): boolean {
        const cell = this.props.cellConfig;
        const dependencyId = this.props.id.replace(cell.model, cell.dependsOn);
        const dependencyValue = _.get(this.props.store.formValue, dependencyId);
        return (dependencyValue !== undefined);
    }

    /* React Method */
    public componentDidUpdate(): void {
        const cell = this.props.cellConfig;
        const currentValue = _.get(this.props.store.formValue, this.props.id);

        if (cell.dependsOn && currentValue && !this._isDependencyMet()) {
            this.props.onChange({
                id: this.props.id,
                value: undefined, // clear it
            });
        }
    }

    /**
     * obvious
     * @returns {ReactComponent} the rendered component
     */
    public render(): React.ReactElement<any> {
        const cell = this.props.cellConfig;
        if (cell.dependsOn && !this._isDependencyMet()) {
            return null;
        }

        const InputComponent = this._getInputComponent();
        return (
            <InputComponent
                ref='realInput'
                {...this.props}
            />
        );
    }
}
