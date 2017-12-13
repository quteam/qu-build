import {
  join,
  resolve,
} from 'path';
import {
  writeFileSync,
  existsSync,
} from 'fs';
import webpack, {
  ProgressPlugin,
} from 'webpack';
import rimraf from 'rimraf';
import chalk from 'chalk';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
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
  injectLoaderOptions(webpackConfig, args);

  webpackConfig.plugins = webpackConfig.plugins || [];

  // Config outputPath.
  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  // Config if no --no-compress.
  // Watch mode and Develop mode should not use UglifyJsPlugin
  if (args.compress && !args.dev && !args.watch) {
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
  const commonName = args.hash ? 'js/common-[chunkhash:5].js' : 'js/common.js';
  // Get config.
  let webpackConfig = getWebpackConfig(args, {});
  webpackConfig = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];

  // Multi html pages 多入口多页面
  webpackConfig.forEach((config) => {
    const entryArr = Object.keys(config.entry);

    entryArr.map((pathname) => {
      // 配置生成的html文件，定义路径等
      const conf = {
        filename: `${pathname}.html`,
        template: `${config.entry[pathname]}/page.html`,
        inject: true,
        chunksSortMode: 'dependency',
      };

      if (args.dev) {
        conf.hash = true;
      } else {
        conf.minify = {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
        };
        conf.filename = `html/${pathname}.html`;
      }

      if (entryArr.length > 1) {
        conf.chunks = ['common', pathname];
      }

      config.plugins.push(new HtmlWebpackPlugin(conf));
    });

    if (entryArr.length > 1) {
      config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: commonName,
      }));
    }
  });

  // 差异配置
  let fileOutputPath;
  webpackConfig.forEach((config) => {
    fileOutputPath = config.output.path;

    if (args.dev) {
      // add hot-reload related code to entry chunks
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
      const devClientPath = resolve(process.mainModule.filename, '../../lib/dev-client');
      Object.keys(config.entry).forEach((name) => {
        config.entry[name] = [devClientPath].concat(config.entry[name]);
      });
    } else {
      // Remove output path
      rimraf.sync(fileOutputPath);

      // 复制公共文件
      let _publicPath = resolve(args.cwd, './public');
      if (existsSync(_publicPath)) {
        config.plugins.push(new CopyWebpackPlugin([{
          from: _publicPath,
          ignore: ['.*'],
        }], {
          copyUnmodified: true,
        }));
      }
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
        // console.log(chalk.green('webpack: bundle build is now finished.'));
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
