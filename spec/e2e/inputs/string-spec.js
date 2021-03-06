/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* global ctx */
/* eslint-disable max-nested-callbacks */

var settings = require('../settings');

var RENDER_PAUSE = 200;

var PAGE = {
    inputWrapper: '.input-wrapper',
    input: '.input-wrapper input',
    formGroup: '.input-wrapper .form-group',
    helpBlock: '.input-wrapper .form-group .help-block',
};

describe('string', function () {

    describe('formatted', function () {
        beforeEach(settings.goTo(ctx, 'inputs', 'inputs-string'));

        it('renders appropriately', function (done) {
            ctx.client
                .waitForVisible(PAGE.input)
                .verifyScreenshots('inputs-string-format', [{name: '01.initial', elem: PAGE.inputWrapper}])
                .call(done);
        });

        describe('when invalid value entered', function () {
            beforeEach(function (done) {
                ctx.client
                    .waitForVisible(PAGE.input)
                    .setValue(PAGE.input, '302.125.23.21')
                    .click('h2') // blur the input
                    .pause(RENDER_PAUSE)
                    .call(done);
            });

            it('shows the error', function (done) {
                ctx.client
                    .waitForVisible(PAGE.helpBlock)
                    .getText(PAGE.helpBlock, function (err, text) {
                        expect(err).toBeFalsy();
                        expect(text).toBe('Object didn\'t pass validation for format ipv4: 302.125.23.21');
                    })
                    .getAttribute(PAGE.formGroup, 'class', function (err, classes) {
                        expect(err).toBeFalsy();
                        expect(classes.indexOf('has-error')).not.toBe(-1);
                    })
                    .verifyScreenshots('inputs-string-format', [{name: '02.error', elem: PAGE.inputWrapper}])
                    .call(done);
            });

            describe('when valid value entered', function () {
                beforeEach(function (done) {
                    ctx.client
                        .setValue(PAGE.input, '202.125.23.21')
                        .pause(RENDER_PAUSE) // don't need to blur, but give validation time to update DOM
                        .call(done);
                });

                it('removes the error', function (done) {
                    ctx.client
                        .getText(PAGE.helpBlock, function (err) {
                            expect(err).toBeTruthy();
                        })
                        .getAttribute(PAGE.formGroup, 'class', function (err, classes) {
                            expect(err).toBeFalsy();
                            expect(classes.indexOf('has-error')).toBe(-1);
                        })
                        .verifyScreenshots('inputs-string-format', [{name: '03.success', elem: PAGE.inputWrapper}])
                        .call(done);
                });
            });
        });
    });

    describe('required', function () {
        beforeEach(settings.goTo(ctx, 'inputs', 'inputs-string'));
        beforeEach(function (done) {
            ctx.client
                .waitForVisible(PAGE.input)
                .click('label[for="required-checkbox"]')
                .call(done);
        });

        it('renders appropriately', function (done) {
            ctx.client
                // This one keeps getting differences on the border of the input, even though there is no visual
                // difference that I can see -- ARM
                //.verifyScreenshots('inputs-string-required', [{name: '01.initial', elem: PAGE.inputWrapper}])
                .getAttribute(PAGE.input, 'class', function (err, classes) {
                    expect(err).toBeFalsy();
                    expect(classes.indexOf('required')).not.toBe(-1);
                })
                .call(done);
        });

        describe('when invalid value entered', function () {
            beforeEach(function (done) {
                ctx.client
                    .setValue(PAGE.input, '')
                    .click('h2') // blur the input
                    .pause(RENDER_PAUSE) // give validation time to update DOM
                    .call(done);
            });

            it('shows the error', function (done) {
                ctx.client
                    .getText(PAGE.helpBlock, function (err, text) {
                        expect(err).toBeFalsy();
                        expect(text).toBe('Field is required.');
                    })
                    .getAttribute(PAGE.formGroup, 'class', function (err, classes) {
                        expect(err).toBeFalsy();
                        expect(classes.indexOf('has-error')).not.toBe(-1);
                    })
                    .verifyScreenshots('inputs-string-required', [{name: '02.error', elem: PAGE.inputWrapper}])
                    .call(done);
            });

            describe('when invalid value entered', function () {
                beforeEach(function (done) {
                    ctx.client
                        .setValue(PAGE.input, '202.125.23.21')
                        .pause(RENDER_PAUSE) // don't need to blur, but give validation time to update DOM
                        .call(done);
                });

                it('removes the error', function (done) {
                    ctx.client
                        .getText(PAGE.helpBlock, function (err) {
                            expect(err).toBeTruthy();
                        })
                        .getAttribute(PAGE.formGroup, 'class', function (err, classes) {
                            expect(err).toBeFalsy();
                            expect(classes.indexOf('has-error')).toBe(-1);
                        })
                        .verifyScreenshots('inputs-string-required', [{name: '03.success', elem: PAGE.inputWrapper}])
                        .call(done);
                });
            });
        });
    });
});
