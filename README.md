# Gulp Inject Webpack Plugin

A Webpack plugin that wraps gulp-inject for use with the Webpack CLI

Use with [**indexhtml-webpack-plugin**](https://www.npmjs.com/package/indexhtml-webpack-plugin) and [**chunk-maifest-webpack-plugin**](https://www.npmjs.com/package/chunk-manifest-webpack-plugin) for a comprehensive solution to your project `index.html` file.

## Rationale

Gulp has an excellect HTML composer called [**Gulp Inject**](https://www.npmjs.com/package/gulp-inject). It has a lot of powerful features.

If you have existing projects that you are migrating to Webpack it is desirable for these features to work immediately, with the **Webpack CLI**.

This plugin wraps gulp-inject so that you can use **Gulp Inject** without running Gulp. It has a dependency on the **Vinyl file-system** used in Gulp but not on **Gulp** itself.

This makes the plugin somewhat of a frankenstein, however the excellent implementation of **Gulp Inject** makes it compelling nonetheless. Over time I am sure we can find a more elegant solution for html injection in Webpack.

To that end, please also consider [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) if you do not need the feature-set of this plugin.

## Usage

### Webpack configuration

In your `webpack.config.js` file the plugin should be instantiated as follows:

```javascript
new GulpInjectPlugin(target, assetsOrChunks, options)
```

Where:
* `target` is the `string` name of a chunk containing a html asset or a html asset relative to `output.path`. It will be edited in place.
* `assetsOrChunks` is a single `string|RegExp` or `Array.<string|RegExp>` list of chunk names and/or asset names relative to `output.path`.
* `options` is an optional hash `object` of options per the [Gulp Inject API](https://www.npmjs.com/package/gulp-inject#api).

In full this would look like the following:

```javascript
var IndexHTMLPlugin     = require('indexhtml-webpack-plugin'),
    ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')
    GulpInjectPlugin    = require('gulp-inject-webpack-plugin');

module.exports = {
  context : __dirname,
  entry   : {
    html  : './src/index.html',
	vendor: './src/vendor.js',
	index : './src/index.js'
  },
  output  : {
    path                                 : './build',
    filename                             : 'assets/[name].[chunkhash].js',
    devtoolModuleFilenameTemplate        : '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  module  : {
    loaders: [
	  {
        test  : /\.html?$/i,
        loader: 'html?removeComments=false&attrs=img:src link:href'
      }
    ]
  },
  plugins : [
    new IndexHTMLPlugin('html', 'index.html'),
	new ChunkManifestPlugin(),
	new GulpInjectPlugin('html', ['manifest.json', /^vendor(\.\w+)$/ 'index'])
  ]
}
```

The `output` options should be configured to your own taste, but it is a good idea to use a `chunkhash` for [long term caching](https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95).

Note the usage of `IndexHTMLPlugin`. This allows you to add assets such as `favicon.ico` to your HTML such that they are processed by Webpack.

Note the usage of `ChunkManifestPlugin`. This is important for [long term caching](https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95) and will produce a `manifest.json` that should be injected as the first item.

Note the usage of a Regular Expression for the `vendor` chunk. This will allow you to do **bundle splitting** as discussed below.

### Source file

The `./src/index.html` of the Webpack configuration is the source file for your project html file.

This source file should include the necessary [injection placeholder comments](https://www.npmjs.com/package/gulp-inject#basic-usage) used by Gulp Inject. For example:

```javascript
<!DOCTYPE html>
<html>
<head>
  <!-- inject:css -->
  <!-- endinject -->
</head>
<body>
  <!-- inject:json -->
  <!-- endinject -->
  
  <!-- inject:js -->
  <!-- endinject -->
</body>
</html>
```

Note that the additional `<!-- inject:json -->` placeholder is necessary where you wish to inject the cache manifest `.json` file.

### Options

Where the optional `options` hash is specified it is passed to Gulp Inject.

Note that `options.quiet` is asserted by default. This prevents Gulp Inject from creating log output in the Gulp Utils format. However you may find this option useful for debugging problems.

### Regular Expressions (Bundle Splitting)

Sure we could automatically detect the files omitted in your compile and pass them to Gulp Inject. However we would not be able to determine the correct order.

Chunk order is important, and it may even be that certain chunks should only be included in certain `html` files. For this reason we do not automatically detect and the `assetsOrChunks` list is **explicit**.

But your code may define arbitrary split points and you wont't want this to be coupled with the `assetsOrChunks` list in your configuration. We can remedy this by using one or more `Regular Expression` elements in the `assetsOrChunks` list. The limitation being you must [name chunks](https://webpack.github.io/docs/code-splitting.html#named-chunks) in order to write a meaningful expression.

Here is an example for a simple `vendor.js`, split using common-js syntax to split chunk `vendor` into chunks `vendor.jquery`, `vendor.angular` and `vendor` (rest).

```javascript
require.ensure([
    'jquery',
], function() {
	require.ensure([
		'angular',
	], function() {
		...
	}, 'vendor.angular')
}, 'vendor.jquery');
```

The order in which the `vendor*` chunks are injected does not matter because `ensure()` determines the execution order. Therefore we can group them all together with the single expression `/^vendor(\.\w+)$/` as shown in the example configuration above.

### Chunk Manifest

In addition to the [default transforms](https://github.com/klei/gulp-inject/blob/master/README.md#injecttransform) the plugin adds a transform for `.json` files which will embed the Cache Manifest JSON data in the page.

Similar to Gulp Inject, all transforms are exported under the hash `GulpInjectPlugin.transform`.

By default `GulpInjectPlugin.transform.json` expects the default manifest varaible name of `webpackManifest`. However you may change it by using a more explicit plugin configuration.

```javascript
module.exports = {
  ...
  plugins: [
    new IndexHTMLPlugin('html', 'index.html'),
	new ChunkManifestPlugin({
      filename        : 'foo.json',
      manifestVariable: 'bar'
	}),
	new GulpInjectPlugin('index'),
	new GulpInjectPlugin('foo.json', {
	  transform: GulpInjectPlugin.transforms.json.withManifestVariableName('bar')
	})
  ]
}
```

Don't forget to include a JSON injection placeholder, such as `<!-- inject:json -->`, in your HTML source file.