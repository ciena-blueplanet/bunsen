/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react';
import BunsenInput from '../../../../src/components/input';
import {renderers} from '../common';

const TestUtils = React.addons.TestUtils;

/**
 * Shared spec to verify proper props are passed to the underlying input
 * @param {Object} ctx - the context object
 * @param {Object} ctx.ref - the ref for the real input
 * @param {String} ctx.inputType - the string name of the component that should be rendered
 * @param {Object} ctx.cellConfig - the parent cell config
 * @param {Object} ctx.store - the store of the input
 * @param {String} ctx.id - the ID of the input
 * @param {*} ctx.initialValue - the initial value of the input
 * @param {Object} ctx.model - the model definition for the input
 * @param {Function} ctx.onChangeSpy - spy for the onChange callback
 * @param {String} ctx.reactKey - obvious
 * @param {Boolean} ctx.required - true if input is required
 */
function itSetsPropsOnInput(ctx: any): void {
    describe('(shared) input props', () => {
        let ref, inputType, cellConfig, store, id, initialValue, model, onChangeSpy;
        let reactKey, required;
        beforeEach(() => {
            ref = ctx.ref;
            inputType = ctx.inputType;
            cellConfig = ctx.cellConfig;
            store = ctx.store;
            id = ctx.id;
            initialValue = ctx.initialValue;
            model = ctx.model;
            onChangeSpy = ctx.onChangeSpy;
            reactKey = ctx.reactKey;
            required = ctx.required;
        });

        it('renders the real input', () => {
            expect(ref).to.be.defined;
        });

        it('passes along the store', () => {
            expect(ref.props.store).deep.equal(store);
        });

        it('passes along the ID', () => {
            expect(ref.props.id).to.be.equal(id);
        });

        it('passes along the initialValue', () => {
            expect(ref.props.initialValue).deep.equal(initialValue);
        });

        it('passes along the model', () => {
            expect(ref.props.model).deep.equal(model);
        });

        it('passes along change handler', () => {
            ref.props.onChange('some-event');
            expect(onChangeSpy).to.be.calledWith('some-event');
        });

        it('passes along the react key', () => {
            expect(ref.props.reactKey).to.be.equal(reactKey);
        });

        it('passes along the required flag', () => {
            expect(ref.props.required).to.be.equal(required);
        });

        it('passes along the cellConfig', () => {
            expect(ref.props.cellConfig).deep.equal(cellConfig);
        });
    });
}

