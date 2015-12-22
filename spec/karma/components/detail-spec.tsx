/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * _ from'lodash';
import * as React from 'react/addons';
const rewireUtils = require('beaker/src/test-utils/jasmine/rewire');
const rewireDeps = rewireUtils.rewireDeps;
const resetDeps = rewireUtils.resetDeps;
const createStubComponent = require('beaker/src/test-utils/jasmine/rewire-components'). createStubComponent;
import Detail, {__RewireAPI__ as module} from '../../../src/components/detail';
import {model, view} from './common';

const TestUtils = React.addons.TestUtils;

const renderers = {
    'ObjectRenderer': {}
};

xdescribe('Detail', () => {
    let component, defaultView, deps, getDefaultViewSpy, modelValidationResult, propValidationResult, sandbox,
        validateViewSpy, validateModelSpy, validateValueSpy, value, valueValidationResult;

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
            valid: true,
            errors: [],
            warnings: [],
        };

        getDefaultViewSpy = sandbox.spy(() => defaultView);
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
        };

        value = {
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

        rewireDeps(module, deps);
    });

    afterEach(() => {
        sandbox.restore();
        resetDeps(module, deps);
    });

    describe('with valid model/view/value', () => {
        beforeEach(() => {
            component = TestUtils.renderIntoDocument(
                <Detail
                    model={model}
                    renderers={renderers}
                    value={value}
                    view={view}
                />
            );
        });

        it('renders the root container', () => {
            expect(component.refs.rootContainer).to.be.defined;
        });

        it('passes along value to root container', () => {
            expect(component.refs.rootContainer.props.store.formValue).deep.equal(value);
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

        describe('.componentWillReceiveProps()', () => {
            let newModel, newView, newValue, newRenderers;
            beforeEach(() => {
                newModel = {foo: 'bar'};
                newView = {bar: 'baz'};
                newValue = {baz: 'foo'};
                newRenderers = {'FooBar': {}};
                sandbox.stub(component, '_validateProps');
                component.componentWillReceiveProps({
                    view: newView,
                    model: newModel,
                    value: newValue,
                    renderers: newRenderers,
                });
            });

            it('validates the model/view/value', () => {
                expect(component._validateProps).to.be.calledWith(newView, newModel, newValue, newRenderers);
            });
        });

        describe('.componentWillMount()', () => {
            beforeEach(() => {
                sandbox.stub(component, '_validateProps');
                component.componentWillMount();
            });

            it('validates the model/view/value', () => {
                expect(component._validateProps).to.be.calledWith(view, model, value, renderers);
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
                <Detail
                    model={model}
                    renderers={renderers}
                    view={view}
                />
            );
        });

        it('validates the model', () => {
            expect(validateViewSpy).to.be.calledWith(view, model, _.keys(renderers));
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
});
