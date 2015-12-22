/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';
import {Grid} from 'react-bootstrap';
const Q = require('q');

import validateView, {validateModel, validateValue} from '../validator';
import {removeProperty} from '../utils';
import {aggregateResults} from '../validator/utils';
import {getButtonLabelDefaults} from '../validator/defaults';
import {getDefaultView} from '../generator';
import dereference from '../dereference';

import {ContainerComponent, ValidationResult} from './index';
import PropertyChooser from './renderers/property-chooser';


const builtinRenderers = {
    PropertyChooser: PropertyChooser
};

export interface FormProps extends React.HTMLAttributes {
    cancelLabel?: string;
    initialValue?: any;
    model?: any;
    onCancel?: any;
    onSubmit?: any;
    onValidation?: any;
    ref?: string;
    renderers?: any;
    submitLabel?: string;
    validators?: Array<any>;
    view?: any;
}

export interface FormState {
    propValidationResult?: any;
    renderers?: any;
    validationResult?: any;
    value?: any;
}

/**
 * @class Form
 * The Form component is used to help a user provide information that satisfies the 'model'
 * The 'view' is used to customize the layout of the generated form which the user will
 * fill out.
 */
export default class FormComponent extends React.Component<FormProps, FormState> {
    /* tslint:disable:no-empty */
    public static defaultProps: FormProps = {
        initialValue: {},
        onChange: (): void => {},
        onValidation: (): void => {},
        renderers: {},
        validators: [],
    };
    /* tslint:enable:no-empty */

    public currentValue: any;
    public displayName: string = 'Form';

    constructor(props: FormProps) {
        super(props);

        this.state = {
            value: _.cloneDeep(props.initialValue),
            propValidationResult: {
                valid: false,
                errors: [],
                warnings: [],
            },
            validationResult: {
                valid: false,
                errors: [],
                warnings: [],
            },
            renderers: Object.assign({}, builtinRenderers, props.renderers),
        };
    }

    /**
     * Get the view (from props or from generator)
     * @param {View} view - the view to use (if given)
     * @param {Model} model - the model schema to use to generate a view (if view is undefined)
     * @returns {View} the view
     */
    private _getView(view: any, model: any): any {
        if (view && !_.isEmpty(view)) {
            return view;
        }

        return getDefaultView(model);
    }

    /**
     * Validate the model given as props
     * @param {View} view - the view to validate
     * @param {Model} model - the model schema to validate
     * @param {RendererSet} renderers - the set of available rendereres
     */
    private _validateProps(view: any, model: any, renderers: any = {}): any {
        let result = validateModel(model);
        if (result.valid) {
            result = validateView(this._getView(view, model), model, _.keys(renderers));
        }

        this.setState({
            propValidationResult: result
        });
    }

    /**
     * Handle a change event from the root containers
     *
     * Unfortunately, we may receive multiple _onChange() callbacks before
     * our first setState() completes, so we can't modify a clone of this.state.value as we normally would. If we did
     * subsequent calls to _onChange() that happen before the first setState() finishes would override the value.
     * We also cannot directly manipulate this.state.value because that would break shouldComponentMount() checks
     * which validate previous state against new state.
     *
     * Enter this.currentValue. The currentValue is a place where we can aggregate the multiple _onChange() changes
     * and make incremental setState() calls. Since each time, what we pass into setState is different than
     * this.props.state, we should still allow shouldComponentUpdate() to function properly.
     *
     * @param {ChangeEvent} e - the change event being handled
     */
    private _onChange(e: any): void {
        if (e.value === '') {
            removeProperty(this.currentValue, e.id);
        } else {
            _.set(this.currentValue, e.id, e.value);
        }

        const value = _.cloneDeep(this.currentValue);

        this.setState({value}, () => {
            this.validate();
        });

        this.props.onChange(value);
    }

    /**
     * Reset the form to the initial value
     */
    public reset(): void {
        this.currentValue = _.cloneDeep(this.props.initialValue);

        this.setState({value: this.currentValue}, () => {
            this.validate();
        });

        this.props.onChange(this.currentValue);
    }

    /**
     * Get the model (after dereferencing it)
     * @returns {Model} the dereferenced model
     */
    private _getModel(): any {
        return dereference(this.props.model).schema;
    }

