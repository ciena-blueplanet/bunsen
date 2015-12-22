/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import PropertyChooser from '../components/renderers/property-chooser';
import dereference from '../dereference';
import {aggregateResults, ensureJsonObject, addWarningResult, validateRequiredAttribute} from './utils';
import containerValidatorFactory from './container';
import {default as validateValue} from './value';

const viewSchema = require('./view-schema.json');

const builtinRenderers = {
    PropertyChooser: PropertyChooser
};

/**
 * Make sure the rootContainers (if specified) are valid
 * @param {View} view - the schema to validate
 * @param {Model} model - the JSON schema that the containers will reference
 * @param {ContainerValidator} containerValidator - the validator instance for a container in the current view
 * @returns {ValidationResult} the result of validating the rootContainers
 */
function _validateRootContainers(view: any, model: any, containerValidator: any): any {

    // We should already have the error for it not existing at this point, so just fake success
    // this seems wrong, but I'm not sure of a better way to do it - ARM
    if (!view.rootContainers) {
        return {
            valid: true,
            errors: [],
            warnings: [],
        };
    }

    const results = _.map(view.rootContainers, (rootContainer: any, index: number) => {
        const path: string = `#/rootContainers/${index}`;
        const containerId = rootContainer.container;
        const containerIndex = _.findIndex(view.containers, {id: containerId});
        const container = view.containers[containerIndex];
        const containerPath: string = `#/containers/${containerIndex}`;
        const rootContainerResults = [
            validateRequiredAttribute(rootContainer, path, 'label'),
            validateRequiredAttribute(rootContainer, path, 'container', _.pluck(view.containers, 'id')),
        ];

        if (container !== undefined) {
            rootContainerResults.push(
                containerValidator.validate(containerPath, container)
            );
        }

        return aggregateResults(rootContainerResults);
    });

    return aggregateResults(results);
}

/**
 * Validate the root attributes of the view
 * @param {View} view - the view to validate
 * @param {Model} model - the JSON schema that the containers will reference
 * @param {ContainerValidator} containerValidator - the validator instance for a container in the current view
 * @returns {ValidationResult} any errors found
 */
function _validateRootAttributes(view: any, model: any, containerValidator: any): any {
    const results = [
        _validateRootContainers(view, model, containerValidator)
    ];

    const knownAttributes = ['version', 'type', 'rootContainers', 'containers'];
    const unknownAttributes = _.difference(_.keys(view), knownAttributes);
    results.push({
        valid: true,
        errors: [],
        warnings: _.map(unknownAttributes, (attr: string) => {
            return {
                path: '#',
                message: `Unrecognized attribute "${attr}"`,
            };
        }),
    });

    return aggregateResults(results);
}

/**
 * Validate the given view
 * @param {String|View} view - the view to validate (as an object or JSON string)
 * @param {Model} model - the JSON schema that the containers will reference
 * @param {String[]} renderers - the list of available custom renderers to validate renderer references against
 * @returns {ValidationResult} the results of the view validation
 */
export default function validate(view: any, model: any, renderers: Array<string> = Object.keys(builtinRenderers)): any {
    let strResult = null;
    [view, strResult] = ensureJsonObject(view);

    if (view === undefined) {
        return {
            valid: false,
            errors: [{path: '#', message: 'Invalid JSON'}],
            warnings: [],
        };
    }

    if (model === undefined) {
        return {
            valid: false,
            errors: [{path: '#', message: 'Invalid Model'}],
            warnings: [],
        };
    }

    const derefModel = dereference(model).schema;

    const containerValidator = containerValidatorFactory(view.containers, derefModel, renderers);

    const schemaResult = validateValue(view, viewSchema, true);
    if (!schemaResult.valid) {
        return schemaResult;
    }

    const results = [
        schemaResult,
        _validateRootAttributes(view, derefModel, containerValidator),
    ];

    const allContainerPaths = _.map(view.containers, (container: any, index: number) => {
        return `#/containers/${index}`;
    });

    const validatedPaths = containerValidator.containersValidated;
    const missedPaths = _.difference(allContainerPaths, validatedPaths);
    missedPaths.forEach((path: string) => {
        addWarningResult(results, path, 'Unused container was not validated');
    });

    if (strResult !== null) {
        results.push(strResult);
    }

    return aggregateResults(results);
}

// convenience exports so everything can be consumed from this entry point
export {default as validateModel} from './model';
export {default as validateValue} from './value';
