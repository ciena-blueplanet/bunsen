/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import './typedefs';

const _ = require('lodash');

/**
 * Get the user-visible label from the model instance
 * @param {String} label - the label override from the view
 * @param {Model} model - the model (to get title from if present)
 * @param {String} id - the dotted refeference to this object
 * @returns {String} the user-visible label
 */
export function getLabel(label: string, model: any, id: string): string {
    const idLabel = (id) ? _.startCase(id.split('.').slice(-1)[0]) : '';
    return `${label || model.title || idLabel}`;
}

/**
 * Remove the property at the given path in the given object
 * @param {Object} obj - the object to modify
 * @param {String} path - the dotted path to the property to delete (i.e. foo.bar.baz)
 */
export function removeProperty(obj: any, path: string): void {
    if (path.indexOf('.') === -1) {
        delete obj[path];
    } else {
        const parts: any = path.split('.');
        const parentPath: string = parts.slice(0, -1).join('.');
        const property: string = parts.slice(-1);
        const parent: any = _.get(obj, parentPath);
        if (parent) {
            delete parent[property];
        }
    }
}

/**
 * Convert a model reference to a proper path in the model schema
 *
 * hero.firstName => hero.attributes.firstName
 * foo.bar.baz => foo.attributes.bar.attributes.baz
 *
 * Leading or trailing '.' mess up our trivial split().join() and aren't valid anyway, so we
 * handle them specially, undefined being passed into _.get() will yield undefined, and display
 * the error we want to display when the model reference is invalid, so we return undefined
 *
 * hero. => undefined
 * .hero => undefined
 *
 * @param {String} reference - the dotted reference to the model
 * @param {String} [dependencyReference] - the dotted reference to the model dependency
 * @returns {String} the proper dotted path in the model schema (or undefined if it's a bad path)
 */
export function getModelPath(reference: string, dependencyReference: string): string {
    const pattern = /^[^\.](.*[^\.])?$/;
    let path =  pattern.test(reference) ? `properties.${reference.split('.').join('.properties.')}` : undefined;

    if (dependencyReference) {
        const dependencyName = dependencyReference.split('.').pop();
        const pathArr = path.split('.');
        pathArr.splice(-2, 0, 'dependencies', dependencyName);
        path = pathArr.join('.');
    }

    return path;
}

/**
 * Get the sub-model for a given dotted reference
 * @param {Model} model - the starting model
 * @param {String} reference - the reference to fetch
 * @param {String} [dependencyReference] - the dotted reference to the model dependency (if any)
 * @returns {Model} the sub-model
 */
export function getSubModel(model: any, reference: string, dependencyReference?: string): any {
    const path = getModelPath(reference, dependencyReference);
    return _.get(model, path);
}

/**
 * Figure out an initial value based on existing value, initialValue, and model
 * @param {String} id - the dotted path to this value in the formValue
 * @param {Object} formValue - the existing value of the whole form
 * @param {*} initialValue - the initialValue passed in to the component
 * @param {Object} model - the model to check for a default value in
 * @param {*} defaultValue - the default value to use if no other defaults are found
 * @returns {*} the initial value
 */
export function getInitialValue(id: string, formValue: any, initialValue: any, model: any, defaultValue: any = ''): any {
    const values = [_.get(formValue, id), initialValue, model['default']];
    const value = _.find(values, (val: any) => val !== undefined);

    if (value !== undefined) {
        return value;
    }

    return defaultValue;
}
