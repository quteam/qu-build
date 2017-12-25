function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import { existsSync } from 'fs';

export default function mergeCustomConfig(webpackConfig, customConfigPath) {
  if (!existsSync(customConfigPath)) {
    return webpackConfig;
  }

  var customConfig = require(customConfigPath);

  if (typeof customConfig === 'function') {
    return customConfig.apply(undefined, [webpackConfig].concat(_toConsumableArray([].concat(Array.prototype.slice.call(arguments)).slice(2))));
  }

  throw new Error('Return of ' + customConfigPath + ' must be a function.');
}