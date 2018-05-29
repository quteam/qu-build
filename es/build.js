import "core-js/modules/es6.string.iterator";
import "core-js/modules/es6.array.from";
import "core-js/modules/es7.symbol.async-iterator";
import "core-js/modules/es6.symbol";
import "core-js/modules/es6.regexp.to-string";
import "core-js/modules/es6.date.to-string";
import "core-js/modules/es6.function.name";
import "core-js/modules/es6.array.for-each";
import "core-js/modules/es6.object.assign";
import "core-js/modules/es6.array.map";
import "core-js/modules/web.dom.iterable";
import "core-js/modules/es6.array.iterator";
import "core-js/modules/es6.object.keys";
import "core-js/modules/es6.array.some";
import "core-js/modules/es6.array.is-array";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import { join, resolve } from 'path';
import { writeFileSync, existsSync } from 'fs';
import webpack, { ProgressPlugin } from 'webpack';
import rimraf from 'rimraf';
import chalk from 'chalk';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import mergeCustomConfig from './merge-custom-config';
import getWebpackCommonConfig from './get-webpack-common-config';
import injectLoaderOptions from './inject-loader-options';
import devServer from './dev-server';

function checkConfig(webpackConfig) {
  var config = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
  var hasEmptyEntry = config.some(function (c) {
    return Object.keys(c.entry || {}).length === 0;
  });

  if (hasEmptyEntry) {
    var err = new Error('no webpack entry found');
    err.name = 'NoEntry';
    throw err;
  }
}

function getWebpackConfig() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    cwd: process.cwd()
  };
  var cache = arguments.length > 1 ? arguments[1] : undefined;
  var pkgPath = join(args.cwd, 'package.json');
  var pkg = existsSync(pkgPath) ? require(pkgPath) : {};
  var webpackConfig = getWebpackCommonConfig(args);
  injectLoaderOptions(webpackConfig, args);
  webpackConfig.plugins = webpackConfig.plugins || [];

  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  if (!args.dev && !args.watch) {
    webpackConfig.plugins = _toConsumableArray(webpackConfig.plugins).concat([new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })]);
  } else {
    webpackConfig.plugins = _toConsumableArray(webpackConfig.plugins).concat([new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })]);
  }

  webpackConfig.plugins = _toConsumableArray(webpackConfig.plugins);

  if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
  }

  var commonName = args.hash ? 'js/common-[chunkhash:5].js' : 'js/common.js';
  var entryArr = Object.keys(webpackConfig.entry);
  entryArr.map(function (pathname) {
    var conf = {
      filename: "".concat(pathname, ".html"),
      template: "".concat(webpackConfig.entry[pathname], "/page.html"),
      inject: true,
      chunksSortMode: 'dependency'
    };

    if (args.dev) {
      conf.hash = true;
    } else {
      conf.minify = Object.assign({
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true
      }, pkg.htmlConfig || {});
      conf.filename = "html/".concat(pathname, ".html");
    }

    if (entryArr.length > 1) {
      conf.chunks = ['common', pathname];
    }

    webpackConfig.plugins.push(new HtmlWebpackPlugin(conf));
  });
  checkConfig(webpackConfig);
  return webpackConfig;
}

export { webpack, getWebpackConfig };
export default function build(args, callback) {
  var pkgPath = join(args.cwd, 'package.json');
  var pkg = existsSync(pkgPath) ? require(pkgPath) : {};
  var webpackConfig = getWebpackConfig(args, {});
  webpackConfig = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
  var fileOutputPath;
  webpackConfig.forEach(function (config) {
    fileOutputPath = config.output.path;

    if (args.dev) {
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
      var devClientPath = resolve(process.mainModule.filename, '../../lib/dev-client');
      Object.keys(config.entry).forEach(function (name) {
        config.entry[name] = [devClientPath].concat(config.entry[name]);
      });
    } else {
      rimraf.sync(fileOutputPath);

      var _publicPath = resolve(args.cwd, './public');

      if (existsSync(_publicPath)) {
        config.plugins.push(new CopyWebpackPlugin([{
          from: _publicPath,
          ignore: ['.*']
        }], {
          copyUnmodified: true
        }));
      }

      if (args.pwa) {
        config.plugins.push(new SWPrecacheWebpackPlugin({
          cacheId: "".concat(pkg.name, "-res"),
          filename: 'sw.js',
          staticFileGlobs: ["".concat(fileOutputPath, "/**/*.{js,css,jpg,jpeg,png,gif,ico,woff,woff2,ttf,svg,eot}")],
          minify: true,
          navigateFallback: '/fail.html',
          stripPrefix: "".concat(fileOutputPath)
        }));
      }
    }
  });
  webpackConfig.forEach(function (config) {
    config.plugins.push(new ProgressPlugin(function (percentage, msg, addInfo) {
      var stream = process.stderr;

      if (stream.isTTY && percentage < 1) {
        stream.cursorTo(0);
        stream.write("".concat(chalk.magenta(msg), " (").concat(chalk.magenta(addInfo), ")"));
        stream.clearLine(1);
      } else if (percentage === 1) {
        stream.cursorTo(0);
        stream.write('Bundle build is now finished.\n');
        stream.clearLine(1);
      }
    }));
  });

  function doneHandler(err, stats) {
    if (err) {
      console.log(err);
      return;
    }

    if (args.json) {
      var filename = typeof args.json === 'boolean' ? 'build-bundle.json' : args.json;
      var jsonPath = join(fileOutputPath, filename);
      writeFileSync(jsonPath, JSON.stringify(stats.toJson()), 'utf-8');
      console.log("Generate Json File: ".concat(jsonPath));
    }

    var _stats$toJson = stats.toJson(),
        errors = _stats$toJson.errors;

    if (errors && errors.length) {
      callback(errors);
    }

    if (!args.watch || stats.hasErrors()) {
      var buildInfo = stats.toString({
        colors: true,
        children: true,
        chunks: !!args.verbose,
        modules: !!args.verbose,
        chunkModules: !!args.verbose,
        hash: !!args.verbose,
        version: !!args.verbose
      });

      if (stats.hasErrors()) {
        console.error(buildInfo);
      } else if (args.verbose) {
        console.log(buildInfo);
      } else {
        process.stderr.write('Build finished.\n');
      }
    }

    if (callback) {
      callback(err);
    }
  }

  var compiler = webpack(webpackConfig);

  if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else if (args.dev) {
    devServer(compiler, args);
  } else {
    compiler.run(doneHandler);
  }
}