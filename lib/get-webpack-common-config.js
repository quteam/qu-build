'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = getWebpackCommonConfig;

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _caseSensitivePathsWebpackPlugin = require('case-sensitive-paths-webpack-plugin');

var _caseSensitivePathsWebpackPlugin2 = _interopRequireDefault(_caseSensitivePathsWebpackPlugin);

var _fs = require('fs');

var _path = require('path');

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _friendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var _friendlyErrorsWebpackPlugin2 = _interopRequireDefault(_friendlyErrorsWebpackPlugin);

var _imageminWebpackPlugin = require('imagemin-webpack-plugin');

var _imageminWebpackPlugin2 = _interopRequireDefault(_imageminWebpackPlugin);

var _getBabelCommonConfig = require('./get-babel-common-config');

var _getBabelCommonConfig2 = _interopRequireDefault(_getBabelCommonConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getWebpackCommonConfig(args) {
  var pkgPath = (0, _path.join)(args.cwd, 'package.json');
  var pkg = (0, _fs.existsSync)(pkgPath) ? require(pkgPath) : {};

  if (!pkg.name) {
    var _args$cwd$split$splic = args.cwd.split('/').splice(-1),
        _args$cwd$split$splic2 = _slicedToArray(_args$cwd$split$splic, 1),
        name = _args$cwd$split$splic2[0];

    pkg.name = name;
  }

  if (!pkg.entry) {
    pkg.entry = _defineProperty({}, pkg.name, './src');
  }

  var jsFileName = args.hash ? 'js/[name]-[chunkhash:5].js' : 'js/[name].js';
  var cssFileName = args.hash ? 'css/[name]-[contenthash:5].css' : 'css/[name].css';


  var silent = args.silent === true;
  var babelOptions = (0, _getBabelCommonConfig2.default)();

  var postcssOptions = {
    sourceMap: true,
    plugins: [(0, _autoprefixer2.default)({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4']
    })]
  };

  var emptyBuildins = ['child_process', 'cluster', 'dgram', 'dns', 'fs', 'module', 'net', 'readline', 'repl', 'tls'];

  var browser = pkg.browser || {};

  var node = emptyBuildins.reduce(function (obj, name) {
    if (!(name in browser)) {
      return _extends({}, obj, _defineProperty({}, name, 'empty'));
    }
    return obj;
  }, {});

  var config = {
    babel: babelOptions,
    postcss: postcssOptions,

    output: {
      path: (0, _path.join)(process.cwd(), './dist/'),
      filename: jsFileName,
      chunkFilename: jsFileName
    },
    devtool: args.dev ? 'source-map' : args.devtool,

    resolve: {
      modules: ['./', 'node_modules', (0, _path.resolve)(__dirname, '../node_modules')],
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    resolveLoader: {
      modules: ['node_modules', (0, _path.resolve)(__dirname, '../node_modules')]
    },
    entry: pkg.entry,
    node: node,
    module: {
      rules: [{
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/font-woff'
        }
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/font-woff'
        }
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/octet-stream'
        }
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/vnd.ms-fontobject'
        }
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'img/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'image/svg+xml'
        }
      }, {
        test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
        loader: 'url-loader',
        options: {
          name: 'img/[name]-[hash:5].[ext]',
          limit: 8192
        }
      }, {
        test: /\.module\.(html|htm|txt|tpl)$/,
        loader: 'raw-loader'
      }]
    },

    plugins: [new _extractTextWebpackPlugin2.default({
      filename: cssFileName,
      disable: !!args.dev,
      allChunks: true
    }), new _caseSensitivePathsWebpackPlugin2.default(), new _friendlyErrorsWebpackPlugin2.default({
      onErrors: function onErrors(severity, errors) {
        if (silent) return;
        if (severity !== 'error') {
          return;
        }
        var error = errors[0];
        console.error(severity + ' : ' + error.name);
      }
    }), new _imageminWebpackPlugin2.default({
      disable: !!args.dev,
      pngquant: {
        quality: '95-100'
      },
      jpegtran: {
        progressive: true
      }
    })]
  };

  return config;
}