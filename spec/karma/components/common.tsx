/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable react/no-multi-comp */

const $ = require('jquery');
import * as React from 'react/addons';

export const renderers = {
    'NameRenderer': React.createClass({
        displayName: 'NameRenderer',
        render(): React.ReactElement<ant> {
            return (
                <div className='stub NameRenderer' />
            );
        },
    }),
    'AddressRenderer': React.createClass({
        displayName: 'AddressRenderer',
        render(): React.ReactElement<any> {
            return (
                <div className='stub AddressRenderer' />
            );
        },
    }),
};

export const model = require('../fixtures/valid-model.json');
export const view = require('../fixtures/valid-view.json');

/**
 * Simulate a click on the element at the given selector
 * @param {String} selector - the jQuery selector
 * @param {jQuery} $scope - the scope object
 */
export function clickElement(selector: string, $scope: any): void {
    const element = $(selector, $scope).get(0);
    React.addons.TestUtils.Simulate.click(element);
}

