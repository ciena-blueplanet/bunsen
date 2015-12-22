/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react/addons';
import componentUtils from '../../../../src/components/utils';
import NumberInput from '../../../../src/components/input/number';

import {itSetsPropsOnInput} from './common';

const TestUtils = React.addons.TestUtils;

describe('NumberInput', () => {
    const ctx: any = {};
    let cellConfig, errorMessage, onChangeSpy, sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        errorMessage = '';
        onChangeSpy = sinon.spy();
        cellConfig = {
            labelClassName: 'label-class',
            inputClassName: 'input-class',
        };

        ctx.className = '';
        ctx.dataId = 'age';
        ctx.help = '';
        ctx.key = `my-react-key-${ctx.id}`;
        ctx.label = 'Age:';
        ctx.labelClassName = 'label-class';
        ctx.type = 'number';
        ctx.wrapperClassName = 'input-class';
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('valid required', () => {
        let component, model;
        beforeEach(() => {
            ctx.className = 'required';
            model = {type: 'number', label: 'Age'};
            component = ctx.component = TestUtils.renderIntoDocument(
                <NumberInput
                    cellConfig={cellConfig}
                    id={ctx.dataId}
                    label='Age'
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
                sandbox.stub(component, '_onNewValue');
            });

            describe('when number as string', () => {
                beforeEach(() => {
                    component._onChange({target: {value: '55'}});
                });

                it('handles it as a number', () => {
                    expect(component._onNewValue).to.be.calledWith(55);
                });
            });

            describe('when blank string', () => {
                beforeEach(() => {
                    component._onChange({target: {value: ''}});
                });

                it('leaves it as a string', () => {
                    expect(component._onNewValue).to.be.calledWith('');
                });
            });
        });

        describe('._onBlur()', () => {
            beforeEach(() => {
                errorMessage = 'my-error-message';
                sandbox.stub(component, 'setState');
                component._onBlur();
            });

            it('validates', () => {
                expect(componentUtils.getErrorMessage).to.be.called;
            });

            it('updates state', () => {
                expect(component.setState).to.be.calledWith({
                    errorMessage
                });
            });
        });

        describe('._onNewValue()', () => {
            let newValue;
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                newValue = 55;
                component._onNewValue(newValue);
            });

            it('propagates change event', () => {
                expect(onChangeSpy).to.be.calledWith({id: ctx.dataId, value: 55});
            });

            it('updates state', () => {
                expect(component.setState).to.be.calledWith({value: newValue});
            });
        });

        describe('.componentWillReceiveProps()', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                sandbox.stub(component, '_onNewValue');
            });

            describe('when value did not change', () => {
                beforeEach(() => {
                    component.state.errorMessage = '';
                    component.state.value = 55;
                    component.componentWillReceiveProps({
                        store: {
                            formValue: {
                                age: 55
                            },
                            validationResult: {
                                errors: []
                            },
                        },
                    });
                });

                it('does not handle new value', () => {
                    expect(component._onNewValue).not.to.be.called;
                });

                it('does not set state directly', () => {
                    expect(component.setState).not.to.be.called;
                });
            });

            describe('when value did change', () => {
                beforeEach(() => {
                    component.state.errorMessage = 'my-error-message';
                    component.componentWillReceiveProps({
                        store: {
                            formValue: {
                                age: 66
                            },
                            validationResult: {
                                errors: []
                            },
                        },
                    });
                });

                it('handles new value', () => {
                    expect(component._onNewValue).to.be.calledWith(66);
                });

                it('does not set state directly', () => {
                    expect(component.setState).not.to.be.calledWith({value: 66});
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

    describe('invalid not required', () => {
        let errors;
        beforeEach(() => {
            errors = [
                {
                    path: `#/${ctx.dataId}`,
                    message: 'my-error-message',
                },
            ];
            ctx.bsStyle = 'error';
            ctx.help = errors[0].message;

            ctx.component = TestUtils.renderIntoDocument(
                <NumberInput
                    cellConfig={cellConfig}
                    id={ctx.dataId}
                    initialValue={123}
                    label='Age'
                    model={{type: 'number', label: 'Age'}}
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
