/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* global ctx */
/* eslint-disable max-nested-callbacks */

var settings = require('./settings');

var PAGE = {
    container: '.container',
    validatorContainer: '.validator-container',
    editorWrapper: '.editor-wrapper',
    editor: '.CodeMirror',
    viewEditorWrapper: '.view-col .editor-wrapper',
    viewEditor: '.view-col .editor-wrapper .CodeMirror',
};

describe('validators', function () {

    describe('model', function () {
        beforeEach(settings.goTo(ctx, 'validators', 'validators-model'));
        beforeEach(function (done) {
            ctx.client
                .waitForVisible(PAGE.editor)
                .call(done);
        });

        it('shows valid for default', function (done) {
            ctx.client
                .getAttribute(PAGE.editorWrapper, 'class', function (err, classes) {
                    expect(err).toBeFalsy();
                    expect(classes.indexOf('bg-success')).not.toBe(-1);
                })
                .verifyScreenshots('validators-model', [{name: '01.initial', elem: PAGE.container}])
                .call(done);
        });

        describe('when invalid value entered', function () {
            beforeEach(function (done) {
                ctx.client
                    .execute(function () {
                        var invalidModel = {
                            type: 'object',
                            properties: {
                                age: {type: 'number'},
                                employed: {type: 'null'},
                                employer: {type: 'string'},
                            },
                            required: ['age', 'employed'],
                        };
                        window.modelEditor.setValue(JSON.stringify(invalidModel, null, 4));
                    })
                    .call(done);
            });

            it('shows the error', function (done) {
                ctx.client
                    .getAttribute(PAGE.editorWrapper, 'class', function (err, classes) {
                        expect(err).toBeFalsy();
                        expect(classes.indexOf('bg-danger')).not.toBe(-1);
                    })
                    .verifyScreenshots('validators-model', [{name: '02.error', elem: PAGE.container}])
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
                            window.modelEditor.setValue(JSON.stringify(model, null, 4));
                        })
                        .call(done);
                });

                it('removes the error', function (done) {
                    ctx.client
                        .getAttribute(PAGE.editorWrapper, 'class', function (err, classes) {
                            expect(err).toBeFalsy();
                            expect(classes.indexOf('bg-success')).not.toBe(-1);
                        })
                        .verifyScreenshots('validators-model', [{name: '03.success', elem: PAGE.container}])
                        .call(done);
                });
            });
        });
    });

    describe('view', function () {
        beforeEach(settings.goTo(ctx, 'validators', 'validators-view'));
        beforeEach(function (done) {
            ctx.client
                .waitForVisible(PAGE.viewEditor)
                .call(done);
        });

        it('shows valid for default', function (done) {
            ctx.client
                .getAttribute(PAGE.viewEditorWrapper, 'class', function (err, classes) {
                    expect(err).toBeFalsy();
                    expect(classes.indexOf('bg-success')).not.toBe(-1);
                })
                .verifyScreenshots('validators-view', [{name: '01.initial', elem: PAGE.validatorContainer}])
                .call(done);
        });

        describe('when invalid value entered', function () {
            beforeEach(function (done) {
                ctx.client
                    .execute(function () {
                        var invalidView = {
                            version: '1.0',
                            type: 'form',
                            containers: [
                                {
                                    id: 'main',
                                    rows: [
                                        [{model: 'first'}],
                                        [{model: 'last'}],
                                        [
                                            {
                                                model: 'addresses',
                                                item: {
                                                    container: 'address',
                                                },
                                            },
                                        ],
                                    ],
                                },
                            ],
                            rootContainers: [
                                {
                                    label: 'Main',
                                    container: 'main',
                                },
                            ],
                        };
                        window.viewEditor.setValue(JSON.stringify(invalidView, null, 4));
                    })
                    .call(done);
            });

            it('shows the error', function (done) {
                ctx.client
                    .getAttribute(PAGE.viewEditorWrapper, 'class', function (err, classes) {
                        expect(err).toBeFalsy();
                        expect(classes.indexOf('bg-danger')).not.toBe(-1);
                    })
                    .verifyScreenshots('validators-view', [{name: '02.error', elem: PAGE.validatorContainer}])
                    .call(done);
            });

            describe('when valid value entered', function () {
                beforeEach(function (done) {
                    ctx.client
                        .execute(function () {
                            var view = {
                                version: '1.0',
                                type: 'form',
                                containers: [
                                    {
                                        id: 'main',
                                        rows: [
                                            [{model: 'lastName'}, {model: 'firstName'}],
                                        ],
                                    },
                                ],
                                rootContainers: [
                                    {
                                        label: 'Main',
                                        container: 'main',
                                    },
                                ],
                            };
                            window.viewEditor.setValue(JSON.stringify(view, null, 4));
                        })
                        .call(done);
                });

                it('removes the error', function (done) {
                    ctx.client
                        .getAttribute(PAGE.viewEditorWrapper, 'class', function (err, classes) {
                            expect(err).toBeFalsy();
                            expect(classes.indexOf('bg-success')).not.toBe(-1);
                        })
                        .verifyScreenshots('validators-view', [{name: '03.success', elem: PAGE.validatorContainer}])
                        .call(done);
                });
            });
        });
    });
});
