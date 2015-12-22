/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react/addons';
import {RowComponent} from '../../../src/components';
import {model, view, renderers} from './common';

const TestUtils = React.addons.TestUtils;

xdescribe('RowComponent', () => {
    let store;

    beforeEach(() => {
        store = {
            formValue: {},
            renderers,
            view,
        };
    });

    describe('after render', () => {
        let changeHandler, cellConfigs, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfigs = view.containers[2].rows[1]; // city,state,zip
            component = TestUtils.renderIntoDocument(
                <RowComponent
                    cellConfigs={cellConfigs}
                    defaultClassName='foo-bar'
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the second cell', () => {
            expect(component.refs['cell-1']).to.be.defined;
        });

        it('passes along the react key to second cell', () => {
            expect(component.refs['cell-1'].props.reactKey).deep.equal('my-key-1');
        });

        it('passes the cell configs to second cell', () => {
            expect(component.refs['cell-1'].props.config).deep.equal(cellConfigs[1]);
        });

        it('passes along change events from second cell', () => {
            component.refs['cell-1'].props.onChange('some-event');
            expect(changeHandler).to.be.calledWith('some-event');
        });

        it('passes along the default class name to the second cell', () => {
            expect(component.refs['cell-1'].props.defaultClassName).to.be.equal('foo-bar');
        });

        it('passes along the view to the second cell', () => {
            expect(component.refs['cell-1'].props.store.view).deep.equal(view);
        });

        it('passes along the model to the second cell', () => {
            expect(component.refs['cell-1'].props.model).deep.equal(model);
        });
    });
});
