import {
  tmpdir,
} from 'os';
import presetStage0 from 'babel-preset-stage-0';
import presetEnv from 'babel-preset-env';
import presetReact from 'babel-preset-react';

export default function babel() {
  return {
    cacheDirectory: tmpdir(),
    presets: [
      presetStage0, [
        presetEnv,
        {
          targets: {
            browsers: [
              'Android >= 4',
              'Chrome >= 35',
              'Firefox >= 31',
              'iOS >= 9',
              'Opera >= 12',
              'Safari >= 9',
              'IE >= 9',
            ],
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
