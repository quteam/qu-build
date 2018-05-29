"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mergeCustomConfig;

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _fs = require("fs");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function mergeCustomConfig(webpackConfig, customConfigPath) {
  if (!(0, _fs.existsSync)(customConfigPath)) {
    return webpackConfig;
  }

  var customConfig = require(customConfigPath);

  if (typeof customConfig === 'function') {
    return customConfig.apply(void 0, [webpackConfig].concat(_toConsumableArray(Array.prototype.slice.call(arguments).slice(2))));
  }

  throw new Error("Return of ".concat(customConfigPath, " must be a function."));
}