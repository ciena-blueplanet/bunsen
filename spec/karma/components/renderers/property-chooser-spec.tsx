/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

import * as React from 'react/addons';
import PropertyChooser from '../../../../src/components/renderers/property-chooser';

const TestUtils = React.addons.TestUtils;

describe('PropertyChooser', () => {
    let component, cellConfig, model, formValue, onChangeSpy, dropDown, sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        cellConfig = {
            labelClassName: 'label-class',
            inputClassName: 'input-class',
            label: 'universe',
            properties: {
                choices: [
                    {
                        value: 'marvel',
                        label: 'Marvel',
                    },
                    {
                        value: 'dc',
                        label: 'DC',
                    },
                ],
            },
        };

        model = {

        };

        formValue = {};

        onChangeSpy = sinon.spy();

        component = TestUtils.renderIntoDocument(
            <PropertyChooser
                cellConfig={cellConfig}
                formValue={formValue}
                id='foo'
                model={model}
                onChange={onChangeSpy}
            />
        );

        dropDown = component.refs.dropDown;
    });

    it('sets data on the drop-down', () => {
        expect(dropDown.props.data).deep.equal(cellConfig.properties.choices);
    });

    it('sets data-id on the drop-down', () => {
        expect(dropDown.props['data-id']).deep.equal('foo');
    });

    it('sets label  on the drop-down', () => {
        expect(dropDown.props.label).to.be.equal('universe:');
    });

    describe('._onChange()', () => {
        beforeEach(() => {
            sandbox.stub(component, 'setState');
        });

        describe('when state set', () => {
            beforeEach(() => {
                component.state.value = 'fooBar';
                component._onChange('newValue');
            });

            it('clears selection', () => {
                expect(onChangeSpy).to.be.calledWith({
                    id: 'foo.fooBar',
                    value: '',
                });
            });

            it('sets new selection', () => {
                expect(onChangeSpy).to.be.calledWith({
                    id: 'foo.newValue',
                    value: 'selected',
                });
            });

            it('sets state', () => {
                expect(component.setState).to.be.calledWith({
                    value: 'newValue'
                });
            });
        });
    });
});
