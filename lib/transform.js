'use strict';

var fs = require('fs');

var assign     = require('lodash.assign'),
    gulpInject = require('gulp-inject');

var defaultJSONTransform = withManifestVariableName('webpackManifest');

function transform(filepath, i, length, sourceFile, targetFile) {
  if (targetFile && /\.html?$/.test(targetFile.path) && /\.json$/.test(filepath)) {
    return defaultJSONTransform.apply(transform, arguments);
  }
  else {
    return gulpInject.transform.apply(gulpInject.transform, arguments);
  }
}

module.exports = assign(transform, gulpInject.transform, {
  'transform.html.json': defaultJSONTransform
});

function withManifestVariableName(variableName) {
  return assign(transform, {
    withManifestVariableName: withManifestVariableName
  });

  function transform(filepath, file) {
console.log(arguments); // TODO
    return '<script>//<![CDATA[window["' + variableName + '"]=' + file.content.toString() + '//]]></script>';
  }
}