/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. Each rights reserved.
 */

/* global ctx */
/* eslint-disable max-nested-callbacks */

var settings = require('./settings');

var ANIMATION_DELAY = 500; // ms

/**
 * Convert a field id to its selector
 * @param {String} id - the field ID
 * @returns {String} the selector needed to grab the field
 */
function getSelector(id) {
    return '[data-id="' + id + '"]';
}

function selectModelView(ctx, modelIndex, viewIndex) {
    beforeEach(function (done) {
        if (modelIndex) {
            ctx.client
                .click(settings.getSelect2Selector('model-validator-examples'))
                .click(settings.getSelect2OptionSelector(modelIndex));
        }

        if (viewIndex) {
            ctx.client
                .click(settings.getSelect2Selector('view-validator-examples'))
                .click(settings.getSelect2OptionSelector(viewIndex));
        }

        ctx.client.call(done);
    });
}

var RENDER_PAUSE = 100;

var PAGE = {
    formWrapper: '.form-wrapper',
    formValue: '.form-value pre',
    alias: getSelector('alias'),
    firstName: getSelector('firstName'),
    lastName: getSelector('lastName'),
    lastNameError: getSelector('lastName') + ' + .help-block',
    addAddress: getSelector('addresses') + ' .add-item',
};

describe('forms', function () {

    describe('simple', function () {
        selectModelView(ctx, 1, 1);

        it('renders appropriately', function (done) {
            ctx.client
                .waitForVisible(PAGE.formValue)
                .getText(PAGE.formValue, function (err, value) {
                    expect(err).toBeFalsy();
                    expect(value).toBe(JSON.stringify({onlyChild: false}, null, 4));
                })
                .verifyScreenshots('form-simple', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });

        describe('when required field is left off (but gains/looses focus)', function () {
            beforeEach(function (done) {
                ctx.client
                    .setValue(PAGE.alias, 'Captain America')
                    .setValue(PAGE.firstName, 'Steve')
                    .setValue(PAGE.lastName, '')
                    .click('h2') // blur the input
                    .pause(RENDER_PAUSE)
                    .call(done);
            });

            it('displays missing required field error', function (done) {
                ctx.client
                    .waitForVisible(PAGE.lastNameError)
                    .getText(PAGE.lastNameError, function (err, value) {
                        expect(err).toBeFalsy();
                        expect(value).toBe('Field is required.');
                    })
                    .verifyScreenshots('form-simple', [{name: '02.missing-last-name', elem: PAGE.formWrapper}])
                    .call(done);
            });

            it('shows form value', function (done) {
                ctx.client
                    .waitForVisible(PAGE.formValue)
                    .getText(PAGE.formValue, function (err, value) {
                        var valueObj = {
                            onlyChild: false,
                            alias: 'Captain America',
                            firstName: 'Steve',
                        };

                        expect(err).toBeFalsy();
                        expect(value).toBe(JSON.stringify(valueObj, null, 4));
                    })
                    .call(done);
            });

            describe('when required field is entered', function () {
                beforeEach(function (done) {
                    ctx.client
                        .setValue(PAGE.lastName, 'Rogers')
                        .click('h2') // blur the input
                        .pause(RENDER_PAUSE)
                        .call(done);
                });

                it('displays missing required field error', function (done) {
                    ctx.client
                        .getText(PAGE.lastNameError, function (err) {
                            expect(err).toBeTruthy();
                        })
                        .verifyScreenshots('form-simple', [{name: '03.all-valid', elem: PAGE.formWrapper}])
                        .call(done);
                });

                it('shows form value', function (done) {
                    ctx.client
                        .waitForVisible(PAGE.formValue)
                        .getText(PAGE.formValue, function (err, value) {
                            var valueObj = {
                                onlyChild: false,
                                alias: 'Captain America',
                                firstName: 'Steve',
                                lastName: 'Rogers',
                            };

                            expect(err).toBeFalsy();
                            expect(value).toBe(JSON.stringify(valueObj, null, 4));
                        })
                        .call(done);
                });
            });
        });

        describe('when custom validation is triggered', function () {
            beforeEach(function (done) {
                ctx.client
                    .setValue(PAGE.alias, 'Nobody')
                    .setValue(PAGE.firstName, 'John')
                    .setValue(PAGE.lastName, 'Doe')
                    .click('h2') // blur the input
                    .pause(RENDER_PAUSE)
                    .call(done);
            });

            it('displays errors', function (done) {
                ctx.client
                    .waitForVisible(PAGE.lastNameError)
                    .getText(PAGE.lastNameError, function (err, value) {
                        expect(err).toBeFalsy();
                        expect(value).toBe('Nice Try! What is your real name?');
                    })
                    .verifyScreenshots('form-simple', [{name: '04.custom-validation', elem: PAGE.formWrapper}])
                    .call(done);
            });
        });
    });

    describe('array', function () {
        selectModelView(ctx, 2, 2);

        it('renders appropriately', function (done) {
            ctx.client
                .waitForVisible(PAGE.formValue)
                .getText(PAGE.formValue, function (err, value) {
                    expect(err).toBeFalsy();
                    expect(value).toBe('{}');
                })
                .verifyScreenshots('form-array', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });

        describe('after item added and filled in', function () {
            beforeEach(function (done) {
                ctx.client
                    .waitForVisible(getSelector('name.first'))
                    .setValue(getSelector('name.first'), 'Clark')
                    .setValue(getSelector('name.last'), 'Kent')
                    .click(PAGE.addAddress)
                    .setValue(getSelector('addresses[0].street'), '123 Hickory Ln.')
                    .setValue(getSelector('addresses[0].city'), 'Smallville')
                    .setValue(getSelector('addresses[0].state'), 'Kansas')
                    .setValue(getSelector('addresses[0].zip'), '66605')
                    .click('h2') // blur the input
                    .pause(RENDER_PAUSE)
                    .call(done);
            });

            it('shows item form', function (done) {
                ctx.client
                    .verifyScreenshots('form-array', [{name: '02.one-item-form', elem: PAGE.formWrapper}])
                    .call(done);
            });

            it('shows item value', function (done) {
                ctx.client
                    .waitForVisible(PAGE.formValue)
                    .getText(PAGE.formValue, function (err, value) {
                        var valueObj = {
                            name: {
                                first: 'Clark',
                                last: 'Kent',
                            },
                            addresses: [
                                {
                                    street: '123 Hickory Ln.',
                                    city: 'Smallville',
                                    state: 'Kansas',
                                    zip: '66605',
                                },
                            ],
                        };
                        expect(err).toBeFalsy();
                        expect(value).toBe(JSON.stringify(valueObj, null, 4));
                    })
                    .call(done);
            });
        });
    });

    describe('l3vpn', function () {
        selectModelView(ctx, 4, 5);

        it('renders appropriately', function (done) {
            var expected = {
                desiredOrchState: 'active',
                discovered: false,
                properties: {
                    service: {
                        'svc-bandwidth': '50000000',
                    },
                },
            };

            ctx.client
                .waitForVisible(PAGE.formValue)
                .getText(PAGE.formValue, function (err, value) {
                    expect(err).toBeFalsy();
                    expect(value).toBe(JSON.stringify(expected, null, 4));
                })
                .verifyScreenshots('form-l3vpn', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });
    });

    describe('dependencies', function () {
        selectModelView(ctx, 5, 7);

        it('renders appropriately', function (done) {
            ctx.client
                .waitForVisible(PAGE.formValue)
                .pause(ANIMATION_DELAY)
                .getText(PAGE.formValue, function (err, value) {
                    expect(err).toBeFalsy();
                    expect(value).toBe('{}');
                })
                .verifyScreenshots('form-dependencies', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });
    });
});
