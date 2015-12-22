/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

const _ = require('lodash');
import validate from '../../../src/validator';
const viewSchema = require('../../../src/validator/view-schema.json');
const readmeContents = require('!!raw!../../../README.md');

const missingReqAttrs = require('./fixtures/invalid/missing-required-attributes.json');
const invalidTypeVersion = require('./fixtures/invalid/invalid-type-version.json');
const simpleFormConfig = require('./fixtures/simple-form.json');
const simpleFormModel = require('./fixtures/simple-form-model.json');
const badContainers = require('./fixtures/invalid/bad-containers.json');

describe('validator', () => {
    let result;

    describe('README.md view schema', () => {
        let readmeSchema;
        beforeEach(() => {
            const lines = readmeContents.split('\n');
            let startIndex = lines.indexOf('<!-- BEGIN view-schema.json -->') + 1;
            let endIndex = lines.indexOf('<!-- END view-schema.json -->');
            const trimmedLines = lines.slice(startIndex, endIndex);
            startIndex = trimmedLines.indexOf('```json') + 1;
            endIndex = trimmedLines.indexOf('```');
            const jsonLines = trimmedLines.slice(startIndex, endIndex);

            readmeSchema = JSON.parse(jsonLines.join('\n'));
        });

        it('matches the schema used by the code', () => {
            expect(readmeSchema).deep.equal(viewSchema);
        });
    });

    describe('.validate()', () => {

        describe('when valid', () => {
            beforeEach(() => {
                result = validate(simpleFormConfig, simpleFormModel);
            });

            it('validates', () => {
                expect(result).to.eql({
                    valid: true,
                    errors: [],
                    warnings: [],
                });
            });
        });

        describe('when required attributes are missing', () => {
            beforeEach(() => {
                result = validate(missingReqAttrs, simpleFormModel);
            });

            it('fails validation', () => {
                expect(result.valid).to.be.false;
            });

            it('reports missing "version"', () => {
                expect(result.errors).to.containSubset([
                    {
                        message: 'Field is required.',
                        path: '#/version',
                    },
                ]);
            });

            it('reports missing "type"', () => {
                expect(result.errors).to.containSubset([
                    {
                        message: 'Field is required.',
                        path: '#/type',
                    },
                ]);
            });

            it('reports missing "containers"', () => {
                expect(result.errors).to.containSubset([
                    {
                        message: 'Field is required.',
                        path: '#/containers',
                    },
                ]);
            });

            it('reports missing "rootContainers"', () => {
                expect(result.errors).to.containSubset([
                    {
                        message: 'Field is required.',
                        path: '#/rootContainers',
                    },
                ]);
            });
        });

        describe('when version and type are invalid', () => {
            beforeEach(() => {
                result = validate(invalidTypeVersion, simpleFormModel);
            });

            it('fails validation', () => {
                expect(result.valid).to.be.false;
            });

            it('gives error message for invalid "version"', () => {
                expect(result.errors).to.containSubset([
                    {
                        path: '#/version',
                        message: 'No enum match for: 0.1',
                    },
                ]);
            });

            it('gives error message for invalid "type"', () => {
                expect(result.errors).to.containSubset([
                    {
                        path: '#/type',
                        message: 'No enum match for: my-custom-type',
                    },
                ]);
            });
        });

        describe('when rootContainers are bad', () => {
            let badRootContainers;
            beforeEach(() => {
                badRootContainers = _.cloneDeep(require('./fixtures/invalid/bad-root-containers.json'));
            });

            it('when too many root containers', () => {
                result = validate(badRootContainers, simpleFormModel);
                expect(result.errors).to.containSubset([
                    {
                        path: '#/rootContainers',
                        message: 'Array is too long (3), maximum 1',
                    },
                ]);
            });

            it('when missing "label"', () => {
                badRootContainers.rootContainers = [badRootContainers.rootContainers[1]];
                result = validate(badRootContainers, simpleFormModel);
                expect(result.errors).to.containSubset([
                    {
                        path: '#/rootContainers/0/label',
                        message: 'Field is required.',
                    },
                ]);
            });

            it('when invalid "container"', () => {
                badRootContainers.rootContainers = [badRootContainers.rootContainers[2]];
                result = validate(badRootContainers, simpleFormModel);
                expect(result.errors).to.containSubset([
                    {
                        path: '#/rootContainers/0',
                        message: 'Invalid value "baz" for "container" Valid options are ["foo","bar"]',
                    },
                ]);
            });
        });

        describe('when container is bad', () => {
            beforeEach(() => {
                result = validate(badContainers, simpleFormModel);
            });

            it('fails validation', () => {
                expect(result.valid).to.be.false;
            });

            it('gives error message for missing "rows"', () => {
                expect(result.errors).to.containSubset([
                    {
                        path: '#/containers/1/rows',
                        message: 'Field is required.',
                    },
                ]);
            });
        });
    });
});
