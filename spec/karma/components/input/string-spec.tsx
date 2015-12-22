/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react/addons';
import componentUtils from '../../../../src/components/utils';
import StringInput from '../../../../src/components/input/string';

import {itSetsPropsOnInput} from './common';

const TestUtils = React.addons.TestUtils;

describe('StringInput', () => {
    const ctx: any = {};
    let cellConfig, errorMessage, onChangeSpy, sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        errorMessage = '';

        cellConfig = {
            labelClassName: 'label-class',
            inputClassName: 'input-class',
        };

        onChangeSpy = sinon.spy();

        ctx.className = '';
        ctx.dataId = 'lastName';
        ctx.help = '';
        ctx.key = `my-react-key-${ctx.id}`;
        ctx.label = 'Last Name:';
        ctx.labelClassName = 'label-class';
        ctx.type = 'text';
        ctx.wrapperClassName = 'input-class';
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('valid required', () => {
        let component, model;
        beforeEach(() => {
            ctx.className = 'required';
            model = {type: 'string', label: 'Last Name'};
            ctx.component = component = TestUtils.renderIntoDocument(
                <StringInput
                    cellConfig={cellConfig}
                    id={ctx.dataId}
                    label='Last Name'
                    model={model}
                    onChange={onChangeSpy}
                    reactKey='my-react-key'
                    required={true}
                    store={{validationResult: {errors: []}}}
                />
            );

            sandbox.stub(componentUtils, 'getErrorMessage', () => {
                return errorMessage;
            });
        });

        itSetsPropsOnInput(ctx);

        describe('._onChange()', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                component._onChange({target: {value: 'Martin'}});
            });

            it('does not validate', () => {
                expect(componentUtils.getErrorMessage).not.to.be.called;
            });

            it('updates state', () => {
                expect(component.setState).to.be.calledWith({value: 'Martin'});
            });
        });

        describe('._onBlur()', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                component._onBlur();
            });

            it('validates', () => {
                expect(componentUtils.getErrorMessage).to.be.called;
            });

            it('updates state', () => {
                expect(component.setState).to.be.calledWith({
                    errorMessage,
                    focused: false,
                });
            });
        });

        describe('._onNewValue()', () => {
            let newValue;
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                newValue = {foo: 'bar'};
                component._onNewValue(newValue);
            });

            it('does not validate again', () => {
                expect(componentUtils.getErrorMessage).not.to.be.called;
            });

            it('sets state', () => {
                expect(component.setState).to.be.calledWith({value: newValue});
            });
        });

        describe('.componentWillReceiveProps()', () => {
            let errors;
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                sandbox.stub(component, '_onNewValue');
            });

            describe('when value did not change', () => {
                beforeEach(() => {
                    errors = [];
                    component.state.errorMessage = '';
                    component.state.value = 'last-name';
                    component.componentWillReceiveProps({
                        store: {
                            formValue: {
                                lastName: 'last-name'
                            },
                            validationResult: {
                                errors
                            },
                        },
                    });
                });

                it('does not handle new value', () => {
                    expect(component._onNewValue).not.to.be.called;
                });

                it('does not set state directly', () => {
                    expect(component.setState).not.to.be.calledWith({value: 'last-name'});
                });

                it('does not validate', () => {
                    expect(componentUtils.getErrorMessage).not.to.be.called;
                });
            });

            describe('when value did change', () => {
                beforeEach(() => {
                    component.state.errorMessage = 'foo-bar';
                    errors = [
                        {
                            path: `#/${ctx.dataId}`,
                            message: 'Uh oh!',
                        },
                    ];
                    component.componentWillReceiveProps({
                        store: {
                            formValue: {
                                lastName: 'new-last-name'
                            },
                            validationResult: {
                                errors
                            },
                        },
                    });
                });

                it('handles new value', () => {
                    expect(component._onNewValue).to.be.calledWith('new-last-name');
                });

                it('does not set state directly', () => {
                    expect(component.setState).not.to.be.calledWith({value: 'new-last-name'});
                });

                it('validates', () => {
                    expect(componentUtils.getErrorMessage).to.be.called;
                });

                it('sets validation state', () => {
                    expect(component.setState).to.be.calledWith({errorMessage});
                });
            });
        });
    });

    describe('valid required, defaulted', () => {
        let component, model;
        beforeEach(() => {
            model = {type: 'string', label: 'Last Name', 'default': 'Rogers'};
            ctx.component = component = TestUtils.renderIntoDocument(
                <StringInput
                    cellConfig={cellConfig}
                    id={ctx.dataId}
                    label='Last Name'
                    model={model}
                    onChange={onChangeSpy}
                    reactKey='my-react-key'
                    required={true}
                    store={{validationResult: {errors: []}}}
                />
            );
        });

        itSetsPropsOnInput(ctx);

        it('sets default value', () => {
            expect(component.state.value).to.be.equal('Rogers');
        });

        it('calls onChange handler', () => {
            expect(onChangeSpy).to.be.calledWith({id: 'lastName', value: 'Rogers'});
        });
    });

    describe('invalid not required', () => {
        let errors;
        beforeEach(() => {
            errors = [
                {
                    path: `#/${ctx.dataId}`,
                    message: 'You call that a name!',
                },
            ];

            ctx.bsStyle = 'error';
            ctx.help = errors[0].message;

            ctx.component = TestUtils.renderIntoDocument(
                <StringInput
                    cellConfig={cellConfig}
                    id={ctx.dataId}
                    initialValue='123'
                    label='Last Name'
                    model={{type: 'string', label: 'Last Name'}}
                    onChange={onChangeSpy}
                    reactKey='my-react-key'
                    required={false}
                    store={{validationResult: {errors}}}
                />
            );
        });

        itSetsPropsOnInput(ctx);
    });
});
