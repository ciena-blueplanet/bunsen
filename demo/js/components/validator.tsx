/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';

const Checkbox = require('cy-bootstrap/src/checkbox');
const DropDownFormField = require('cy-drop-down').DropDownFormField;
import {ErrorComponent} from 'cy-bunsen/src/components';
import Editor from './editor';

interface ValidatorProps {
    displayErrors?: boolean;
    errors?: Array<any>;
    examples?: any;
    id?: string;
    initialValue?: string;
    label?: string;
    onChange?: any;
    renderers?: Array<any>;
    varName?: string;
    warnings?: Array<any>;
}

interface ValidatorState {
    vimMode?: boolean;
}

export default class Validator extends React.Component<ValidatorProps, ValidatorState> {
    public static defaultProps: ValidatorProps = {
        displayErrors: true,
        initialValue: '',
        label: 'Validator',
    };

    public clearingExample: boolean;
    public displayName: string = 'Validator';
    public showingExample: boolean;

    constructor(props: ValidatorProps) {
        super(props);

        this.state = {
            vimMode: false
        };
    }

    /**
     * obvious
     * @returns {Boolean} true if valid, false if not
     */
    public isValid(): boolean {
        return this.props.errors.length === 0;
    }

    /**
     * Render a single Error
     * @param {ValidationError} error - the error to render
     * @param {Number} index - the index of the error (for the react key)
     * @returns {ReactComponent} the rendered component
     */
    private _renderError(error: any, index: number): React.ReactElement<any> {
        return (
            <ErrorComponent
                data={error}
                key={`error-${index}`}
            />
        );
    }

    /**
     * Render the errors into a bootstrap Alert
     * @returns {ReactComponent} a bootstrap Alert with all errors in it
     */
    private _renderErrors(): React.ReactElement<any> {
        if (this.isValid()) {
            return null;
        }

        const errors = this.props.errors.map(this._renderError);
        return (
            <div className='alert alert-danger' role='alert'>
                <h4>
                    <strong>Errors</strong>
                </h4>
                {errors}
            </div>
        );
    }

    /**
     * Render a single Warning
     * @param {ValidationWarning} warning - the warning to render
     * @param {Number} index - the index of the warning (for the react key)
     * @returns {ReactComponent} the rendered component
     */
    private _renderWarning(warning: any, index: number): React.ReactElement<any> {
        return (
            <ErrorComponent
                data={warning}
                key={`warning-${index}`}
                warning={true}
            />
        );
    }

    /**
     * Render the warnings into a bootstrap Alert
     * @returns {ReactComponent} a bootstrap Alert with all warnings in it
     */
    private _renderWarnings(): React.ReactElement<any> {
        if (this.props.warnings.length === 0) {
            return null;
        }

        const warnings = this.props.warnings.map(this._renderWarning);
        return (
            <div className='alert alert-warning' role='alert'>
                <h4>
                    <strong>Warnings</strong>
                </h4>
                {warnings}
            </div>
        );
    }

    /**
     * Render the icon representing the result of the validation
     * @returns {ReactComponent} the sub-title that include a result icon
     */
    private _renderValidationResult(): React.ReactElement<any> {
        return (
            <small className={this.isValid() ? 'text-success' : 'text-danger'}>
                <span className={this.isValid() ? 'icon-check' : 'icon-exclude'}></span>
            </small>
        );
    }

    /**
     * Hanle a change event on the Vim Mode checkbox
     * @param {Event} e - the change event
     */
    private _onVimModeChange(e: any): void {
        this.setState({
            vimMode: e.target.checked
        });
    }

    /**
     * Handle the user choosing an example (or clearing selection)
     * @param {Object} selectedObject - the name of the example to use
     */
    private _onExample(selectedObject: any): void {
        if (!this.clearingExample) {
            this._showExample(selectedObject.value);
        }

        this.clearingExample = false;
    }

    /**
     * Update the editor with the example
     * @param {String} name - the name of the example to use
     */
    private _showExample(name: string): void {
        if (!this.refs['editorComponent']) {
            return;
        }

        const value = JSON.stringify(this.props.examples[name] || {}, null, 4);
        this.showingExample = true;
        this.refs['editorComponent']['editor'].setValue(value);
    }

    /* obvious */
    private _clearExample(): void {
        if (!this.refs['example']) {
            return;
        }

        this.clearingExample = true;
        const fn: any = this.refs['example']['setValue'];
        fn('', true);
    }

    /**
     * Handle a change in the editor
     * @param {String} newValue - the new value of the editor
     */
    private _onChange(newValue: string): void {
        this.props.onChange(newValue);

        if (!this.showingExample) {
            this._clearExample();
        }

        this.showingExample = false;
    }

    /**
     * Render the example drop-down (if any were given)
     * @returns {ReactComponent} the rendererd examples
     */
    private _renderExamples(): React.ReactElement<any> {
        const dropDownItems = _.keys(this.props.examples).map((key: string) => {
            return {label: key, value: key};
        });

        return (
            <form className='form-horizontal' data-id={`${this.props.id}-examples`}>
                <DropDownFormField
                    data={dropDownItems}
                    label='Example:'
                    labelClassName='col-md-2'
                    onChange={this._onExample.bind(this)}
                    placeholder='Choose an example...'
                    ref='example'
                    wrapperClassName='col-md-6'
                />
            </form>
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        let warnings = null;
        let errors = null;

        if (this.props.displayErrors) {
            warnings = this._renderWarnings();
            errors = this._renderErrors();
        }

        const examples = (this.props.examples) ? this._renderExamples() : null;

        return (
            <div className=''>
                <div className='page-header'>
                    <h2>
                        {this.props.label + ' '}
                        {this._renderValidationResult()}
                        <div className='pull-right'>
                            <Checkbox
                                id={`${this.props.id}-vim-mode`}
                                label='Vim Mode'
                                onChange={this._onVimModeChange.bind(this)}
                            />
                        </div>
                    </h2>
                </div>

                {examples}
                {warnings}
                {errors}

                <Editor
                    initialValue={this.props.initialValue}
                    onChange={this._onChange.bind(this)}
                    ref='editorComponent'
                    valid={this.isValid()}
                    varName={this.props.varName}
                    vimMode={this.state.vimMode}
                />
            </div>
        );
    }
}
