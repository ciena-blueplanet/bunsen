/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

import {aggregateResults, validateRequiredAttribute} from '../../../src/validator/utils';

describe('utils', () => {
    describe('validateRequiredAttribute()', () => {
        let object, result;

        describe('when valid', () => {
            beforeEach(() => {
                object = {
                    foo: 'bar'
                };
                result = validateRequiredAttribute(object, 'path.to.object', 'foo', ['bar', 'baz']);
            });

            it('validates', () => {
                expect(result).to.eql({
                    valid: true,
                    errors: [],
                    warnings: [],
                });
            });
        });

        describe('when attribute is missing', () => {
            beforeEach(() => {
                object = {
                    bar: 'baz'
                };
                result = validateRequiredAttribute(object, 'path.to.object', 'foo', ['bar', 'baz']);
            });

            it('returns invalid', () => {
                expect(result.valid).to.be.false;
            });

            it('returns appropriate error', () => {
                expect(result.errors).to.have.length(1);
                expect(result.errors).to.containSubset([
                    {
                        message: 'Missing required attribute "foo"',
                        path: 'path.to.object',
                    },
                ]);
            });
        });

        describe('when attribute is invalid', () => {
            beforeEach(() => {
                object = {
                    foo: 'baz'
                };
                result = validateRequiredAttribute(object, 'path.to.object', 'foo', ['bar']);
            });

            it('returns invalid', () => {
                expect(result.valid).to.be.false;
            });

            it('returns appropriate error', () => {
                expect(result.errors).to.containSubset([
                    {path: 'path.to.object', message: 'Invalid value "baz" for "foo" Valid options are ["bar"]'}
                ]);
            });
        });
    });

    describe('aggregateResults()', () => {
        let results, result;
        beforeEach(() => {
            results = [
                {
                    errors: [],
                    valid: true,
                    warnings: ['warning-1', 'warning-2'],
                },
                {
                    errors: ['error-1', 'error-2'],
                    valid: false,
                    warnings: [],
                },
                {
                    errors: [],
                    valid: true,
                    warnings: ['warning-3'],
                },
            ];

            result = aggregateResults(results);
        });

        it('properly aggregates everything', () => {
            expect(result).to.containSubset({
                errors: ['error-1', 'error-2'],
                valid: false,
                warnings: ['warning-1', 'warning-2', 'warning-3'],
            });
        });
    });
});
