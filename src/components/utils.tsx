/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../typedefs';
const _ = require('lodash');
import {getSubModel, getModelPath} from '../utils';
import {getCellDefaults} from '../validator/defaults';
import {getPath} from '../dereference';

export interface BunsenComponentProps {
    cellConfig?: any;
    formValue?: any;
    id?: string;
    initialValue?: any;
    key?: string;
    label?: string;
    model?: any;
    onChange?: any;
    reactKey?: any;
    readOnly?: boolean;
    ref?: string;
    required?: boolean;
    store?: any;
}

/**
 * @class ComponentMixin
 * Some common helper functions available to all components that have the
 * following common properties (which all should have):
 * ctx.props.form.view, ctx.props.store, ctx.props.model, ctx.props.cellConfig
 */
export default {
    /**
     * Fetch a container config from the view based on ID
     * @param {Object} ctx - context
     * @param {String} id - the unique ID of the container
     * @returns {Container} the config for the container
     */
    getContainerConfig(ctx: any, id: string): any {
        return _.find(ctx.props.store.view.containers, {id});
    },

    /**
     * Get the ReactClass for a custom renderer
     * @param {Object} ctx - context
     * @param {String} name - the name of the renderer
     * @returns {ReactClass} the class for the renderer
     */
    getRenderer(ctx: any, name: string): any {
        return ctx.props.store.renderers[name];
    },

    /**
     * Convert the user-friendly path to a real path (including '.properties.') and use
     * that to fetch the sub model from the parent model
     * @param {Object} ctx - context
     * @param {String} reference - the reference to fetch
     * @param {String} [dependencyReference] - the dotted reference to the model dependency (if any)
     * @returns {Model} the sub model object
     */
    getSubModel(ctx: any, reference: string, dependencyReference: string): any {
        return getSubModel(ctx.props.model, reference, dependencyReference);
    },

    /**
     * Get the parent model object of the given path.
     * @param {Object} ctx - context
     * @param {String} reference - the reference to fetch
     * @param {String} [dependencyReference] - the dotted reference to the model dependency (if any)
     * @returns {Model} the parent model object
     */
    getParentModel(ctx: any, reference: string, dependencyReference: string): any {
        const path = getModelPath(reference, dependencyReference);
        const parentPath = path.split('.').slice(0, -2).join('.'); // skip back past property name and 'properties'
        return (parentPath) ? _.get(ctx.props.model, parentPath) : ctx.props.model;
    },

    /**
     * Check the parent model to see if the model in question is required
     * @param {Object} ctx - context
     * @param {String} reference - the reference to fetch
     * @param {String} [dependencyReference] - the dotted reference to the model dependency (if any)
     * @returns {Boolean} true if  the object at the given path is required
     */
    isRequired(ctx: any, reference: string, dependencyReference: string): boolean {
        const parentModel = this.getParentModel(ctx, reference, dependencyReference);
        const propertyName = reference.split('.').pop();
        return _.includes(parentModel.required, propertyName);
    },

    /**
     * Get the cell config, with defaults filled in
     * @param {Object} ctx - context
     * @returns {Cell} the default-filled cell config
     */
    getCellConfig(ctx: any): any {
        return _.defaults({}, ctx.props.cellConfig, getCellDefaults());
    },

    /**
     * Go through validation errors, looking for those that are relevent for me and aggregate the messages
     * @param {Object} ctx - context
     * @param {ValidationError[]} [errors] - the errors to check (or ctx.props.store.validationResult.errors)
     * @returns {String} the aggregated error message
     */
    getErrorMessage(ctx: any, errors?: Array<any>): string {
        const allErrors = errors || _.get(ctx.props.store, 'validationResult.errors', []);

        const relevantErrors = _.filter(allErrors, (error: any) => {
            return ctx.props.id === getPath(error.path);
        });

        return _.pluck(relevantErrors, 'message').join('\n');
    },
}
