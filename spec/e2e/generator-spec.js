/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* global ctx */
/* eslint-disable max-nested-callbacks */

var settings = require('./settings');

var PAGE = {
    container: 'body > div:nth-child(1) > div.container-fluid',
    editor: '.CodeMirror',
    viewWrapper: '.view-wrapper',
    view: '.view-wrapper pre',
};

function selectModel(ctx, modelIndex) {
    beforeEach(function (done) {
        ctx.client
            .click('#cylayout-generator-link')
            .waitForVisible(PAGE.editor)
            .click(settings.getSelect2Selector('model-validator-examples'))
            .click(settings.getSelect2OptionSelector(modelIndex))
            .call(done);
    });
}

describe('generator', function () {

    describe('simple', function () {
        selectModel(ctx, 1);

        it('shows valid for default', function (done) {
            ctx.client
                .waitForVisible(PAGE.view)
                .getText(PAGE.view, function (err, text) {
                    var validView = {
                        version: '1.0',
                        type: 'form',
                        rootContainers: [{label: 'Main', container: 'main'}],
                        containers: [
                            {
                                id: 'main',
                                rows: [
                                    [{model: 'firstName'}],
                                    [{model: 'lastName'}],
                                    [{model: 'alias'}],
                                    [{model: 'onlyChild'}],
                                ],
                            },
                        ],
                    };
                    expect(err).toBeFalsy();
                    expect(text).toBe(JSON.stringify(validView, null, 4));
                })
                .verifyScreenshots('generators-simple', [{name: '01.initial', elem: PAGE.container}])
                .call(done);
        });

        describe('when invalid value entered', function () {
            beforeEach(function (done) {
                ctx.client
                    .execute(function () {
                        var invalidModel = {
                            type: 'object',
                            properties: {
                                age: {type: 'integer'},
                                employed: {type: 'boolean'},
                                employer: {type: 'string'},
                            },
                            required: ['age', 'employed'],
                        };
                        window.editor.setValue(JSON.stringify(invalidModel, null, 4));
                    })
                    .call(done);
            });

            it('generates an empty object', function (done) {
                ctx.client
                    .waitForVisible(PAGE.view)
                    .getText(PAGE.view, function (err, text) {
                        expect(err).toBeFalsy();
                        expect(text).toBe('{}');
                    })
                    .verifyScreenshots('generators-simple', [{name: '02.error', elem: PAGE.container}])
                    .call(done);
            });

            describe('when valid value entered', function () {
                beforeEach(function (done) {
                    ctx.client
                        .execute(function () {
                            var model = {
                                type: 'object',
                                properties: {
                                    first: {type: 'string'},
                                    last: {type: 'string'},
                                },
                            };
                            window.editor.setValue(JSON.stringify(model, null, 4));
                        })
                        .call(done);
                });

                it('removes the error', function (done) {
                    ctx.client
                        .waitForVisible(PAGE.view)
                        .getText(PAGE.view, function (err, text) {
                            var validView = {
                                version: '1.0',
                                type: 'form',
                                rootContainers: [{label: 'Main', container: 'main'}],
                                containers: [
                                    {
                                        id: 'main',
                                        rows: [
                                            [{model: 'first'}],
                                            [{model: 'last'}],
                                        ],
                                    },
                                ],
                            };
                            expect(err).toBeFalsy();
                            expect(text).toBe(JSON.stringify(validView, null, 4));
                        })
                        .verifyScreenshots('generators-simple', [{name: '03.success', elem: PAGE.container}])
                        .call(done);
                });
            });
        });
    });
});
