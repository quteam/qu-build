import {
  tmpdir,
} from 'os';

export default function babel() {
  return {
    cacheDirectory: tmpdir(),
    presets: [
      require.resolve('babel-preset-stage-0'), [
        require.resolve('babel-preset-env'),
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
    ],
    plugins: [
      // require.resolve('babel-plugin-add-module-exports'),
      // require.resolve('babel-plugin-transform-decorators-legacy'),
    ],
    comments: false,
  };
}
