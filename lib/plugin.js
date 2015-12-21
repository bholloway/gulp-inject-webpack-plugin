'use strict';

var path = require('path');

var assign     = require('lodash.assign'),
    vinylFS    = require('vinyl-fs'),
    gulpInject = require('gulp-inject'),
    Stats      = require('webpack/lib/Stats');

var matchAssets = require('./match-assets');

var PLUGIN_NAME = require('../package.json').name;

function plugin(target, assetsOrChunks, options) {
  if (!target || (typeof target !== 'string')) {
    throw new Error(PLUGIN_NAME + ': target parameter must be a string asset or chunk name');
  }
  this.target = target;
  this.assetsOrChunks = [].concat(assetsOrChunks).filter(Boolean);
  this.options = assign({
    quiet    : true,
    transform: require('./transform')
  }, options);
}

module.exports = plugin;

plugin.prototype.apply = function apply(compiler) {
  var target         = this.target,
      assetsOrChunks = this.assetsOrChunks,
      options        = this.options;

  // hook the after-emit phase
  compiler.plugin('after-emit', afterEmit);

  function afterEmit(compilation, done) {

    // get stats before they are ready because we need an async handler
    var stats    = (new Stats(compilation)).toJson(),
        htmlFile = matchAssets(target, stats)
          .reduce(reduceTargets, false);

    // target html file
    if (htmlFile) {
      var base        = path.resolve(compilation.getPath(compiler.outputPath)),
          htmlPath    = path.dirname(path.resolve(base, htmlFile)),
          vinylOpts   = {cwd: base, base: htmlPath},
          injectables = vinylFS.src(matchAssets(assetsOrChunks, stats, base), vinylOpts);

      vinylFS.src(htmlFile, vinylOpts)
        .pipe(gulpInject(injectables, options))
        .pipe(vinylFS.dest(vinylOpts.base))
        .on('data', complete);
    }
    // target not found
    else {
      compilation.errors.push(PLUGIN_NAME + ': cannot resolve target html file');
      done();
    }

    function complete() {
      done();
    }
  }
};

function reduceTargets(reduced, value) {
  return reduced || /\.html?$/.test(value) && value;
}
