/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react/addons';
import componentUtils from '../../../../src/components/utils';
import BooleanInput from '../../../../src/components/input/boolean';

const TestUtils = React.addons.TestUtils;

describe('BooleanInput', () => {
    let cellConfig, errorMessage, onChangeSpy;
    let component, bsStyle, dataId, label, labelClassName, wrapperClassName, sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        cellConfig = {
            labelClassName: 'label-class',
            inputClassName: 'input-class',
        };

        onChangeSpy = sinon.spy();

        dataId = 'onlyChild';
        label = 'Only Child';
        labelClassName = 'label-class';
        wrapperClassName = 'input-class';
        errorMessage = '';
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('valid required', () => {
        let model;
        beforeEach(() => {
            model = {type: 'boolean', label: 'Only Child'};
            component = TestUtils.renderIntoDocument(
                <BooleanInput
                    cellConfig={cellConfig}
                    id={dataId}
                    label='Only Child'
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

        it('sets the bsStyle', () => {
            expect(component.refs.group.props.className).to.equal(`form-group ${bsStyle}`);
        });

        it('sets the data-id', () => {
            expect(component.refs.input.props['data-id']).to.equal(dataId);
        });

        it('does not create help', () => {
            expect(component.refs.help).not.to.be.defined;
        });

        it('sets the label', () => {
            expect(component.refs.input.props.label).to.equal(label);
        });

        it('sets the labelClassName', () => {
            expect(component.refs.label.props.className).to.equal(`control-label ${labelClassName}`);
        });

        it('sets the wrapperClassName', () => {
            expect(component.refs.wrapper.props.className).to.equal(wrapperClassName);
        });

        describe('._onChange()', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');
            });
            describe('when valid', () => {
                beforeEach(() => {
                    component._onChange();
                });

                it('does not validate', () => {
                    expect(componentUtils.getErrorMessage).not.to.be.called;
                });

                it('updates state', () => {
                    expect(component.setState).to.be.calledWith({value: true});
                });
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
                    errorMessage
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

            it('sets state', () => {
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
                    component.state.value = false;
                    component.componentWillReceiveProps({
                        store: {
                            formValue: {
                                onlyChild: false
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
                    component.componentWillReceiveProps({
                        store: {
                            formValue: {
                                onlyChild: true
                            },
                        },
                    });
                });

                it('handles new value', () => {
                    expect(component._onNewValue).to.be.calledWith(true);
                });

                it('does not set state directly', () => {
                    expect(component.setState).not.to.be.called;
                });
            });
        });
    });

    describe('invalid not required', () => {
        let errors;
        beforeEach(() => {
            errors = [
                {
                    path: `#/${dataId}`,
                    message: 'You call that a name!',
                },
            ];
            bsStyle = 'has-error';

            component = TestUtils.renderIntoDocument(
                <BooleanInput
                    cellConfig={cellConfig}
                    id={dataId}
                    initialValue={true}
                    label='Only Child'
                    model={{type: 'boolean', label: 'Only Child'}}
                    onChange={onChangeSpy}
                    reactKey='my-react-key'
                    required={false}
                    store={{validationResult: {errors}}}
                />
            );
        });

        it('sets the bsStyle', () => {
            expect(component.refs.group.props.className).to.equal(`form-group ${bsStyle}`);
        });

        it('sets the data-id', () => {
            expect(component.refs.input.props['data-id']).to.equal(dataId);
        });

        it('does create help', () => {
            expect(component.refs.help.props.children).to.equal(errors[0].message);
        });

        it('sets the label', () => {
            expect(component.refs.input.props.label).to.equal(label);
        });

        it('sets the labelClassName', () => {
            expect(component.refs.label.props.className).to.equal(`control-label ${labelClassName}`);
        });

        it('sets the wrapperClassName', () => {
            expect(component.refs.wrapper.props.className).to.equal(wrapperClassName);
        });
    });
});
