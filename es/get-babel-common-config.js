import { tmpdir } from 'os';
import { existsSync } from 'fs';
import { join } from 'path';
import presetStage0 from '@babel/preset-stage-0';
import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';
import transformRuntime from '@babel/plugin-transform-runtime';
export default function babel(args) {
  var pkgPath = join(args.cwd, 'package.json');
  var pkg = existsSync(pkgPath) ? require(pkgPath) : {};
  var browsersObj = {};

  if (!pkg.browserslist) {
    browsersObj.browsers = ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'];
  }

  return {
    cacheDirectory: tmpdir(),
    presets: [presetStage0, [presetEnv, {
      targets: {
        browsers: browsersObj.browsers
      },
      modules: false,
      useBuiltIns: 'usage'
    }], presetReact],
    plugins: [],
    comments: true
  };
}