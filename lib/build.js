"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWebpackConfig = getWebpackConfig;
exports.default = build;
Object.defineProperty(exports, "webpack", {
  enumerable: true,
  get: function get() {
    return _webpack.default;
  }
});

require("core-js/modules/es6.array.from");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.object.assign");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

var _path = require("path");

var _fs = require("fs");

var _webpack = _interopRequireWildcard(require("webpack"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _chalk = _interopRequireDefault(require("chalk"));

var _htmlWebpackPlugin = _interopRequireDefault(require("html-webpack-plugin"));

var _copyWebpackPlugin = _interopRequireDefault(require("copy-webpack-plugin"));

var _swPrecacheWebpackPlugin = _interopRequireDefault(require("sw-precache-webpack-plugin"));

var _mergeCustomConfig = _interopRequireDefault(require("./merge-custom-config"));

var _getWebpackCommonConfig = _interopRequireDefault(require("./get-webpack-common-config"));

var _injectLoaderOptions = _interopRequireDefault(require("./inject-loader-options"));

var _devServer = _interopRequireDefault(require("./dev-server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
  var pkgPath = (0, _path.join)(args.cwd, 'package.json');
  var pkg = (0, _fs.existsSync)(pkgPath) ? require(pkgPath) : {};
  var webpackConfig = (0, _getWebpackCommonConfig.default)(args);
  (0, _injectLoaderOptions.default)(webpackConfig, args);
  webpackConfig.plugins = webpackConfig.plugins || [];

  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  if (!args.dev && !args.watch) {
    webpackConfig.plugins = _toConsumableArray(webpackConfig.plugins).concat([new _webpack.default.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })]);
  } else {
    webpackConfig.plugins = _toConsumableArray(webpackConfig.plugins).concat([new _webpack.default.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })]);
  }

  webpackConfig.plugins = _toConsumableArray(webpackConfig.plugins);

  if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = (0, _mergeCustomConfig.default)(webpackConfig, (0, _path.resolve)(args.cwd, args.config || 'webpack.config.js'));
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
      conf.chunks = ['vendor', 'common', pathname];
    }

    webpackConfig.plugins.push(new _htmlWebpackPlugin.default(conf));
  });
  checkConfig(webpackConfig);
  return webpackConfig;
}

function build(args, callback) {
  var pkgPath = (0, _path.join)(args.cwd, 'package.json');
  var pkg = (0, _fs.existsSync)(pkgPath) ? require(pkgPath) : {};
  var webpackConfig = getWebpackConfig(args, {});
  webpackConfig = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
  var fileOutputPath;
  webpackConfig.forEach(function (config) {
    fileOutputPath = config.output.path;

    if (args.dev) {
      config.plugins.push(new _webpack.default.HotModuleReplacementPlugin());
      var devClientPath = (0, _path.resolve)(process.mainModule.filename, '../../lib/dev-client');
      Object.keys(config.entry).forEach(function (name) {
        config.entry[name] = [devClientPath].concat(config.entry[name]);
      });
    } else {
      _rimraf.default.sync(fileOutputPath);

      var _publicPath = (0, _path.resolve)(args.cwd, './public');

      if ((0, _fs.existsSync)(_publicPath)) {
        config.plugins.push(new _copyWebpackPlugin.default([{
          from: _publicPath,
          ignore: ['.*']
        }], {
          copyUnmodified: true
        }));
      }

      if (args.pwa) {
        config.plugins.push(new _swPrecacheWebpackPlugin.default({
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
    config.plugins.push(new _webpack.ProgressPlugin(function (percentage, msg, addInfo) {
      var stream = process.stderr;

      if (stream.isTTY && percentage < 0.7) {
        stream.cursorTo(0);
        stream.write("".concat(_chalk.default.magenta(msg), " (").concat(_chalk.default.magenta(addInfo), ")"));
        stream.clearLine(1);
      } else if (percentage === 1) {
        stream.cursorTo(0);
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
      var jsonPath = (0, _path.join)(fileOutputPath, filename);
      (0, _fs.writeFileSync)(jsonPath, JSON.stringify(stats.toJson()), 'utf-8');
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
      } else {}
    }

    if (callback) {
      callback(err);
    }
  }

  var compiler = (0, _webpack.default)(webpackConfig);

  if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else if (args.dev) {
    (0, _devServer.default)(compiler, args);
  } else {
    compiler.run(doneHandler);
  }
}