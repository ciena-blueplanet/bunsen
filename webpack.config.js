/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

var path = require('path');
var loaders = require('beaker/config/webpack/loaders');
var resolve = require('beaker/config/webpack/resolve');

// add typescript and tsx extensions and loader
resolve.extensions.push('.tsx', '.ts');

loaders.push({
    test: /\.tsx?$/,
    loader: 'babel?plugins=object-assign!ts-loader',
});

module.exports = {
    entry: {
        demo: './demo/js/demo.tsx',
    },

    devtool: 'cheap-module-source-map',

    output: {
        path: 'demo/bundle',
        publicPath: 'bundle/',
        filename: 'demo-entry.js',
        pathinfo: true,
    },

    plugins: [],

    module: {
        preLoaders: [{
            test: /demo/,
            loader: path.join(process.cwd(), 'node_modules/beaker/config/karma/self-loader.js'),
        }],
        loaders: loaders,
    },

    resolve: resolve,
};
