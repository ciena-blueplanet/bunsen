/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

const $ = require('jquery');
import * _ from'lodash';
import * as React from 'react/addons';
import * as ReactDOM from 'react-dom';
const {wait = require('beaker/src/test-utils').wait;
const rewireUtils = require('beaker/src/test-utils/jasmine/rewire');
const rewireDeps = rewireUtils.rewireDeps;
const resetDeps = rewireUtils.resetDeps;
const createStubComponent = require('beaker/src/test-utils/jasmine/rewire-components'). createStubComponent;
import PropertyChooser from '../../../src/components/renderers/property-chooser';
import Form, {__RewireAPI__ as module} from '../../../src/components/form';
import {model, view} from './common';

const TestUtils = React.addons.TestUtils;

const renderers = {
    'ObjectRenderer': {}
};

function _$(component: any): any {
    return $(ReactDOM.findDOMNode(component));
}

function $submitBtn(component: any): any {
    return $('button[type="submit"]', _$(component));
}

xdescribe('Form', () => {
    let component, defaultView, deps, getDefaultViewSpy, modelValidationResult, onCancelCallback, onChangeCallback,
        onSubmitCallback, onValidationCallback, propValidationResult, removePropertySpy, sandbox, validateViewSpy,
        validateModelSpy, validateValueSpy, valueValidationResult;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        defaultView = {
            type: 'form',
            version: '1.0',
            rootContainers: [{label: 'Main', container: 'main'}],
            containers: [{id: 'main', rows: []}],
        };

        propValidationResult = {
            valid: true,
            errors: [],
            warnings: [{path: 'foo', message: 'bar'}],
        };

        modelValidationResult = {
            valid: true,
            errors: [],
            warnings: [{path: 'foo', message: 'bar'}],
        };

        valueValidationResult = {
            valid: false,
            errors: [{path: '#/', message: 'Something is wrong'}],
            warnings: [],
        };

        getDefaultViewSpy = sandbox.spy(() => defaultView);
        onCancelCallback = sandbox.spy();
        onChangeCallback = sandbox.spy();
        onSubmitCallback = sandbox.spy();
        onValidationCallback = sandbox.spy();
        removePropertySpy = sandbox.spy();
        validateViewSpy = sandbox.spy(() => propValidationResult);
        validateModelSpy = sandbox.spy(() => modelValidationResult);
        validateValueSpy = sandbox.spy(() => valueValidationResult);

        deps = {
            'ContainerComponent': createStubComponent('ContainerComponent', {}),
            'ValidationResult': createStubComponent('ValidationResult', {}),
            'getDefaultView': getDefaultViewSpy,
            'validateView': validateViewSpy,
            'validateModel': validateModelSpy,
            'validateValue': validateValueSpy,
            'removeProperty': removePropertySpy,
        };

        rewireDeps(module, deps);
    });

    afterEach(() => {
        resetDeps(module, deps);
        sandbox.restore();
    });

    describe('with valid model/view', () => {
        let initialValue;
        beforeEach((done: any) => {
            initialValue = {
                name: {
                    first: 'Clark',
                    last: 'Kent',
                },
                addresses: [
                    {
                        street: '5 Hickory Ln.',
                        city: 'Smallville',
                        state: 'KA',
                        zip: '66605',
                    },
                ],
            };
            component = TestUtils.renderIntoDocument(
                <Form
                    initialValue={initialValue}
                    model={model}
                    onCancel={onCancelCallback}
                    onChange={onChangeCallback}
                    onSubmit={onSubmitCallback}
                    onValidation={onValidationCallback}
                    renderers={renderers}
                    view={view}
                />
            );

            wait(done); // let Q.allSettled on the set of no custom validators finish
        });

        it('renders the root container', () => {
            expect(component.refs.rootContainer).to.be.defined;
        });

        it('passes along value to root container', () => {
            expect(component.refs.rootContainer.props.store.formValue).deep.equal(initialValue);
        });

        it('passes along the view to the root container', () => {
            expect(component.refs.rootContainer.props.store.view).deep.equal(view);
        });

        it('passes along the model to the root container', () => {
            expect(component.refs.rootContainer.props.model).deep.equal(model);
        });

        it('passes along the container view to the root container', () => {
            const container = view.containers[view.rootContainers[0].container];
            expect(component.refs.rootContainer.props.containerConfig).deep.equal(container);
        });

        // Not sure why this one started failing when refactoring these tests, the button does
        // start out disabled in the demo. -- ARM
        it('starts with disabled submit button', () => {
            expect($submitBtn(component)).to.be.disabled;
        });

        it('Pulls submit label from view', () => {
            expect($submitBtn(component)).to.have.text('Create');
        });

        it('wires up the cancel button', () => {
            expect(component.refs.cancelBtn.props.onClick).to.be.equal(onCancelCallback);
        });

        describe('when required fields filled in', () => {
            let original;
            beforeEach((done: any) => {
                original = _.cloneDeep(valueValidationResult);
                Object.assign(valueValidationResult, {
                    valid: true,
                    errors: [],
                });
                component.validate();
                wait(done);
            });

            afterEach(() => {
                valueValidationResult = original;
            });

            it('enables submit button', () => {
                expect($submitBtn(component)).not.to.be.disabled;
            });

            describe('when submit clicked', () => {
                beforeEach(() => {
                    let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
                    TestUtils.Simulate.submit(form);
                });

                // Not sure why this one started failing after refactoring these tests, I'm using Simulate now,
                // but it still doesn't seem to be working -- ARM
                it('calls onSubmit with appropriate data', () => {
                    expect(onSubmitCallback).to.be.calledWith(initialValue);
                });
            });
        });

        describe('._getView()', () => {
            let ret;

            describe('when view is present', () => {
                beforeEach(() => {
                    ret = component._getView(view, model);
                });

                it('returns the view as-is', () => {
                    expect(ret).to.be.equal(view);
                });
            });

            describe('when view is missing', () => {
                beforeEach(() => {
                    ret = component._getView(undefined, model);
                });

                it('generates a default view', () => {
                    expect(getDefaultViewSpy).to.be.calledWith(model);
                });

                it('returns the generated view', () => {
                    expect(ret).to.be.equal(defaultView);
                });
            });
        });

        describe('._validateProps()', () => {
            let newModel, newView, newRenderers;
            beforeEach(() => {
                newModel = {foo: 'bar'};
                newView = {bar: 'baz'};
                newRenderers = {'FooBar': {}};
                sandbox.stub(component, '_getView').returns('the-view');
                sandbox.stub(component, 'setState');
            });

            describe('when model is valid', () => {
                beforeEach(() => {
                    component._validateProps(newView, newModel, newRenderers);
                });

                it('fetches the view', () => {
                    expect(component._getView).to.be.calledWith(newView, newModel);
                });

                it('validates the schema', () => {
                    expect(validateViewSpy).to.be.calledWith('the-view', newModel, ['FooBar']);
                });

                it('updates state', () => {
                    expect(component.setState).to.be.calledWith({propValidationResult});
                });
            });

            describe('when model is invalid', () => {
                beforeEach(() => {
                    modelValidationResult = {
                        valid: false,
                        errors: ['1', '2', '3'],
                    };

                    component._validateProps(newView, newModel, newRenderers);
                });

                it('does not fetch the view', () => {
                    expect(component._getView).not.to.be.called;
                });

                it('does not validate the view', () => {
                    expect(validateViewSpy).not.to.be.calledWith(sinon.match.object, newModel);
                });

                it('updates state', () => {
                    expect(component.setState).to.be.calledWith({
                        propValidationResult: modelValidationResult
                    });
                });
            });
        });

        describe('._onChange()', () => {
            let oldValue;
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                sandbox.stub(component, 'validate');
                oldValue = {
                    name: {
                        first: 'Steve',
                        last: 'Rogers',
                    },
                    team: 'Avengers',
                };
                component.currentValue = _.cloneDeep(oldValue);
            });

            describe('when value is blank', () => {
                beforeEach(() => {
                    component._onChange({
                        id: 'name.last',
                        value: '',
                    });
                });

                it('removes the property', () => {
                    expect(removePropertySpy).to.be.calledWith(component.currentValue, 'name.last');
                });

                it('sets the state', () => {
                    expect(component.setState).to.be.calledWith({value: oldValue}, sinon.match.func);
                });

                it('does not mutate the state directly', () => {
                    const argument = removePropertySpy.args[0][0];
                    expect(argument !== component.state.value).to.be.true;
                });

                it('does not validate yet', () => {
                    expect(component.validate).not.to.be.called;
                });

                it('calls onChange callback', () => {
                    expect(onChangeCallback).to.be.called;
                });

                describe('after setState() finishes', () => {
                    beforeEach(() => {
                        component.setState.args[0][1]();
                    });

                    it('validates', () => {
                        expect(component.validate).to.be.called;
                    });
                });
            });

            describe('when value is not blank', () => {
                beforeEach(() => {
                    component.state.value = _.clone(oldValue);
                    component._onChange({
                        id: 'name.last',
                        value: 'Martin',
                    });
                });

                it('does not remove the property', () => {
                    expect(removePropertySpy).not.to.be.called;
                });

                it('sets the state', () => {
                    expect(component.setState).to.be.calledWith(
                        {
                            value: {
                                name: {
                                    first: 'Steve',
                                    last: 'Martin',
                                },
                                team: 'Avengers',
                            },
                        },
                        sinon.match.func
                    );
                });

                it('does not mutate the state directly', () => {
                    expect(component.state.value).deep.equal(oldValue);
                });

                it('does not validate yet', () => {
                    expect(component.validate).not.to.be.called;
                });

                it('calls onChange callback', () => {
                    expect(onChangeCallback).to.be.calledWith({
                        name: {
                            first: 'Steve',
                            last: 'Martin',
                        },
                        team: 'Avengers',
                    });
                });

                describe('after setState() finishes', () => {
                    beforeEach(() => {
                        component.setState.args[0][1]();
                    });

                    it('validates', () => {
                        expect(component.validate).to.be.called;
                    });
                });
            });
        });

        describe('._onSubmit()', () => {
            let submitEvent;
            beforeEach(() => {
                submitEvent = {
                    preventDefault: sandbox.spy()
                };
                component.state.value = {
                    foo: 'bar'
                };

                component._onSubmit(submitEvent);
            });

            it('prevents default submit action', () => {
                expect(submitEvent.preventDefault).to.be.called;
            });

            it('calls onSubmit callback', () => {
                expect(onSubmitCallback).to.be.calledWith({foo: 'bar'});
            });
        });

        describe('.validate()', () => {
            beforeEach((done: any) => {
                component.state.value = {
                    foo: 'bar'
                };
                sandbox.stub(component, 'setState');
                component.validate();
                wait(done);
            });

            it('validates the value', () => {
                expect(validateValueSpy).to.be.calledWith({foo: 'bar'}, model);
            });

            it('sets the state', () => {
                expect(component.setState).to.be.calledWith({
                    validationResult: valueValidationResult
                });
            });

            it('calls onValidation callback', () => {
                expect(onValidationCallback).to.be.calledWith(valueValidationResult);
            });
        });

        describe('.componentWillReceiveProps()', () => {
            let newModel, newView, newRenderers;
            beforeEach(() => {
                newModel = {foo: 'bar'};
                newView = {bar: 'baz'};
                newRenderers = {'FooBar': {}};
                sandbox.stub(component, '_validateProps');
                component.componentWillReceiveProps({
                    view: newView,
                    model: newModel,
                    renderers: newRenderers,
                });
            });

            it('validates the model/view', () => {
                const combinedRenderers = _.assign({}, {PropertyChooser: PropertyChooser}, newRenderers);
                expect(component._validateProps).to.be.calledWith(newView, newModel, combinedRenderers);
            });
        });

        describe('.componentWillMount()', () => {
            beforeEach(() => {
                sandbox.stub(component, '_validateProps');
                component.componentWillMount();
            });

            it('validates the model/view', () => {
                const combinedRenderers = _.assign({}, {PropertyChooser}, renderers);
                expect(component._validateProps).to.be.calledWith(view, model, combinedRenderers);
            });
        });

        describe('.componentDidMount()', () => {
            beforeEach(() => {
                sandbox.stub(component, 'validate');
                component.componentDidMount();
            });

            it('validates the value', () => {
                expect(component.validate).to.be.called;
            });
        });

        describe('.reset()', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');
                sandbox.stub(component, 'validate');

                component.reset();
            });

            it('sets state back to original', () => {
                expect(component.setState).to.be.calledWith({value: initialValue}, sinon.match.func);
            });

            it('does not validate yet', () => {
                expect(component.validate).not.to.be.called;
            });

            it('calls change handler', () => {
                expect(onChangeCallback).to.be.calledWith(initialValue);
            });

            describe('after setState() finishes', () => {
                beforeEach(() => {
                    component.setState.args[0][1]();
                });

                it('validates', () => {
                    expect(component.validate).to.be.called;
                });
            });
        });
    });

    describe('with invalid model/view', () => {
        beforeEach(() => {
            propValidationResult = {
                valid: false,
                errors: [{path: '', message: 'bad, bad data'}],
                warnings: [{path: 'foo', message: 'bar'}],
            };

            component = TestUtils.renderIntoDocument(
                <Form
                    model={model}
                    renderers={renderers}
                    view={view}
                />
            );
        });

        it('validates the model', () => {
            const combinedRenderers = _.assign({}, {PropertyChooser}, renderers);
            expect(validateViewSpy).to.be.calledWith(view, model, _.keys(combinedRenderers));
        });

        it('updates its state', () => {
            expect(component.state.propValidationResult).deep.equal(propValidationResult);
        });

        it('renders the validation result', () => {
            expect(component.refs.propValidationResult).to.be.defined;
        });

        it('passes along the result', () => {
            expect(component.refs.propValidationResult.props.result).deep.equal(propValidationResult);
        });
    });

    describe('with multiple defaults', () => {
        let modelWithDefaults;
        beforeEach(() => {
            // we want to use the real stuff for this one
            resetDeps(module, deps);

            modelWithDefaults = {
                type: 'object',
                properties: {
                    firstName: {
                        type: 'string',
                        'default': 'Steve',
                    },
                    lastName: {
                        type: 'string',
                        'default': 'Rogers',
                    },
                    nickname: {
                        type: 'string',
                        'default': 'Captain America',
                    },
                },
            };

            defaultView = {
                version: '1.0',
                type: 'form',
                rootContainers: [
                    {
                        label: 'Main',
                        container: 'main',
                    },
                ],
                containers: [
                    {
                        id: 'main',
                        rows: [
                            [{model: 'firstName'}],
                            [{model: 'lastName'}],
                            [{model: 'nickname'}],
                        ],
                    },
                ],
            };

            onChangeCallback = sandbox.spy();

            propValidationResult = {
                valid: true,
                errors: [],
                warnings: [],
            };
            component = TestUtils.renderIntoDocument(
                <Form
                    model={modelWithDefaults}
                    onChange={onChangeCallback}
                    renderers={renderers}
                    view={defaultView}
                />
            );
        });

        it('aggregates all defaults', () => {
            expect(onChangeCallback).to.be.calledWith({
                firstName: 'Steve',
                lastName: 'Rogers',
                nickname: 'Captain America',
            });
        });
    });
});
