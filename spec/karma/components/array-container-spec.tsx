/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

const $ = require('jquery');
import * as React from 'react/addons';
import * as ReactDOM from 'react-dom';
import {ArrayContainerComponent} from '../../../src/components';
import {model, view, renderers, clickElement} from './common';

const TestUtils = React.addons.TestUtils;

describe('ArrayContainerComponent', () => {
    let sandbox, store;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        store = {
            formValue: {},
            renderers,
            view,
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('after rendering (tabs)', () => {
        let component, changeHandler, cellConfig, $component;
        beforeEach(() => {
            changeHandler = sandbox.spy();
            cellConfig = {
                model: 'item-container-config',
                item: {
                    className: 'foo-bar'
                },
            };
            component = TestUtils.renderIntoDocument(
                <ArrayContainerComponent
                    cellConfig={cellConfig}
                    id='foo'
                    model={model.properties.addresses}
                    onChange={changeHandler}
                    reactKey='foo'
                    store={store}
                />
            );

            $component = $(ReactDOM.findDOMNode(component));
        });

        it('has proper class', () => {
            expect($component).to.have.class('array-container');
        });

        it('displays title of model', () => {
            expect($('legend', $component)).to.have.text('Addresses');
        });

        describe('when add clicked', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');

                clickElement('button span.icon-add-square', $component);
            });

            it('sets the state', () => {
                expect(component.setState).to.be.calledWith(
                    {
                        items: [
                            {
                                key: '0',
                                data: {},
                            },
                        ],
                    },
                    sinon.match.func
                );
            });

            it('notifies parent of new item', () => {
                expect(changeHandler).to.be.calledWith({
                    id: 'foo[0]',
                    value: {},
                });
            });

            describe('when setState() finishes', () => {
                let setStateCallback;
                beforeEach(() => {
                    setStateCallback = component.setState.args[0][1];
                    setStateCallback();
                });

                it('sets key state', () => {
                    expect(component.setState).to.be.calledWith({key: 0});
                });
            });
        });

        describe('when item added', () => {
            beforeEach(() => {
                clickElement('button span.icon-add-square', $component);
            });

            it('creates the first model container', () => {
                expect(component.refs['item-0-model']).to.be.defined;
            });

            it('gives a null label to the first model container', () => {
                expect(component.refs['item-0-model'].props.label).to.be.null;
            });

            it('does not yet create the second model container', () => {
                expect(component.refs['item-1-model']).to.be.undefined;
            });

            describe('when second item added', () => {
                let props;
                beforeEach(() => {
                    clickElement('button span.icon-add-square', $component);
                    props = component.refs['item-1-model'].props;
                });

                it('creates the second model container', () => {
                    expect(component.refs['item-1-model']).to.be.defined;
                });

                it('passes along view', () => {
                    expect(props.store.view).deep.equal(view);
                });

                it('passes along cell config', () => {
                    expect(props.cellConfig).deep.equal(cellConfig.item);
                });

                it('passes along model', () => {
                    expect(props.model).deep.equal(model.properties.addresses.items);
                });

                it('sets the id', () => {
                    expect(props.id).to.be.equal('foo[1]');
                });

                describe('when item changes', () => {
                    beforeEach(() => {
                        sandbox.stub(component, 'setState');
                        props.onChange({
                            id: 'foo[1].street',
                            value: '123 Main Street',
                        });
                    });

                    it('passes up the change event', () => {
                        expect(changeHandler).to.be.calledWith({
                            id: 'foo[1].street',
                            value: '123 Main Street',
                        });
                    });

                    it('sets the state', () => {
                        expect(component.setState).to.be.calledWith({
                            items: [
                                {
                                    key: '0',
                                    data: {},
                                },
                                {
                                    key: '1',
                                    data: {
                                        street: '123 Main Street'
                                    },
                                },
                            ],
                        });
                    });

                    describe('when item removed', () => {
                        let $firstItem, items;
                        beforeEach(() => {
                            $firstItem = $('.nav-tabs li:nth-child(1)', $component);
                            clickElement('button span.icon-close', $firstItem);
                            items = [
                                {
                                    street: '123 Main Street'
                                },
                            ];
                        });

                        it('sets the state', () => {
                            expect(component.setState).to.be.calledWith(
                                {
                                    items: [
                                        {
                                            key: '1',
                                            data: {
                                                street: '123 Main Street'
                                            },
                                        },
                                    ],
                                },
                                sinon.match.func
                            );
                        });

                        it('triggers change event', () => {
                            expect(changeHandler).to.be.calledWith({
                                id: 'foo',
                                value: items,
                            });
                        });

                        describe('when setState() finishes', () => {
                            let setStateCallback;
                            beforeEach(() => {
                                setStateCallback = component.setState.args[1][1];
                                setStateCallback();
                            });

                            it('sets key state', () => {
                                expect(component.setState).to.be.calledWith({key: 0});
                            });
                        });
                    });
                });
            });
        });
    });

    describe('after rendering (inline)', () => {
        let component, changeHandler, cellConfig, $component;
        beforeEach(() => {
            changeHandler = sandbox.spy();
            cellConfig = {
                model: 'item-container-config',
                item: {
                    className: 'foo-bar',
                    inline: true,
                },
            };
            component = TestUtils.renderIntoDocument(
                <ArrayContainerComponent
                    cellConfig={cellConfig}
                    id='foo'
                    model={model.properties.addresses}
                    onChange={changeHandler}
                    reactKey='foo'
                    store={store}
                />
            );

            $component = $(ReactDOM.findDOMNode(component));
        });

        it('has proper class', () => {
            expect($component).to.have.class('array-container');
        });

        it('displays title of model', () => {
            expect($('legend', $component)).to.have.text('Addresses');
        });

        describe('when add clicked', () => {
            beforeEach(() => {
                sandbox.stub(component, 'setState');

                clickElement('button span.icon-add', $component);
            });

            it('sets the state', () => {
                expect(component.setState).to.be.calledWith(
                    {
                        items: [
                            {
                                key: '0',
                                data: {},
                            },
                        ],
                    },
                    sinon.match.func
                );
            });

            it('notifies parent of new item', () => {
                expect(changeHandler).to.be.calledWith({
                    id: 'foo[0]',
                    value: {},
                });
            });

            describe('when setState() finishes', () => {
                let setStateCallback;
                beforeEach(() => {
                    setStateCallback = component.setState.args[0][1];
                    setStateCallback();
                });

                it('sets key state', () => {
                    expect(component.setState).to.be.calledWith({key: 0});
                });
            });
        });

        describe('when item added', () => {
            beforeEach(() => {
                clickElement('button span.icon-add', $component);
            });

            it('creates the first model container', () => {
                expect(component.refs['item-0-model']).to.be.defined;
            });

            it('does not yet create the second model container', () => {
                expect(component.refs['item-1-model']).to.be.undefined;
            });

            describe('when second item added', () => {
                let props;
                beforeEach(() => {
                    clickElement('button span.icon-add', $component);
                    props = component.refs['item-1-model'].props;
                });

                it('creates the second model container', () => {
                    expect(component.refs['item-1-model']).to.be.defined;
                });

                it('passes along view', () => {
                    expect(props.store.view).deep.equal(view);
                });

                it('passes along cell config', () => {
                    expect(props.cellConfig).deep.equal(cellConfig.item);
                });

                it('passes along model', () => {
                    expect(props.model).deep.equal(model.properties.addresses.items);
                });

                it('sets the id', () => {
                    expect(props.id).to.be.equal('foo[1]');
                });

                describe('when item changes', () => {
                    beforeEach(() => {
                        sandbox.stub(component, 'setState');
                        props.onChange({
                            id: 'foo[1].street',
                            value: '123 Main Street',
                        });
                    });

                    it('passes up the change event', () => {
                        expect(changeHandler).to.be.calledWith({
                            id: 'foo[1].street',
                            value: '123 Main Street',
                        });
                    });

                    it('sets the state', () => {
                        expect(component.setState).to.be.calledWith({
                            items: [
                                {
                                    key: '0',
                                    data: {},
                                },
                                {
                                    key: '1',
                                    data: {
                                        street: '123 Main Street'
                                    },
                                },
                            ],
                        });
                    });

                    describe('when item removed', () => {
                        let $firstItem, items;
                        beforeEach(() => {
                            $firstItem = $(ReactDOM.findDOMNode(component.refs['item-0']));
                            clickElement('button span.icon-remove', $firstItem);
                            items = [
                                {
                                    street: '123 Main Street'
                                },
                            ];
                        });

                        it('sets the state', () => {
                            expect(component.setState).to.be.calledWith(
                                {
                                    items: [
                                        {
                                            key: '1',
                                            data: {
                                                street: '123 Main Street'
                                            },
                                        },
                                    ],
                                },
                                sinon.match.func
                            );
                        });

                        it('triggers change event', () => {
                            expect(changeHandler).to.be.calledWith({
                                id: 'foo',
                                value: items,
                            });
                        });

                        describe('when setState() finishes', () => {
                            let setStateCallback;
                            beforeEach(() => {
                                setStateCallback = component.setState.args[1][1];
                                setStateCallback();
                            });

                            it('sets key state', () => {
                                expect(component.setState).to.be.calledWith({key: 0});
                            });
                        });
                    });
                });
            });
        });
    });
});
