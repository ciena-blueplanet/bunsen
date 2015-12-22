/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import {getDefaultView} from '../../../src/generator';

const simpleModel = require('./fixtures/simple-model.json');
const simpleView = require('./fixtures/simple-view.json');
const arrayModel = require('./fixtures/array-model.json');
const arrayView = require('./fixtures/array-view.json');
const dependenciesModel = require('./fixtures/dependencies-model.json');
const dependenciesView = require('./fixtures/dependencies-view.json');

describe('getDefaultView()', () => {
    let result;
    describe('simple schema', () => {
        beforeEach(() => {
            result = getDefaultView(simpleModel);
        });

        it('creates proper simple layout', () => {
            expect(result).deep.equal(simpleView);
        });
    });

    describe('array schema', () => {
        beforeEach(() => {
            result = getDefaultView(arrayModel);
        });

        it('creates proper array layout', () => {
            expect(result).deep.equal(arrayView);
        });
    });

    describe('dependencies schema', () => {
        beforeEach(() => {
            result = getDefaultView(dependenciesModel);
        });

        it('creates proper dependencies layout', () => {
            expect(result).deep.equal(dependenciesView);
        });
    });
});
