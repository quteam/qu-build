"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ExtractTextPlugin", {
  enumerable: true,
  get: function get() {
    return _extractTextWebpackPlugin.default;
  }
});
Object.defineProperty(exports, "CaseSensitivePathsPlugin", {
  enumerable: true,
  get: function get() {
    return _caseSensitivePathsWebpackPlugin.default;
  }
});

var _extractTextWebpackPlugin = _interopRequireDefault(require("extract-text-webpack-plugin"));

var _caseSensitivePathsWebpackPlugin = _interopRequireDefault(require("case-sensitive-paths-webpack-plugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }