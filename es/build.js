function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import { join, resolve } from 'path';
import { writeFileSync, existsSync } from 'fs';
import webpack, { ProgressPlugin } from 'webpack';
import rimraf from 'rimraf';
import chalk from 'chalk';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
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

function getWebpackConfig(args, cache) {
  var webpackConfig = getWebpackCommonConfig(args);
  injectLoaderOptions(webpackConfig, args);

  webpackConfig.plugins = webpackConfig.plugins || [];

  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  if (args.compress && !args.dev && !args.watch) {
    webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      output: {
        ascii_only: true
      },
      compress: {
        warnings: false
      }
    }), new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })]);
  } else {
    webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })]);
  }

  webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [new webpack.NoEmitOnErrorsPlugin()]);

  if (args.hash) {
    var pkg = require(join(args.cwd, 'package.json'));

    webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [require('map-json-webpack-plugin')({
      assetsPath: pkg.name,
      cache: cache
    })]);
  }

  if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
  }
  checkConfig(webpackConfig);
  return webpackConfig;
}

export default function build(args, callback) {
  var commonName = args.hash ? 'js/common-[chunkhash:5].js' : 'js/common.js';

  var webpackConfig = getWebpackConfig(args, {});
  webpackConfig = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];

  webpackConfig.forEach(function (config) {
    var entryArr = Object.keys(config.entry);

    entryArr.map(function (pathname) {
      var conf = {
        filename: pathname + '.html',
        template: config.entry[pathname] + '/page.html',
        inject: true,
        chunksSortMode: 'dependency'
      };

      if (args.dev) {
        conf.hash = true;
      } else {
        conf.minify = {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true
        };
        conf.filename = 'html/' + pathname + '.html';
      }

      if (entryArr.length > 1) {
        conf.chunks = ['common', pathname];
      }

      config.plugins.push(new HtmlWebpackPlugin(conf));
    });

    if (entryArr.length > 1) {
      config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: commonName
      }));
    }
  });

  var fileOutputPath = void 0;
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
    }
  });

  webpackConfig.forEach(function (config) {
    config.plugins.push(new ProgressPlugin(function (percentage, msg, addInfo) {
      var stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write(chalk.magenta(msg) + ' (' + chalk.magenta(addInfo) + ')');
        stream.clearLine(1);
      } else if (percentage === 1) {}
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
      console.log('Generate Json File: ' + jsonPath);
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
      } else {
        console.log(buildInfo);
      }
    }

    if (callback) {
      callback(err);
    }
  }

  var compiler = webpack(webpackConfig);

  if (!args.verbose) {
    compiler.plugin('done', function (stats) {
      stats.stats.forEach(function (stat) {
        stat.compilation.children = stat.compilation.children.filter(function (child) {
          return child.name !== 'extract-text-webpack-plugin';
        });
      });
    });
  }

  if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else if (args.dev) {
    devServer(compiler, args);
  } else {
    compiler.run(doneHandler);
  }
}