/**
 * @author Matthew Dahl <mdahl@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
import {Panel} from 'react-bootstrap';

const Checkbox = require('cy-bootstrap/src/checkbox');
import {BunsenComponentProps} from 'cy-bunsen/src/components/utils';
import {default as BunsenInput, InputState} from 'cy-bunsen/src/components/input';
import {validateValue} from 'cy-bunsen/src/validator';

import Editor from 'cy-bunsen/demo/js/components/editor';

const initialModel = {
    type: 'string',
    title: 'Password',
};

const initialCellConfig = {
    labelClassName: 'col-md-4',
    inputClassName: 'col-md-8',
    label: '',
    properties: {
        type: 'password'
    },
};

export default class Password extends React.Component<BunsenComponentProps, InputState> {
    public displayName: string = 'PasswordInputDemoComponent';

    constructor(props: BunsenComponentProps) {
        super(props);

        this.state = {
            cellConfig: initialCellConfig,
            model: initialModel,
            required: false,
            store: {
                formValue: {},
                validationResult: {
                    errors: []
                },
            },
        };
    }

    /**
     * Handle change event on required checkbox
     * @param {Event} e - the change event
     */
    private _onRequiredChange(e: any): void {
        this.setState(
            {
                required: e.target.checked
            },
            () => {
                this._onValueChange({
                    value: this.state.store.formValue.demoInput || ''
                });
            }
        );
    }

    /**
     * Handle editor change event
     * @param {String} value - the new value from the editor
     */
    private _onModelChange(value: string): void {
        try {
            const model = JSON.parse(value);
            this.setState({model});
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Handle editor change event
     * @param {String} value - the new value from the editor
     */
    private _onCellConfigChange(value: string): void {
        try {
            const cellConfig = JSON.parse(value);
            this.setState({cellConfig});
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Handle input change event
     * @param {ChangeEvent} e - the change event from the StringInput
     */
    private _onValueChange(e: any): void {
        const parentModel: any = {
            type: 'object',
            properties: {
                demoInput: this.state.model
            },
        };

        if (this.state.required) {
            parentModel.required = ['demoInput'];
        }

        const formValue = {
            demoInput: e.value
        };

        if (formValue.demoInput === '') {
            delete formValue.demoInput;
        }

        const store = {
            formValue,
            validationResult: validateValue(formValue, parentModel),
        };

        this.setState({store});
    }

    /* React method */
    public render(): React.ReactElement<any> {
        return (
            <div>
                <Checkbox
                    id='required-checkbox'
                    label='Required'
                    onChange={this._onRequiredChange.bind(this)}
                />

                <Panel header={<h3>Model</h3>}>
                    <Editor
                        initialValue={JSON.stringify(this.state.model, null, 4)}
                        onChange={this._onModelChange.bind(this)}
                        varName='editor'
                    />
                </Panel>

                <Panel header={<h3>Cell</h3>}>
                    <Editor
                        initialValue={JSON.stringify(this.state.cellConfig, null, 4)}
                        onChange={this._onCellConfigChange.bind(this)}
                        varName='cellConfigEditor'
                    />
                </Panel>

                <Panel className='input-wrapper' header={<h3>Generated Input</h3>}>
                    <form className='form form-horizontal cy-bunsen'>
                        <BunsenInput
                            cellConfig={this.state.cellConfig}
                            id='demoInput'
                            model={this.state.model}
                            onChange={this._onValueChange.bind(this)}
                            required={this.state.required}
                            store={this.state.store}
                        />
                    </form>
                </Panel>
            </div>
        );
    }
}
