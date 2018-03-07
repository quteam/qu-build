import "core-js/modules/es6.array.from";
import "core-js/modules/es6.array.is-array";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import { existsSync } from 'fs';
export default function mergeCustomConfig(webpackConfig, customConfigPath) {
  if (!existsSync(customConfigPath)) {
    return webpackConfig;
  }

  var customConfig = require(customConfigPath);

  if (typeof customConfig === 'function') {
    return customConfig.apply(void 0, [webpackConfig].concat(_toConsumableArray(Array.prototype.slice.call(arguments).slice(2))));
  }

  throw new Error("Return of ".concat(customConfigPath, " must be a function."));
}