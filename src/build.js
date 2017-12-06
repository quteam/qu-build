import {
  join,
  resolve,
} from 'path';
import {
  writeFileSync,
} from 'fs';
import webpack, {
  ProgressPlugin,
} from 'webpack';
import chalk from 'chalk';
import mergeCustomConfig from './merge-custom-config';
import getWebpackCommonConfig from './get-webpack-common-config';
import injectLoaderOptions from './inject-loader-options';
import devServer from './dev-server';

function checkConfig(webpackConfig) {
  const config = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
  const hasEmptyEntry = config.some(c => Object.keys(c.entry || {}).length === 0);
  if (hasEmptyEntry) {
    const err = new Error('no webpack entry found');
    err.name = 'NoEntry';
    throw err;
  }
}

function getWebpackConfig(args, cache) {
  let webpackConfig = getWebpackCommonConfig(args);

  webpackConfig.plugins = webpackConfig.plugins || [];

  // Config outputPath.
  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  // Config if no --no-compress.
  // Watch mode should not use UglifyJsPlugin
  if (args.compress && !args.watch) {
    webpackConfig.plugins = [...webpackConfig.plugins,
      new webpack.optimize.UglifyJsPlugin({
        parallel: true,
        output: {
          ascii_only: true,
        },
        compress: {
          warnings: false,
        },
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      }),
    ];
  } else {
    webpackConfig.plugins = [...webpackConfig.plugins,
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ];
  }

  webpackConfig.plugins = [...webpackConfig.plugins,
    new webpack.NoEmitOnErrorsPlugin(),
  ];

  // Output map.json if hash.
  if (args.hash) {
    const pkg = require(join(args.cwd, 'package.json'));
    // webpackConfig.output.filename = '[name]-[chunkhash].js';
    // webpackConfig.output.chunkFilename = '[name]-[chunkhash].js';
    webpackConfig.plugins = [...webpackConfig.plugins,
      require('map-json-webpack-plugin')({
        assetsPath: pkg.name,
        cache,
      }),
    ];
  }

  if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
  }
  checkConfig(webpackConfig);
  return webpackConfig;
}

export default function build(args, callback) {
  // Get config.
  let webpackConfig = getWebpackConfig(args, {});
  webpackConfig = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];

  let fileOutputPath;
  webpackConfig.forEach((config) => {
    injectLoaderOptions(config, args);
    fileOutputPath = config.output.path;

    // add hot-reload related code to entry chunks
    if (args.dev) {
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
      const devClientPath = resolve(process.mainModule.filename, '../../lib/dev-client');
      Object.keys(config.entry).forEach((name) => {
        config.entry[name] = [devClientPath].concat(config.entry[name]);
      });
    }
  });


  webpackConfig.forEach((config) => {
    config.plugins.push(new ProgressPlugin((percentage, msg, addInfo) => {
      const stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write(`${chalk.magenta(msg)} (${chalk.magenta(addInfo)})`);
        stream.clearLine(1);
      } else if (percentage === 1) {
        console.log(chalk.green('\nwebpack: bundle build is now finished.'));
      }
    }));
  });


  function doneHandler(err, stats) {
    if (args.json) {
      const filename = typeof args.json === 'boolean' ? 'build-bundle.json' : args.json;
      const jsonPath = join(fileOutputPath, filename);
      writeFileSync(jsonPath, JSON.stringify(stats.toJson()), 'utf-8');
      console.log(`Generate Json File: ${jsonPath}`);
    }

    const {
      errors,
    } = stats.toJson();
    if (errors && errors.length) {
      callback(errors);
    }
    // if watch enabled only stats.hasErrors would log info
    // otherwise  would always log info
    if (!args.watch || stats.hasErrors()) {
      const buildInfo = stats.toString({
        colors: true,
        children: true,
        chunks: !!args.verbose,
        modules: !!args.verbose,
        chunkModules: !!args.verbose,
        hash: !!args.verbose,
        version: !!args.verbose,
      });
      if (stats.hasErrors()) {
        console.error(buildInfo);
      } else {
        console.log(buildInfo);
      }
    }

    if (callback) {
      callback(err);
    }
  }

  // Run compiler.
  const compiler = webpack(webpackConfig);

  // Hack: remove extract-text-webpack-plugin log
  if (!args.verbose) {
    compiler.plugin('done', (stats) => {
      stats.stats.forEach((stat) => {
        stat.compilation.children = stat.compilation.children.filter((child) => { // eslint-disable-line
          return child.name !== 'extract-text-webpack-plugin';
        });
      });
    });
  }

  if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else if (args.dev) {
    devServer(compiler, args);
  } else {
    compiler.run(doneHandler);
  }
}
