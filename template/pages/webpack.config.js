const path = require('path');
const glob = require('glob');
const pkg = require('./package.json');

// get entry
function getEntry(globPath) {
  const entries = {};
  let basename;
  let pathname;

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    pathname = basename;
    entries[pathname] = entry;
  });
  return entries;
}

/* eslint no-param-reassign: 1 */
module.exports = function webpackCfg(webpackConfig) {
  // 生成文件目录
  webpackConfig.entry = getEntry('./src/pages/*');
  webpackConfig.output.path = path.resolve(`./release/${pkg.name}/${pkg.version}`);

  return webpackConfig;
};
