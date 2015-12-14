'use strict';

var path = require('path');

var assign     = require('lodash.assign'),
    vinylFS    = require('vinyl-fs'),
    gulpInject = require('gulp-inject');

function GulpInjectWebpackPlugin(filesOrChunks, options) {
  this.filesOrChunks = filesOrChunks;
  this.options = options;
}

module.exports = GulpInjectWebpackPlugin;

GulpInjectWebpackPlugin.prototype.apply = function apply(compiler) {

  // hook the done phase
  compiler.plugin('done', onDone);

  function onDone(stats) {
    var json = stats.toJson();
    console.log(Object.keys(json));

    //console.log(fs.readdirSync(path.resolve(compiler.options.output.path)));
    //console.log(stats.toJson().assetsByChunkName);
  }
};