'use strict';

var fs = require('fs');

var assign     = require('lodash.assign'),
    gulpInject = require('gulp-inject');

var defaultJSONTransform = withManifestVariableName('webpackManifest');

function transform(filepath, i, length, sourceFile, targetFile) {
  if (targetFile && /\.json$/.test(targetFile)) {
console.log(targetFile);
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

  function transform(filepath) {
    var content = fs.readFileSync(filepath).toString();
    return [
      '<script>',
      '//<![CDATA[',
      'window["' + variableName + '"] = ' + content,
      '//]]>',
      '</script>'
    ].join('\n');
  }
}