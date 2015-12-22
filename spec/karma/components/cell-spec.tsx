/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react/addons';
import {CellComponent} from '../../../src/components';
import {model, view, renderers} from './common';

const TestUtils = React.addons.TestUtils;

describe('CellComponent', () => {
    let store;

    beforeEach(() => {
        store = {
            formValue: {},
            renderers,
            view,
        };
    });

    describe('input cell', () => {
        let changeHandler, cellConfig, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfig = view.containers[1].rows[0][0]; // name.first
            component = TestUtils.renderIntoDocument(
                <CellComponent
                    config={cellConfig}
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the input', () => {
            expect(component.refs.input).to.be.defined;
        });

        it('assigns proper id to the input', () => {
            expect(component.refs.input.props.id).to.be.equal('name.first');
        });

        it('passes along the model to the input', () => {
            expect(component.refs.input.props.model).deep.equal(model.properties.name.properties.first);
        });

        it('passes along the react key', () => {
            expect(component.refs.input.props.reactKey).to.be.equal('my-key');
        });

        it('wires up onChange', () => {
            component.refs.input.props.onChange('change-event');
            expect(changeHandler).to.be.calledWith('change-event');
        });
    });

    describe('container cell', () => {
        let changeHandler, cellConfig, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfig = view.containers[0].rows[0][0]; // name
            component = TestUtils.renderIntoDocument(
                <CellComponent
                    config={cellConfig}
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the container', () => {
            expect(component.refs.container).to.be.defined;
        });

        it('passes along the model to the container', () => {
            expect(component.refs.container.props.model).deep.equal(model);
        });

        it('passes along the react key', () => {
            expect(component.refs.container.props.reactKey).to.be.equal('my-key');
        });

        it('wires up onChange', () => {
            component.refs.container.props.onChange('change-event');
            expect(changeHandler).to.be.calledWith('change-event');
        });

        it('passes along the renderers to the container', () => {
            expect(component.refs.container.props.store.renderers).to.equal(renderers);
        });
    });

    describe('model container cell', () => {
        let changeHandler, cellConfig, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfig = view.containers[0].rows[2][0]; // name model
            component = TestUtils.renderIntoDocument(
                <CellComponent
                    config={cellConfig}
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the container', () => {
            expect(component.refs.model).to.be.defined;
        });

        it('passes along the model to the model container', () => {
            expect(component.refs.model.props.model).deep.equal(model.properties.name);
        });

        it('passes along the react key', () => {
            expect(component.refs.model.props.reactKey).to.be.equal('my-key');
        });

        it('wires up onChange', () => {
            component.refs.model.props.onChange('change-event');
            expect(changeHandler).to.be.calledWith('change-event');
        });

        it('passes along the renderers to the model', () => {
            expect(component.refs.model.props.store.renderers).to.equal(renderers);
        });
    });

    describe('array container cell', () => {
        let changeHandler, cellConfig, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfig = view.containers[0].rows[1][0]; // addresses
            component = TestUtils.renderIntoDocument(
                <CellComponent
                    config={cellConfig}
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the container', () => {
            expect(component.refs.array).to.be.defined;
        });

        it('passes along the model to the array container', () => {
            expect(component.refs.array.props.model).deep.equal(model.properties.addresses);
        });

        it('passes along the cell config to the array container', () => {
            expect(component.refs.array.props.cellConfig).deep.equal(cellConfig);
        });

        it('passes along the react key', () => {
            expect(component.refs.array.props.reactKey).to.be.equal('my-key');
        });

        it('passes along the item label', () => {
            expect(component.refs.array.props.cellConfig.item.label).to.be.equal('Addr');
        });

        it('wires up onChange', () => {
            component.refs.array.props.onChange('change-event');
            expect(changeHandler).to.be.calledWith('change-event');
        });

        it('passes along the renderers to the array container', () => {
            expect(component.refs.array.props.store.renderers).to.equal(renderers);
        });
    });

    describe('custom cell', () => {
        let changeHandler, cellConfig, component;
        beforeEach(() => {
            changeHandler = sinon.spy();
            cellConfig = view.containers[0].rows[3][0]; // custom name
            component = TestUtils.renderIntoDocument(
                <CellComponent
                    config={cellConfig}
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-key'
                    store={store}
                />
            );
        });

        it('renders the custom component', () => {
            expect(component.refs.input).to.be.defined;
        });

        it('assigns proper id to the renderer', () => {
            expect(component.refs.input.props.id).to.be.equal('name');
        });

        it('passes along the model to the custom renderer', () => {
            expect(component.refs.input.props.model).deep.equal(model.properties.name);
        });

        it('passes along the react key', () => {
            expect(component.refs.input.props.reactKey).to.be.equal('my-key');
        });

        it('passes along the label', () => {
            expect(component.refs.input.props.cellConfig.label).to.be.equal('Custom Name');
        });

        it('wires up onChange', () => {
            component.refs.input.props.onChange('change-event');
            expect(changeHandler).to.be.calledWith('change-event');
        });
    });
});