xdescribe('BunsenInput', () => {
    const ctx: any = {};
    let component;
    beforeEach(() => {
        ctx.reactKey = 'my-very-own-key';
        ctx.onChangeSpy = sinon.spy();
    });

    describe('StringInput', () => {
        beforeEach(() => {
            ctx.cellConfig = {
                labelClassName: 'my-label-class'
            };
            ctx.inputType = 'StringInput';
            ctx.store = {
                formValue: {
                    firstName: 'Steve',
                    lastName: '',
                },
                renderers,
            };
            ctx.id = 'lastName';
            ctx.initialValue = 'Rogers';
            ctx.model = {
                type: 'string',
                label: 'Last Name',
            };
            ctx.required = true;

            component = TestUtils.renderIntoDocument(
                <BunsenInput
                    cellConfig={ctx.cellConfig}
                    formValue={ctx.formValue}
                    id={ctx.id}
                    initialValue={ctx.initialValue}
                    model={ctx.model}
                    onChange={ctx.onChangeSpy}
                    reactKey={ctx.reactKey}
                    required={ctx.required}
                    store={ctx.store}
                />
            );

            ctx.ref = component.refs.realInput;
        });

        itSetsPropsOnInput(ctx);

        describe('when bad type given', () => {
            beforeEach(() => {
                component.props.model.type = 'foobar';
            });

            it('throws an error', () => {
                expect(() => {
                    component._getInputComponent();
                }).to.throw('Only "string", "number", or "boolean" fields are currently supported.');
            });
        });
    });

    describe('dependent StringInput', () => {
        beforeEach(() => {
            ctx.cellConfig = {
                labelClassName: 'my-label-class',
                dependsOn: 'firstName',
                model: 'lastName',
            };
            ctx.inputType = 'StringInput';
            ctx.store = {
                formValue: {
                    firstName: 'Steve',
                    lastName: '',
                },
            };
            ctx.id = 'lastName';
            ctx.initialValue = 'Rogers';
            ctx.model = {
                type: 'string',
                label: 'Last Name',
            };
            ctx.required = true;

            component = TestUtils.renderIntoDocument(
                <BunsenInput
                    cellConfig={ctx.cellConfig}
                    id={ctx.id}
                    initialValue={ctx.initialValue}
                    model={ctx.model}
                    onChange={ctx.onChangeSpy}
                    reactKey={ctx.reactKey}
                    required={ctx.required}
                    store={ctx.store}
                />
            );

            ctx.ref = component.refs.realInput;
        });

        itSetsPropsOnInput(ctx);

        describe('when dependency not met', () => {
            beforeEach(() => {
                component.props.store.formValue = {};
            });

            it('does not render', () => {
                expect(component.render()).to.be.null;
            });
        });
    });

    describe('NumberInput', () => {
        beforeEach(() => {
            ctx.cellConfig = {
                inputClassName: 'my-input-class'
            };
            ctx.inputType = 'NumberInput';
            ctx.store = {
                formValue: {
                    firstName: 'Steve',
                    lastName: 'Rogers',
                },
                renderers,
            };
            ctx.id = 'age';
            ctx.initialValue = 87;
            ctx.model = {
                type: 'number',
                label: 'Age',
            };
            ctx.required = false;

            component = TestUtils.renderIntoDocument(
                <BunsenInput
                    cellConfig={ctx.cellConfig}
                    id={ctx.id}
                    initialValue={ctx.initialValue}
                    model={ctx.model}
                    onChange={ctx.onChangeSpy}
                    reactKey={ctx.reactKey}
                    required={ctx.required}
                    store={ctx.store}
                />
            );

            ctx.ref = component.refs.realInput;
        });

        itSetsPropsOnInput(ctx);

    });

    describe('BooleanInput', () => {
        beforeEach(() => {
            ctx.cellConfig = {
                inputClassName: 'my-input-class'
            };
            ctx.inputType = 'BooleanInput';
            ctx.store = {
                formValue: {
                    firstName: 'Steve',
                    lastName: 'Rogers',
                },
                renderers,
            };
            ctx.id = 'onlyChild';
            ctx.initialValue = false;
            ctx.model = {
                type: 'boolean',
                label: 'Only Child',
            };
            ctx.required = false;

            component = TestUtils.renderIntoDocument(
                <BunsenInput
                    cellConfig={ctx.cellConfig}
                    formValue={ctx.formValue}
                    id={ctx.id}
                    initialValue={ctx.initialValue}
                    model={ctx.model}
                    onChange={ctx.onChangeSpy}
                    reactKey={ctx.reactKey}
                    required={ctx.required}
                    store={ctx.store}
                />
            );

            ctx.ref = component.refs.realInput;
        });

        itSetsPropsOnInput(ctx);
    });

    describe('CustomInput', () => {
        beforeEach(() => {
            ctx.cellConfig = {
                renderer: 'NameRenderer',
                labelClassName: 'my-label-class',
                inputClassName: 'my-input-class',
            };
            ctx.inputType = 'NameRenderer';
            ctx.store = {
                formValue: {
                    firstName: 'Steve',
                    lastName: 'Rogers',
                },
                renderers,
            };
            ctx.id = 'age';
            ctx.initialValue = 87;
            ctx.model = {
                type: 'number',
                label: 'Age',
            };
            ctx.required = false;

            component = TestUtils.renderIntoDocument(
                <BunsenInput
                    cellConfig={ctx.cellConfig}
                    id={ctx.id}
                    initialValue={ctx.initialValue}
                    model={ctx.model}
                    onChange={ctx.onChangeSpy}
                    reactKey={ctx.reactKey}
                    required={ctx.required}
                    store={ctx.store}
                />
            );

            ctx.ref = component.refs.realInput;
        });

        itSetsPropsOnInput(ctx);

    });

    describe('StaticInput', () => {
        beforeEach(() => {
            ctx.cellConfig = {
                inputClassName: 'my-input-class'
            };
            ctx.inputType = 'StaticInput';
            ctx.store = {
                formValue: {
                    firstName: 'Steve',
                    lastName: 'Rogers',
                },
                renderers,
            };
            ctx.id = 'firstName';
            ctx.initialValue = '';
            ctx.model = {
                type: 'string',
                label: 'First Name',
            };
            ctx.required = false;

            component = TestUtils.renderIntoDocument(
                <BunsenInput
                    cellConfig={ctx.cellConfig}
                    id={ctx.id}
                    initialValue={ctx.initialValue}
                    model={ctx.model}
                    onChange={ctx.onChangeSpy}
                    reactKey={ctx.reactKey}
                    readOnly={true}
                    required={ctx.required}
                    store={ctx.store}
                />
            );

            ctx.ref = component.refs.realInput;
        });

        itSetsPropsOnInput(ctx);
    });
});
