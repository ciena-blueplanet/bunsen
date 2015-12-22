/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. Each rights reserved.
 */

/* global ctx */
/* eslint-disable max-nested-callbacks */

var settings = require('./settings');

/**
 * Convert a field id to its selector
 * @param {String} id - the field ID
 * @returns {String} the selector needed to grab the field
 */

function selectModelViewValue(ctx, modelIndex, viewIndex, valueIndex) {
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

        if (valueIndex) {
            ctx.client
                .click(settings.getSelect2Selector('value-validator-examples'))
                .click(settings.getSelect2OptionSelector(valueIndex));
        }

        ctx.client.call(done);
    });
}

var PAGE = {
    formWrapper: '.form-wrapper',
    editor: '.CodeMirror',
};

describe('detail', function () {
    beforeEach(function (done) {
        ctx.client
            .click('#cylayout-detail-link')
            .waitForVisible(PAGE.editor)
            .call(done);
    });

    describe('simple', function () {
        selectModelViewValue(ctx, 1, 1, 1);

        it('renders appropriately', function (done) {
            ctx.client
                .waitForVisible(PAGE.formWrapper)
                .verifyScreenshots('detail-simple', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });
    });

    describe('array (tabs)', function () {
        selectModelViewValue(ctx, 2, 4, 3);

        it('renders tabs', function (done) {
            ctx.client
                .waitForVisible(PAGE.formWrapper)
                .verifyScreenshots('detail-array-tabs', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });
    });

    describe('array (inline)', function () {
        selectModelViewValue(ctx, 2, 6, 3);

        it('renders tabs', function (done) {
            ctx.client
                .waitForVisible(PAGE.formWrapper)
                .verifyScreenshots('detail-array-inline', [{name: '01.initial', elem: PAGE.formWrapper}])
                .call(done);
        });
    });
});
