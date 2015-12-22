/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

const $ = require('jquery');
import * as React from 'react/addons';
import * as ReactDOM from 'react-dom';
import StaticInput from '../../../../src/components/input/static';

const TestUtils = React.addons.TestUtils;

describe('StaticInput', () => {
    let component, cellConfig, model, dataId, store, changeHandler;
    beforeEach(() => {
        cellConfig = {
            placeholder: 'n/a'
        };

        store = {
            formValue: {
                firstName: 'Steve',
                lastName: 'Rogers',
            },

            validationResult: {
                errors: []
            },
        };

        model = {type: 'string'};

        dataId = 'firstName';
        changeHandler = sinon.spy();
    });

    describe('when value present', () => {
        beforeEach(() => {
            component = TestUtils.renderIntoDocument(
                <StaticInput
                    cellConfig={cellConfig}
                    id={dataId}
                    label='First Name'
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-react-key'
                    store={store}
                />
            );
        });

        it('displays the value', () => {
            const $p: any = $('p.form-control-static', ReactDOM.findDOMNode(component));
            expect($p).to.have.text('Steve');
        });

    });

    describe('when value not present', () => {
        beforeEach(() => {
            delete store.formValue.firstName;
            component = TestUtils.renderIntoDocument(
                <StaticInput
                    cellConfig={cellConfig}
                    id={dataId}
                    label='First Name'
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-react-key'
                    store={store}
                />
            );
        });

        it('displays the placeholder', () => {
            const $p: any = $('p.form-control-static', ReactDOM.findDOMNode(component));
            expect($p).to.have.text('n/a');
        });
    });

    describe('when value is "" and no placeholder given', () => {
        beforeEach(() => {
            store.formValue.firstName = '';
            delete cellConfig.placeholder;

            component = TestUtils.renderIntoDocument(
                <StaticInput
                    cellConfig={cellConfig}
                    id={dataId}
                    label='First Name'
                    model={model}
                    onChange={changeHandler}
                    reactKey='my-react-key'
                    store={store}
                />
            );
        });

        it('displays the default placeholder', () => {
            const $p: any = $('p.form-control-static', ReactDOM.findDOMNode(component));
            expect($p).to.have.text('—');
        });
    });
});
