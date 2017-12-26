'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = babel;

var _os = require('os');

var _babelPresetStage = require('babel-preset-stage-0');

var _babelPresetStage2 = _interopRequireDefault(_babelPresetStage);

var _babelPresetEnv = require('babel-preset-env');

var _babelPresetEnv2 = _interopRequireDefault(_babelPresetEnv);

var _babelPresetReact = require('babel-preset-react');

var _babelPresetReact2 = _interopRequireDefault(_babelPresetReact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function babel() {
  return {
    cacheDirectory: (0, _os.tmpdir)(),
    presets: [_babelPresetStage2.default, [_babelPresetEnv2.default, {
      targets: {
        browsers: ['Android >= 4', 'Chrome >= 35', 'Firefox >= 31', 'iOS >= 9', 'Opera >= 12', 'Safari >= 9', 'IE >= 9']
      },
      modules: false
    }], _babelPresetReact2.default],
    plugins: [require.resolve('babel-plugin-transform-class-properties'), require.resolve('babel-plugin-transform-decorators-legacy')],
    comments: false
  };
}