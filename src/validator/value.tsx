/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const VSchema = require('z-schema');

const schemaValidator = new VSchema({
    breakOnFirstError: false
});

/**
 * Go through the errors and convert any 'Missing required property' errors
 * @param {ValidationError[]} errors - the list of errors which will be updated in-place
 * @returns {ValidationError[]} the mutated array
 */
function translateMissingRequiredPropertyErrors(errors: Array<any>): Array<any> {
    errors.forEach((error: any) => {
        const {path, message} = error;

        if (message.indexOf('Missing required property:') === 0) {
            const property = message.split(':').pop().trim();
            error.message = 'Field is required.';
            const parent = path;
            const trailingSlash = (parent.split('').pop() === '/') ? '' : '/';
            error.path = `${parent}${trailingSlash}${property}`;
        }
    });

    return errors;
}

/**
 * Validate the given value against it's schema
 * @param {*} value - the view to validate (as an object or JSON string)
 * @param {Model} model - the JSON schema to validate against
 * @param {Boolean} [required] - if true, value must be present
 * @returns {ValidationResult} the results of the value validation
 */
export default function validate(value: any, model: any, required?: boolean): any {
    if (value === '') {
        if (required) {
            return {
                valid: false,
                errors: [
                    {
                        path: '',
                        message: 'Field is required.',
                    },
                ],
            };
        } else {
            return {
                valid: true,
                errors: [],
            };
        }
    }

    const valid = schemaValidator.validate(value, model);
    return {
        valid,
        errors: valid ? [] : translateMissingRequiredPropertyErrors(schemaValidator.getLastErrors()),
        warnings: [],
    };
}
