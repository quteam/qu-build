import { tmpdir } from 'os';
import presetStage0 from 'babel-preset-stage-0';
import presetEnv from 'babel-preset-env';

export default function babel() {
  return {
    cacheDirectory: tmpdir(),
    presets: [presetStage0, [presetEnv, {
      targets: {
        browsers: ['Android >= 4', 'Chrome >= 35', 'Firefox >= 31', 'iOS >= 9', 'Opera >= 12', 'Safari >= 9', 'IE >= 9']
      }
    }]],
    plugins: [],
    comments: false
  };
}