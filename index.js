'use strict';

/**
 * Export the Webpack plugin
 */
module.exports = require('./lib/plugin');

/**
 * Export the default transform function(s)
 */
exports.transform = require('./lib/transform');