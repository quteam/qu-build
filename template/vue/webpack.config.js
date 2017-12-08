// const path = require('path');
// const pkg = require('./package.json');

/* eslint no-param-reassign: 1 */
module.exports = function webpackCfg(webpackConfig) {
  // 生成文件目录
  // webpackConfig.output.path = path.resolve(`../../release/${pkg.name}/${pkg.version}`);
  // Vue 模板预编译处理
  webpackConfig.module.rules.push({
    test: /\.tpl$/,
    loader: 'vue-template-loader',
  });

  return webpackConfig;
};
