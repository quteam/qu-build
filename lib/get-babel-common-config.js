'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = babel;

var _os = require('os');

function babel() {
  return {
    cacheDirectory: (0, _os.tmpdir)(),
    presets: [require.resolve('babel-preset-stage-0')],
    plugins: [require.resolve('babel-plugin-add-module-exports'), require.resolve('babel-plugin-transform-decorators-legacy')]
  };
}