'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _path = require('path');

var _fs = require('fs');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _mergeCustomConfig = require('./merge-custom-config');

var _mergeCustomConfig2 = _interopRequireDefault(_mergeCustomConfig);

var _getWebpackCommonConfig = require('./get-webpack-common-config');

var _getWebpackCommonConfig2 = _interopRequireDefault(_getWebpackCommonConfig);

var _injectLoaderOptions = require('./inject-loader-options');

var _injectLoaderOptions2 = _interopRequireDefault(_injectLoaderOptions);

var _devServer = require('./dev-server');

var _devServer2 = _interopRequireDefault(_devServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
  var webpackConfig = (0, _getWebpackCommonConfig2.default)(args);
  (0, _injectLoaderOptions2.default)(webpackConfig, args);

  webpackConfig.plugins = webpackConfig.plugins || [];

  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  if (args.compress && !args.dev && !args.watch) {
    webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [new _webpack2.default.optimize.UglifyJsPlugin({
      parallel: true,
      output: {
        ascii_only: true
      },
      compress: {
        warnings: false
      }
    }), new _webpack2.default.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })]);
  } else {
    webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [new _webpack2.default.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })]);
  }

  webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [new _webpack2.default.NoEmitOnErrorsPlugin()]);

  if (args.hash) {
    var pkg = require((0, _path.join)(args.cwd, 'package.json'));

    webpackConfig.plugins = [].concat(_toConsumableArray(webpackConfig.plugins), [require('map-json-webpack-plugin')({
      assetsPath: pkg.name,
      cache: cache
    })]);
  }

  if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = (0, _mergeCustomConfig2.default)(webpackConfig, (0, _path.resolve)(args.cwd, args.config || 'webpack.config.js'));
  }
  checkConfig(webpackConfig);
  return webpackConfig;
}

function build(args, callback) {
  var commonName = args.hash ? 'common-[chunkhash:8].js' : 'common.js';

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

      if (!args.dev) {
        conf.minify = {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true
        };
      } else {
        conf.hash = args.dev;
      }

      if (entryArr.length > 1) {
        conf.chunks = ['common', pathname];
      }

      config.plugins.push(new _htmlWebpackPlugin2.default(conf));
    });

    if (entryArr.length > 1) {
      config.plugins.push(new _webpack2.default.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: commonName
      }));
    }
  });

  var fileOutputPath = void 0;
  webpackConfig.forEach(function (config) {
    fileOutputPath = config.output.path;

    if (args.dev) {
      config.plugins.push(new _webpack2.default.HotModuleReplacementPlugin());
      var devClientPath = (0, _path.resolve)(process.mainModule.filename, '../../lib/dev-client');
      Object.keys(config.entry).forEach(function (name) {
        config.entry[name] = [devClientPath].concat(config.entry[name]);
      });
    }
  });

  webpackConfig.forEach(function (config) {
    config.plugins.push(new _webpack.ProgressPlugin(function (percentage, msg, addInfo) {
      var stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write(_chalk2.default.magenta(msg) + ' (' + _chalk2.default.magenta(addInfo) + ')');
        stream.clearLine(1);
      } else if (percentage === 1) {
        console.log(_chalk2.default.green('\nwebpack: bundle build is now finished.'));
      }
    }));
  });

  function doneHandler(err, stats) {
    if (args.json) {
      var filename = typeof args.json === 'boolean' ? 'build-bundle.json' : args.json;
      var jsonPath = (0, _path.join)(fileOutputPath, filename);
      (0, _fs.writeFileSync)(jsonPath, JSON.stringify(stats.toJson()), 'utf-8');
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

  var compiler = (0, _webpack2.default)(webpackConfig);

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
    (0, _devServer2.default)(compiler, args);
  } else {
    webpackConfig.map(function (config) {
      _rimraf2.default.sync(config.output.path);
    });
    compiler.run(doneHandler);
  }
}