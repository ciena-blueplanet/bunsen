/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import {validateSubModel} from '../../../src/validator/model';

describe('model validator', () => {
    let model, result;
    describe('validateSubModel()', () => {

        describe('when valid', () => {
            beforeEach(() => {
                model = {
                    type: 'string',
                    title: 'First Name',
                };
                result = validateSubModel('#/properties/firstName', model);
            });

            it('returns proper result', () => {
                expect(result).to.eql({
                    valid: true,
                    errors: [],
                    warnings: [],
                });
            });
        });

        describe('when type is wrong', () => {
            beforeEach(() => {
                model = {
                    type: 'foo-bar'
                };
                result = validateSubModel('#/properties/firstName', model);
            });

            it('returns proper result', () => {
                const errorMsg = 'Invalid value "foo-bar" for "type" Valid options are ' +
                    '["string","object","array","number","boolean"]';

                expect(result).to.eql({
                    valid: false,
                    errors: [
                        {
                            path: '#/properties/firstName',
                            message: errorMsg,
                        },
                    ],
                    warnings: [],
                });
            });
        });
    });
});
