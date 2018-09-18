import { tmpdir } from 'os';
import { existsSync } from 'fs';
import { join } from 'path';
import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';
import transformRuntime from '@babel/plugin-transform-runtime';
import transformClasses from '@babel/plugin-proposal-class-properties';
import proposalDecorators from '@babel/plugin-proposal-decorators';
import dynamicImport from '@babel/plugin-syntax-dynamic-import';
import asyncToGenerator from '@babel/plugin-transform-async-to-generator';
export default function babel(args) {
  var pkgPath = join(args.cwd, 'package.json');
  var pkg = existsSync(pkgPath) ? require(pkgPath) : {};
  var browsersObj = {};

  if (!pkg.browserslist) {
    browsersObj.browsers = ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'];
  }

  return {
    cacheDirectory: tmpdir(),
    presets: [[presetEnv, {
      targets: {
        browsers: browsersObj.browsers
      },
      modules: false,
      useBuiltIns: 'usage'
    }], presetReact],
    plugins: [[transformClasses, {
      loose: true
    }], [proposalDecorators, {
      legacy: true
    }], dynamicImport, asyncToGenerator],
    comments: true
  };
}