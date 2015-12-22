/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const Q = require('q');

import 'cy-bunsen/src/typedefs';

/**
 * Validate that the given name is proper
 * @param {Object} value - the value to validate
 * @returns {Q.Promise} a promise resolved with a ValidationResult
 */
export function validateName(value: any): any {
    const errors = [];
    const fullName = `${value.firstName} ${value.lastName}`;
    if ((fullName === 'John Doe') || (fullName === 'Jane Doe')) {
        const errorMessage = 'Nice Try! What is your real name?';

        errors.push({
            path: '#/firstName',
            message: errorMessage,
        });

        errors.push({
            path: '#/lastName',
            message: errorMessage,
        });
    }

    const result = {
        valid: errors.length === 0,
        errors,
        warnings: [],
    };

    return Q(result); // eslint-disable-line new-cap
}
