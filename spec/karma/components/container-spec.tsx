/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react/addons';
import {ContainerComponent} from '../../../src/components';
import {model, view, renderers} from './common';

const TestUtils = React.addons.TestUtils;

describe('ContainerComponent', () => {
    let store;

    beforeEach(() => {
        store = {
            formValue: {},
            renderers,
            view,
        };
    });

    describe('after render', () => {
        let changeHandler, containerConfig, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            containerConfig = view.containers[1];
            component = TestUtils.renderIntoDocument(
                <ContainerComponent
                    cellConfig={{container: containerConfig.id}}
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the second row', () => {
            expect(component.refs['row-1']).to.be.defined;
        });

        it('passes along the react key to second row', () => {
            expect(component.refs['row-1'].props.reactKey).deep.equal('my-key-row-1');
        });

        it('passes the cell configs to second row', () => {
            expect(component.refs['row-1'].props.cellConfigs).deep.equal(containerConfig.rows[1]);
        });

        it('passes along change events from second row', () => {
            component.refs['row-1'].props.onChange('some-other-event');
            expect(changeHandler).to.be.calledWith('some-other-event');
        });

        it('passes along the view to the second row', () => {
            expect(component.refs['row-1'].props.store.view).deep.equal(view);
        });

        it('passes along the model to the second row', () => {
            expect(component.refs['row-1'].props.model).deep.equal(model);
        });
    });
});
