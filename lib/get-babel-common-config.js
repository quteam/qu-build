"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = babel;

var _os = require("os");

var _fs = require("fs");

var _path = require("path");

var _presetStage = _interopRequireDefault(require("@babel/preset-stage-0"));

var _presetEnv = _interopRequireDefault(require("@babel/preset-env"));

var _presetReact = _interopRequireDefault(require("@babel/preset-react"));

var _pluginTransformRuntime = _interopRequireDefault(require("@babel/plugin-transform-runtime"));

var _pluginProposalClassProperties = _interopRequireDefault(require("@babel/plugin-proposal-class-properties"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function babel(args) {
  var pkgPath = (0, _path.join)(args.cwd, 'package.json');
  var pkg = (0, _fs.existsSync)(pkgPath) ? require(pkgPath) : {};
  var browsersObj = {};

  if (!pkg.browserslist) {
    browsersObj.browsers = ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'];
  }

  return {
    cacheDirectory: (0, _os.tmpdir)(),
    presets: [[_presetStage.default, {
      decoratorsLegacy: true
    }], [_presetEnv.default, {
      targets: {
        browsers: browsersObj.browsers
      },
      modules: false,
      useBuiltIns: 'usage'
    }], _presetReact.default],
    plugins: [[_pluginProposalClassProperties.default, {
      loose: true
    }]],
    comments: true
  };
}