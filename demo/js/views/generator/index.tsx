/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {ErrorComponent} from 'cy-bunsen/src/components';
import ValidatorComponent from 'cy-bunsen/demo/js/components/validator';

import validate, {validateModel} from 'cy-bunsen/src/validator';
import {getDefaultView} from 'cy-bunsen/src/generator';

const simpleModel = require('../fixtures/models/simple.json');
const arrayModel = require('../fixtures/models/array.json');
const dependenciesModel = require('../fixtures/models/dependencies.json');
const complexModel = require('../fixtures/models/complex.json');

const examples = {
    'Simple': simpleModel,
    'Array': arrayModel,
    'Dependencies': dependenciesModel,
    'Complex': complexModel,
};

interface GeneratorProps {
    initialModel?: any;
    initialView?: any;
}

interface GeneratorState {
    data?: any;
    model?: any;
    modelValidation?: any;
    view?: any;
    viewValidation?: any;
}

export default class Generator extends React.Component<GeneratorProps, GeneratorState> {
    public static defaultProps: GeneratorProps = {
        initialModel: {},
        initialView: {},
    };

    public displayName: string = 'ViewGeneratorDemo';

    constructor(props: GeneratorProps) {
        super(props);

        const model = props.initialModel;
        const view = getDefaultView(model);

        this.state = {
            model,
            modelValidation: validateModel(model),
            view,
            viewValidation: validate(view, model),
        };
    }

    /**
     * Handle editor change event for model editor
     * @param {String} value - the new value from the editor
     */
    private _onModelChange(value: string): void {
        let model;
        try {
            model = JSON.parse(value);
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

            return;
        }

        const newState: GeneratorState = {
            model,
            modelValidation: validateModel(model),
        };

        if (newState.modelValidation.valid) {
            const view = getDefaultView(model);
            _.assign(newState, {
                view,
                viewValidation: validate(view, model),
            });
        } else {
            newState.view = {};
            newState.viewValidation = validate(newState.view, model);
        }

        this.setState(newState);
    }

    /**
     * When the data in the form changes
     * @param {Object} data - the current state of the data in the form
     */
    public _onChange(data: any): void {
        this.setState({data});
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
        if (this.state.viewValidation.errors.length === 0) {
            return null;
        }

        const errors = this.state.viewValidation.errors.map(this._renderError);
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
        if (this.state.viewValidation.warnings.length === 0) {
            return null;
        }

        const warnings = this.state.viewValidation.warnings.map(this._renderWarning);
        return (
            <div className='alert alert-warning' role='alert'>
                <h4>
                    <strong>Warnings</strong>
                </h4>
                {warnings}
            </div>
        );
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const warnings = this._renderWarnings();
        const errors = this._renderErrors();
        return (
            <Grid fluid={true}>
                <Row>
                    <Col md={6}>
                        <ValidatorComponent
                            errors={this.state.modelValidation.errors}
                            examples={examples}
                            id='model-validator'
                            initialValue={JSON.stringify(this.state.model, null, 4)}
                            label='Model'
                            onChange={this._onModelChange.bind(this)}
                            varName='editor'
                            warnings={this.state.modelValidation.warnings}
                        />
                    </Col>
                    <Col className='view-wrapper' md={6}>
                        <div className='page-header'>
                            <h2>Generated View</h2>
                        </div>
                        {errors}
                        {warnings}
                        <pre>
                            {JSON.stringify(this.state.view, null, 4)}
                        </pre>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
