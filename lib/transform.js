'use strict';

var fs = require('fs');

var assign     = require('lodash.assign'),
    gulpInject = require('gulp-inject');

function transform(filepath, sourceFile, i, length, targetFile) {
  if (targetFile && /\.html?$/.test(targetFile.path) && /\.json$/.test(filepath)) {
    return transform.html.json.apply(transform, arguments);
  }
  else {
    return gulpInject.transform.apply(gulpInject.transform, arguments);
  }
}

module.exports = assign(transform, gulpInject.transform);

transform.html.json = withManifestVariableName('webpackManifest');

function withManifestVariableName(variableName) {
  return assign(transform, {
    withManifestVariableName: withManifestVariableName
  });

  function transform(filepath, sourceFile) {
    return '<script>window["' + variableName + '"]=' + sourceFile.contents.toString() + ';</script>';
  }
}