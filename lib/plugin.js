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

  // hook the compilation
  compiler.plugin('compilation', onCompilation);

  // hook the after-emit phase
  compiler.plugin('after-emit', afterEmit);

  /**
   * The overall hash can effect the hash of the main-template so we need to delete it from the render phase.
   * This presumes that the chunk manifest has already be externalised.
   */
  function onCompilation(compilation) {
    if (typeof compilation.mainTemplate.render === 'function') {
      compilation.mainTemplate.render = render;
    }

    function render(hash, chunk, moduleTemplate, dependencyTemplates) {
      return Object.getPrototypeOf(compilation.mainTemplate).render
        .call(compilation.mainTemplate, '', chunk, moduleTemplate, dependencyTemplates);
    }
  }

  /**
   * Perform injection into the existing html output.
   */
  function afterEmit(compilation, done) {

    // get stats before they are ready because we need an async handler
    var stats    = (new Stats(compilation)).toJson(),
        htmlFile = matchAssets(target, stats)
          .reduce(reduceTargets, false);

    // target html file
    if (htmlFile) {
      var base        = path.resolve(compilation.getPath(compiler.outputPath)),
          injectables = vinylFS.src(matchAssets(assetsOrChunks, stats, base), {cwd: base});

      vinylFS.src(htmlFile, {cwd: base})
        .pipe(gulpInject(injectables, options))
        .pipe(vinylFS.dest(base))
        .on('data', complete);
    }
    // target not found
    else {
      compilation.errors.push(PLUGIN_NAME + ': cannot resolve target html file');
      done();
    }

    function reduceTargets(reduced, value) {
      return reduced || /\.html?$/.test(value) && value;
    }

    function complete() {
      done();
    }
  }
};
