/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

var webdriverio = require('webdriverio');
var webdrivercss = require('webdrivercss');
var beaker = require('beaker').e2e;
var testConfig = require('./test-config.json');

var url = beaker.getUrl(testConfig);

var NORMAL_VIEWPORT_WIDTH = 1280;
var NORMAL_VIEWPORT_HEIGHT = 800;

/**
 * @typedef Context
 * @property {Object} client - the webdriverio client instance
 */

/**
 * Get the link reference from the link name
 * e.g. foo-bar => #cylayout-foo-bar-link
 * @param {String} name - the name of the link
 * @returns {String} the reference to the link
 */
function getLink(name) {
    return '#cylayout-' + name + '-link';
}

module.exports = {

    getSelect2Selector: function (id) {
        return '[data-id="' + id + '"] .select2-container a';
    },

    getSelect2OptionSelector: function (index) {
        return '.select2-results > li:nth-child(' + index + ') .select2-result-label';
    },

    /**
     * Create a beforeEach callback for setting up bunsen e2e tests
     * @param {Context} ctx - the context for the test we're setting up
     * @returns {Function} a function suitable to be passed to beforeEach()
     */
    createBeforeAll: function (ctx) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 9999999;

        return function () {
            ctx.client = beaker.init(webdriverio, webdrivercss, testConfig);
        };
    },

    /**
     * Create a beforeEach callback for setting up bunsen e2e tests
     * @param {Context} ctx - the context for the test we're setting up
     * @returns {Function} a function suitable to be passed to beforeEach()
     */
    createBeforeEach: function (ctx) {
        return function (done) {
            ctx.client
                .setViewportSize({width: NORMAL_VIEWPORT_WIDTH, height: NORMAL_VIEWPORT_HEIGHT})
                .url(url)
                .localStorage('DELETE')
                .call(done);
        };
    },

    /**
     * Create an afterEach callback for cleaning up after bunsen e2e tests
     * @param {Context} ctx - the context for the test we're setting up
     * @returns {Function} a function suitable to be passed to afterEach()
     */
    createAfterAll: function (ctx) {
        return function (done) {
            ctx.client.end(done);
        };
    },

    /**
     * Generate a beforeEach callback that goes to the given drop-down nav item
     * @param {Context} ctx - the test context
     * @param {String} dropDownName - the name of the drop-down to expand
     * @param {String} linkName - the name of the link within the drop-down to click
     * @returns {Function} a function suitable to be passed to beforeEach()
     */
    goTo: function (ctx, dropDownName, linkName) {
        return function (done) {
            var dropDownLink = getLink(dropDownName);
            var link = getLink(linkName);
            ctx.client
                .waitForVisible(dropDownLink)
                .click(dropDownLink)
                .waitForVisible(link)
                .click(link)
                .call(done);
        };
    },
};
