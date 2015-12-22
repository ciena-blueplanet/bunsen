/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import {getModelPath, removeProperty} from '../../src/utils';

describe('utils', () => {
    describe('.removeProperty()', () => {
        let obj: any;
        beforeEach(() => {
            obj = {
                name: {
                    first: 'Steve',
                    last: 'Rogers',
                },
                team: 'Avengers',
            };
        });

        it('removes top-level properties', () => {
            removeProperty(obj, 'team');
            expect(obj).deep.equal({
                name: {
                    first: 'Steve',
                    last: 'Rogers',
                },
            });
        });

        it('removes lower-level properties', () => {
            removeProperty(obj, 'name.last');
            expect(obj).deep.equal({
                name: {
                    first: 'Steve'
                },
                team: 'Avengers',
            });
        });

        it('gracefully handles missing properties', () => {
            delete obj.name;
            removeProperty(obj, 'name.last');
            expect(obj).deep.equal({
                team: 'Avengers'
            });
        });
    });

    describe('getModelPath()', () => {

        it('handles top-level properties', () => {
            expect(getModelPath('fooBar')).to.be.equal('properties.fooBar');
        });

        it('handles nested properties', () => {
            expect(getModelPath('foo.bar.baz')).to.be.equal('properties.foo.properties.bar.properties.baz');
        });

        it('handles invalid trailing dot reference', () => {
            expect(getModelPath('foo.bar.')).to.be.equal(undefined);
        });

        it('handles invalid leading dot reference', () => {
            expect(getModelPath('.foo.bar')).to.be.equal(undefined);
        });

        it('handles model with dependency', () => {
            const expected = 'dependencies.useEft.properties.routingNumber';
            expect(getModelPath('routingNumber', 'useEft')).to.be.equal(expected);
        });

        it('handles model with dependency', () => {
            const expected = 'properties.paymentInfo.dependencies.useEft.properties.routingNumber';
            expect(getModelPath('paymentInfo.routingNumber', 'paymentInfo.useEft')).to.be.equal(expected);
        });
    });
});
