/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
const dialogFactory = require('cy-dialog/src/jquery');
import {Form} from 'cy-bunsen';
import {Grid, Row, Col} from 'react-bootstrap';
import ValidatorComponent from 'cy-bunsen/demo/js/components/validator';
import ErrorComponent from 'cy-bunsen/src/components/validation/error-component';
import validate, {validateModel} from 'cy-bunsen/src/validator';

import PropertyChooser from 'cy-bunsen/src/components/renderers/property-chooser';
import AddressRenderer from './renderers/address';
import NameRenderer from './renderers/name';

import {validateName} from './validators';

const simpleModel = require('../fixtures/models/simple.json');
const arrayModel = require('../fixtures/models/array.json');
const l3vpnModel = require('../fixtures/models/l3vpn.json');
const l3vpnDefaultsModel = require('../fixtures/models/l3vpn-defaults.json');
const dependenciesModel = require('../fixtures/models/dependencies.json');
const complexModel = require('../fixtures/models/complex.json');

const simpleView = require('../fixtures/views/simple.json');
const arrayView = require('../fixtures/views/array.json');
const customArrayView = require('../fixtures/views/array-custom.json');
const inlineArrayView = require('../fixtures/views/array-inline.json');
const l3vpnView = require('../fixtures/views/l3vpn.json');
const l3vpnTrimmedView = require('../fixtures/views/l3vpn-trimmed.json');
const dependenciesView = require('../fixtures/views/dependencies.json');
const complexView = require('../fixtures/views/complex.json');

const modelExamples = {
    'Simple': simpleModel,
    'Array': arrayModel,
    'L3VPN (blank)': l3vpnModel,
    'L3VPN (defaults)': l3vpnDefaultsModel,
    'Dependencies': dependenciesModel,
    'Complex': complexModel,
};

const viewExamples = {
    'Simple': simpleView,
    'Array (Standard)': arrayView,
    'Array (Custom)': customArrayView,
    'Array (Inline)': inlineArrayView,
    'L3VPN (All)': l3vpnView,
    'L3VPN (Trimmed)': l3vpnTrimmedView,
    'Dependencies': dependenciesView,
    'Complex': complexView,
};

const renderers = {
    PropertyChooser: PropertyChooser,
    AddressRenderer: AddressRenderer,
    NameRenderer: NameRenderer,
};

const validators = [
    validateName
];

interface FormDemoState {
    model?: any;
    modelValidation?: any;
    value?: any;
    valueValidation?: any;
    view?: any;
    viewValidation?: any;
}

export default class FormDemo extends React.Component<{}, FormDemoState> {
    public displayName: string = 'FormDemo';

    constructor(props: any) {
        super(props);

        this.state = {
            value: {},
            model: {},
            view: {},
            modelValidation: validateModel({}),
            viewValidation: validate({}, {}, _.keys(renderers)),
            valueValidation: {
                errors: []
            },
        };
    }

    /**
     * Handle editor change event for model editor
     * @param {String} value - the new value from the editor
     */
    private _onModelChange(value: string): void {
        try {
            const model = JSON.parse(value);
            this.setState({
                model,
                modelValidation: validateModel(model),
                viewValidation: validate(this.state.view, model, Object.keys(renderers)),
            });
        } catch (e) {
            console.log(e);
            this.setState({
                modelValidation: {
                    valid: false,
                    errors: [
                        {
                            path: '',
                            message: 'Invalid JSON',
                        },
                    ],
                    warnings: [],
                },
            });
        }
    }

    /**
     * Handle editor change event for view editor
     * @param {String} value - the new value from the editor
     */
    private _onViewChange(value: string): void {

        // allow clearing view completely for model-only rendering
        if (value === '') {
            this.setState({
                view: null,
                viewValidation: {valid: true},
            });

            return;
        }

        try {
            const view = JSON.parse(value);
            this.setState(
                {
                    view,
                    viewValidation: validate(view, this.state.model, Object.keys(renderers)),
                },
                () => {
                    if (!this.state.viewValidation.valid) {
                        console.log('View validation failed:' + JSON.stringify(this.state.viewValidation, null, 4));
                    }
                }
            );
        } catch (e) {
            console.log(e);
            this.setState({
                viewValidation: {
                    valid: false,
                    errors: [
                        {
                            path: '',
                            message: 'Invalid JSON',
                        },
                    ],
                    warnings: [],
                },
            });
        }
    }

    /**
     * When the value in the form changes
     * @param {Object} value - the current state of the value of the form
     */
    private _onChange(value: any): void {
        this.setState({value});
    }

    /**
     * Handle change in validation of the form in it's entirety
     * @param {ValidationResult} result - true if the form is valid
     */
    private _onValidation(result: any): void {
        this.setState({
            valueValidation: result
        });
    }

    /**
     * When the user submits the form
     * @param {Object} value - the current state of the value of the form
     */
    private _onCancel(): any {
        dialogFactory.info('Cancelled', 'Your input will be cleared').then(() => {
            console.log('resetting form');
            const fn: any = this.refs['form']['reset'];
            fn();
        });
    }

    /**
     * When the user submits the form
     * @param {Object} value - the current state of the value of the form
     */
    private _onSubmit(value: any): void {
        dialogFactory.info('Submitted', JSON.stringify(value, null, 4));
    }

    /**
     * Render validation errors of the value of the form
     * @param {ValidationError[]} errors - the errors to render
     * @returns {ReactComponent[]} the rendered errors
     */
    private _renderErrors(errors: Array<any>): Array<any> {
        if (errors.length === 0) {
            return null;
        }

        return errors.map((error: any, index: number) => {
            return (
                <ErrorComponent
                    data={error}
                    key={`error-${index}`}
                />
            );
        });
    }

    /* React method */
    public render(): React.ReactElement<any> {
        let valueClassName = '';
        if (this.state.valueValidation.valid !== undefined) {
            valueClassName = this.state.valueValidation.valid ? 'bg-success' : 'bg-danger';
        }

        return (
            <Grid fluid={true}>
                <Row>
                    <Col className='form-wrapper' md={6}>
                        <div className='page-header'>
                            <h2>Generated Form</h2>
                        </div>

                        <Form
                            model={this.state.model}
                            onCancel={this._onCancel.bind(this)}
                            onChange={this._onChange.bind(this)}
                            onSubmit={this._onSubmit.bind(this)}
                            onValidation={this._onValidation.bind(this)}
                            ref='form'
                            renderers={renderers}
                            validators={validators}
                            view={this.state.view}
                        />

                    </Col>
                    <Col className='form-value' md={6}>
                        <div className='page-header'>
                            <h2>Current State</h2>
                        </div>

                        {this._renderErrors(this.state.valueValidation.errors)}

                        <pre className={valueClassName}>
                            {JSON.stringify(this.state.value, null, 4)}
                        </pre>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <ValidatorComponent
                            displayErrors={false}
                            errors={this.state.modelValidation.errors}
                            examples={modelExamples}
                            id='model-validator'
                            initialValue={JSON.stringify(this.state.model, null, 4)}
                            label='Model'
                            onChange={this._onModelChange.bind(this)}
                            warnings={this.state.modelValidation.warnings}
                        />
                    </Col>
                    <Col md={6}>
                        <ValidatorComponent
                            displayErrors={false}
                            errors={this.state.viewValidation.errors}
                            examples={viewExamples}
                            id='view-validator'
                            initialValue={JSON.stringify(this.state.view, null, 4)}
                            label='View'
                            onChange={this._onViewChange.bind(this)}
                            warnings={this.state.viewValidation.warnings}
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}
