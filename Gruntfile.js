/**
 * @file Gruntfile
 * @copyright 2015 Ciena Corporation. All rights reserved.
*/

var path = require('path');

var beaker = require('beaker');

module.exports = function (grunt) {

    // pour the default configs from beaker into grunt
    beaker.pour(grunt);

    // If you want to override part of the grunt config, you can do so by uncommenting/editing below
    //grunt.config.data.eslint.options.config = '.custom-eslintrc';
    grunt.config.data.karma.options.reporters = ['dots'];
    grunt.config.data.karma.coverage.coverageReporter = {
        dir: path.join(process.cwd(), 'coverage'),
        reporters: [
            {type: 'text-summary'},
            {type: 'html'},
            {type: 'lcovonly'},
        ],
    };

    // You can also add custom grunt tasks here if you want
    /*
    grunt.registerTask('say-hi', 'says hi', function () {
        grunt.log.writeln('Hello!');
    });
    */
};
