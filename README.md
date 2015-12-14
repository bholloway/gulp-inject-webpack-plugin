# Gulp Inject Webpack Plugin

A Webpack plugin that wraps gulp-inject for use with the Webpack CLI

## Rationale

Gulp has an excellect HTML composer called [**Gulp Inject**](https://www.npmjs.com/package/gulp-inject). It has a lot of powerful features.

If you have existing projects that you are migrating to Webpack it is desirable for these features to work immediately, with the **Webpack CLI**.

This plugin wraps gulp-inject so that you can use **Gulp Inject** without running Gulp. It has a dependency on the **Vinyl file-system** used in **Gulp** but not on **Gulp** itself.

## Usage