    /**
     * validate the current value of the form against the schema
     */
    private validate(): void {
        const result = validateValue(this.state.value, this._getModel());

        const promises = [];
        this.props.validators.forEach((validator: any) => {
            promises.push(validator(this.currentValue));
        });

        Q.allSettled(promises)
            .then((snapshots: any) => {
                const results = _.pluck(snapshots, 'value');
                results.push(result);

                const aggregatedResult = aggregateResults(results);
                this.setState({validationResult: aggregatedResult});
                this.props.onValidation(aggregatedResult);
            })
            .done();
    }

    /**
     * Validate model and view when we get updated ones
     * @param {Object} nextProps - the incoming props
     */
    public componentWillReceiveProps(nextProps: FormProps): void {
        const renderers = Object.assign({}, builtinRenderers, nextProps.renderers);
        this._validateProps(nextProps.view, nextProps.model, renderers);
        this.setState({renderers});
    }

    /**
     * Validate model and view when we first get them
     * We save a currentValue because of the issue described in _onChange()
     */
    public componentWillMount(): void {
        this.currentValue = _.cloneDeep(this.state.value);
        this._validateProps(this.props.view, this.props.model, this.state.renderers);
    }

    /**
     * Validate the initial data once we're rendered
     */
    public componentDidMount(): void {
        this.validate();
    }

    /**
     * Handle the DOM submit event
     * @param {Event} e - the submit event
     */
    private _onSubmit(e: any): void {
        e.preventDefault();

        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.value);
        }
    }

    /**
     * Render the bottom button bar (if onSubmit is present in props)
     * @param {Object} labels - key-value pairs of string button labels
     * @returns {ReactComponent} the rendered button bar
     */
    private _renderButtonBar(labels: any): React.ReactElement<any> {
        let submitButton, cancelButton;

        if (!this.props.onSubmit && !this.props.onCancel) {
            return null;
        }

        if (this.props.onSubmit) {
            submitButton = (
                <button
                    className='btn btn-default pull-right'
                    disabled={!this.state.validationResult.valid}
                    ref='submitBtn'
                    type='submit'
                >
                    {labels.submit}
                </button>
            );
        }

        if (this.props.onCancel) {
            cancelButton = (
                <button
                    className='btn btn-default pull-right'
                    onClick={this.props.onCancel.bind(this)}
                    ref='cancelBtn'
                    type='button'
                >
                    {labels.cancel}
                </button>
            );
        }

        return (
            <div className='form-group button-bar'>
                <div className='col-md-12'>
                    <div className='pull-right'>
                        {cancelButton}
                        {submitButton}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Render the actual form
     * @returns {ReactComponent} the rendered form, based on the model/view
     */
    private _renderForm(): React.ReactElement<any> {
        if (!this.state.propValidationResult.valid) {
            return null;
        }

        // currently we only support one root container
        const view = this._getView(this.props.view, this.props.model);
        const buttonLabels = _.defaults(
            {
                cancel: this.props.cancelLabel,
                submit: this.props.submitLabel,
            },
            view.buttonLabels,
            getButtonLabelDefaults()
        );

        const buttonBar = this._renderButtonBar(buttonLabels);

        // placeholder until we have a real Flux store
        const store = {
            formValue: this.state.value,
            renderers: this.state.renderers,
            validationResult: this.state.validationResult,
            view,
        };

        return (
            <form
                className='form form-horizontal'
                onSubmit={this._onSubmit.bind(this)}
            >
                <ContainerComponent
                    cellConfig={view.rootContainers[0]}
                    model={this._getModel()}
                    onChange={this._onChange.bind(this)}
                    reactKey='root[0]'
                    ref='rootContainer'
                    store={store}
                />
                {buttonBar}
            </form>
        );
    }

    /**
     * Render the validation result (for when it's invalid)
     * @param {ValidationResult} result - the result to render
     * @returns {ReactComponent} a representation of the validation errors
     */
    private _renderValidationResult(result: any): React.ReactElement<any> {
        if (result.valid) {
            return null;
        }

        return (
            <ValidationResult
                ref='propValidationResult'
                result={result}
            />
        );
    }

    /**
     * obvious
     * @returns {ReactComponent} the rendered component
     */
    public render(): React.ReactElement<any> {
        return (
            <Grid className='cy-bunsen' fluid={true}>
                {this._renderValidationResult(this.state.propValidationResult)}
                {this._renderForm()}
            </Grid>
        );
    }
}
