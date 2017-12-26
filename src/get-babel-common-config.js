import {
  tmpdir,
} from 'os';
import {
  existsSync,
} from 'fs';
import {
  join,
} from 'path';
import presetStage0 from 'babel-preset-stage-0';
import presetEnv from 'babel-preset-env';
import presetReact from 'babel-preset-react';

export default function babel(args) {
  const pkgPath = join(args.cwd, 'package.json');
  const pkg = existsSync(pkgPath) ? require(pkgPath) : {};
  const browsersObj = {};
  if (!pkg.browserslist) {
    browsersObj.browsers = ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'];
  }

  return {
    cacheDirectory: tmpdir(),
    presets: [
      presetStage0, [
        presetEnv,
        {
          targets: {
            browsers: browsersObj.browsers,
          },
          modules: false,
          // useBuiltIns: true,
        },
      ],
      presetReact,
    ],
    plugins: [
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-decorators-legacy'),
    ],
    comments: false,
  };
}
