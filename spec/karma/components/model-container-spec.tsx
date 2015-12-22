/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react/addons';
import {ModelContainerComponent} from '../../../src/components';
import {model, view, renderers} from './common';

const TestUtils = React.addons.TestUtils;

xdescribe('ModelContainerComponent', () => {
    let store;

    beforeEach(() => {
        store = {
            formValue: {},
            renderers,
            view,
        };
    });

    describe('after rendering (with label)', () => {
        let component, changeHandler, cellConfig;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfig = {model: 'container-config'};
            component = TestUtils.renderIntoDocument(
                <ModelContainerComponent
                    cellConfig={cellConfig}
                    id='foo.bar'
                    model={model}
                    onChange={changeHandler}
                    reactKey='foo-bar'
                    store={store}
                />
            );
        });

        it('gives the toggle panel the proper title', () => {
            expect(component.refs.togglePanel.props.title).to.be.equal('Bar');
        });

        it('renders the container', () => {
            expect(component.refs.container).to.be.defined;
        });

        it('passes along the view to the container', () => {
            expect(component.refs.container.props.store.view).deep.equal(view);
        });

        it('passes along the model to the container', () => {
            expect(component.refs.container.props.model).deep.equal(model);
        });

        it('passes along the cell config to the container', () => {
            expect(component.refs.container.props.cellConfig).deep.equal(cellConfig);
        });

        describe('when container changes', () => {
            let changeEvent;
            beforeEach(() => {
                changeEvent = {
                    id: 'baz',
                    value: '12345',
                };
                component.refs.container.props.onChange(changeEvent);
            });

            it('passes up the change event, with same id', () => {
                expect(changeHandler).to.be.calledWith({
                    id: 'baz',
                    value: '12345',
                });
            });
        });
    });
});
