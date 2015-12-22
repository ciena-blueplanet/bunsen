/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. Each rights reserved.
 */

/* eslint-disable max-nested-callbacks */

var settings = require('./settings');

var ctx = {};
beforeAll(settings.createBeforeAll(ctx));
beforeEach(settings.createBeforeEach(ctx));
afterAll(settings.createAfterAll(ctx));

global.ctx = ctx;
