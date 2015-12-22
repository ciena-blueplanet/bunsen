/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import {Detail} from 'cy-bunsen';
import {Grid, Row, Col} from 'react-bootstrap';
import ValidatorComponent from 'cy-bunsen/demo/js/components/validator';
import ErrorComponent from 'cy-bunsen/src/components/validation/error-component';
import validateView, {validateModel, validateValue} from 'cy-bunsen/src/validator';

const simpleModel = require('../fixtures/models/simple.json');
const arrayModel = require('../fixtures/models/array.json');
const l3vpnModel = require('../fixtures/models/l3vpn.json');
const l3vpnDefaultsModel = require('../fixtures/models/l3vpn-defaults.json');

const simpleView = require('../fixtures/views/simple.json');
const simpleGroupingView = require('../fixtures/views/simple-grouping.json');
const simpleCustomView = require('../fixtures/views/simple-custom.json');
const arrayView = require('../fixtures/views/array.json');
const customArrayView = require('../fixtures/views/array-custom.json');
const inlineArrayView = require('../fixtures/views/array-inline.json');

const simpleValue = require('../fixtures/values/simple-full.json');
const simplePartialValue = require('../fixtures/values/simple-partial.json');
const arrayValue = require('../fixtures/values/array-full.json');

import BooleanRenderer from './renderers/boolean';

const modelExamples = {
    'Simple': simpleModel,
    'Array': arrayModel,
    'L3VPN (blank)': l3vpnModel,
    'L3VPN (defaults)': l3vpnDefaultsModel,
};

const viewExamples = {
    'Simple (Standard)': simpleView,
    'Simple (Grouping)': simpleGroupingView,
    'Simple (Custom)': simpleCustomView,
    'Array (Standard)': arrayView,
    'Array (Custom)': customArrayView,
    'Array (Inline)': inlineArrayView,
};

const valueExamples = {
    'Simple (Complete)': simpleValue,
    'Simple (Partial)': simplePartialValue,
    'Array (Complete)': arrayValue,
};

const renderers = {
    BooleanRenderer: BooleanRenderer
};

interface DetailDemoState {
    model?: any;
    modelValidation?: any;
    value?: any;
    valueValidation?: any;
    view?: any;
    viewValidation?: any;
}

export default class DetailDemo extends React.Component<{}, DetailDemoState> {
    public displayName: string = 'DetailDemo';

    constructor(props: any) {
        super(props);

        this.state = {
            value: {},
            model: {},
            view: {},
            modelValidation: validateModel({}),
            viewValidation: validateView({}, {}, _.keys(renderers)),
            valueValidation: validateValue({}, {}, false),
        };
    }

    /**
     * Handle editor change event for value editor
     * @param {String} value - the new value from the editor
     */
    private _onValueChange(value: string): void {
        let valueObj;
        try {
            valueObj = JSON.parse(value);
        } catch (e) {
            console.log(e);
            this.setState({
                valueValidation: {
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

        if (valueObj) {
            this.setState({
                value: valueObj,
                valueValidation: validateValue(valueObj, this.state.model, false),
            });

        }
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
            this.setState({
                view,
                viewValidation: validateView(view, this.state.model, _.keys(renderers)),
            });
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
    public _onChange(value: any): void {
        this.setState({value});
    }

    /**
     * Handle change in validation of the form in it's entirety
     * @param {ValidationResult} result - true if the form is valid
     */
    public _onValidation(result: any): void {
        this.setState({
            valueValidation: result
        });
    }

    /**
     * Render validation errors of the value of the form
     * @param {ValidationError[]} errors - the errors to render
     * @returns {ReactComponent[]} the rendered errors
     */
    public _renderErrors(errors: Array<any>): Array<React.ReactElement<any>> {
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
        return (
            <Grid fluid={true}>
                <Row>
                    <Col className='form-value' md={6}>
                        <ValidatorComponent
                            displayErrors={true}
                            errors={this.state.valueValidation.errors}
                            examples={valueExamples}
                            id='value-validator'
                            initialValue={JSON.stringify(this.state.value, null, 4)}
                            label='Value'
                            onChange={this._onValueChange.bind(this)}
                            warnings={this.state.valueValidation.warnings}
                        />
                    </Col>
                    <Col className='form-wrapper' md={6}>
                        <div className='page-header'>
                            <h2>Generated Detail</h2>
                        </div>

                        <Detail
                            model={this.state.model}
                            renderers={renderers}
                            value={this.state.value}
                            view={this.state.view}
                        />

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
