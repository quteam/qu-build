'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = babel;

var _os = require('os');

function babel() {
  return {
    cacheDirectory: (0, _os.tmpdir)(),
    presets: [require.resolve('babel-preset-stage-0'), [require.resolve('babel-preset-env'), {
      targets: {
        browsers: ['Android >= 4', 'Chrome >= 35', 'Firefox >= 31', 'iOS >= 9', 'Opera >= 12', 'Safari >= 9', 'IE >= 9']
      },
      modules: false
    }]],
    plugins: [],
    comments: false
  };
}