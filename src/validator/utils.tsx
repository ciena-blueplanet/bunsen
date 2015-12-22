/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../typedefs';

const _ = require('lodash');

/**
 * Validate a given required attribute (identified by path)
 * @param {Object} object - the object to validate
 * @param {String} path - the path to the given object in the schema
 * @param {String} attribute - the name of the required attribute on object
 * @param {Object[]} [possibleValues] - the possible values for the attribute
 * @returns {ValidationResult} any errors found
 */
export function validateRequiredAttribute(object: any, path: string, attribute: string, possibleValues?: Array<any>): any {
    const errors = [];

    const value = _.get(object, attribute);

    if (value === undefined) {
        errors.push({
            path,
            message: `Missing required attribute "${attribute}"`,
        });
    } else if (possibleValues !== undefined && !_.includes(possibleValues, value)) {
        let message = `Invalid value "${value}" for "${attribute}" `;
        message += `Valid options are ${JSON.stringify(possibleValues)}`;
        errors.push({path, message});
    }

    return {
        errors,
        warnings: [],
        valid: errors.length === 0,
    };
}

/**
 * Aggregate an array of ValidationResults into a single one
 * @param {ValidationResult[]} results - the array of individual results
 * @returns {ValidationResult} the aggregated result
 */
export function aggregateResults(results: Array<any>): any {

    const result: any = {
        errors: _(results).pluck('errors').flatten().compact().value(),
        warnings: _(results).pluck('warnings').flatten().compact().value(),
    };

    result.valid = (result.errors.length === 0);

    return result;
}

/**
 * Add an error result to the given array of ValidationResults
 * @param {ValidationResult[]} results - the Array to mutate
 * @param {String} path - the path for the ValidationError to add
 * @param {String} message - the mesage for the ValidationError to add
 */
export function addErrorResult(results: Array<any>, path: string, message: string): void {
    if (path === undefined) {
        throw new Error('path is required');
    }
    results.push({
        valid: false,
        errors: [{path, message}],
        warnings: [],
    });
}

/**
 * Add a warning result to the given array of ValidationResults
 * @param {ValidationResult[]} results - the Array to mutate
 * @param {String} path - the path for the ValidationWarning to add
 * @param {String} message - the mesage for the ValidationWarning to add
 */
export function addWarningResult(results: Array<any>, path: string, message: string): void {
    results.push({
        valid: true,
        errors: [],
        warnings: [{path, message}],
    });
}

/**
 * Validate the JSON string vs. the parsed JSON object
 * This will allow us to detect things like duplicate keys which would otherwise go unnoticed
 * @param {String} jsonStr - the raw JSON string
 * @param {Object} jsonObj - the parsed JSON object
 * @returns {ValidationResult} the result of validating the JSON string
 */
export function validateJsonString(jsonStr: string, jsonObj: any): any {
    const result = {
        valid: true,
        errors: [],
        warnings: [],
    };

    const entered = jsonStr.replace(/\t/g, '    ');
    const stringified = JSON.stringify(jsonObj, null, 4);
    if (entered.length !== stringified.length) {
        result.warnings.push({
            path: '',
            message: 'The parsed JSON did not equal the entered JSON. You may have a duplicate key, etc.',
        });
    }

    return result;
}

/**
 *  Make sure passed json is a parsed JSON object, and validate it if not
 * @param {String|Object} json - the JSON string or object
 * @returns {[Object, ValidationResult]} the JSON object (or undefined on error) and the validation result
 */
export function ensureJsonObject(json: any): Array<any> {
    let strResult = null;
    if (_.isString(json)) {
        const jsonStr = json;
        try {
            json = JSON.parse(jsonStr);
            strResult = validateJsonString(jsonStr, json);
        } catch (e) {
            return [
                undefined,
                {
                    valid: false,
                    errors: [{path: '', message: 'Invalid JSON'}],
                    warnings: [],
                },
            ];
        }
    }

    return [json, strResult];
}

