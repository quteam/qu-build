// import {
//   existsSync,
// } from 'fs';
// import {
//   join,
//   resolve,
// } from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import getTSCommonConfig from './get-ts-common-config';

const tsQuery = getTSCommonConfig();

function injectPostcssOptions(webpackConfig, args) {
  function extractCSS(_opts) {
    if (!args.dev) {
      return ExtractTextPlugin.extract({
        use: _opts,
        publicPath: '../',
      });
    }
    _opts.unshift('style-loader');
    return _opts;
  }

  const canCompress = args.compress && !args.dev && !args.watch;
  const postcssOptions = webpackConfig.options.postcss;
  // delete webpackConfig.postcss; // eslint-disable-line

  // const pkgPath = join(args.cwd, 'package.json');
  // const pkg = existsSync(pkgPath) ? require(pkgPath) : {};

  // let theme = {};
  // if (pkg.theme && typeof pkg.theme === 'string') {
  //   let cfgPath = pkg.theme;
  //   // relative path
  //   if (cfgPath.charAt(0) === '.') {
  //     cfgPath = resolve(args.cwd, cfgPath);
  //   }
  //   const getThemeConfig = require(cfgPath);
  //   theme = getThemeConfig();
  // } else if (pkg.theme && typeof pkg.theme === 'object') {
  //   theme = pkg.theme;
  // }

  webpackConfig.module.rules.push({
    test(filePath) {
      return /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath);
    },
    use: extractCSS([{
        loader: 'css-loader',
        options: {
          sourceMap: true,
          minimize: canCompress,
        },
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
    ]),
  }, {
    test: /\.module\.css$/,
    use: extractCSS([{
        loader: 'css-loader',
        options: {
          sourceMap: true,
          modules: true,
          minimize: canCompress,
          localIdentName: '[local]___[hash:base62:5]',
        },
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
    ]),
  }, {
    test(filePath) {
      return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
    },
    use: extractCSS([{
        loader: 'css-loader',
        options: {
          sourceMap: true,
          minimize: canCompress,
        },
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
      {
        loader: 'less-loader',
        options: {
          sourceMap: true,
          // modifyVars: theme,
        },
      },
    ]),
  }, {
    test: /\.module\.less$/,
    use: extractCSS([{
        loader: 'css-loader',
        options: {
          sourceMap: true,
          modules: true,
          minimize: canCompress,
          localIdentName: '[local]___[hash:base62:5]',
        },
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
      {
        loader: 'less-loader',
        options: {
          sourceMap: true,
          // modifyVars: theme,
        },
      },
    ]),
  });
}

function injectBabelOptions(webpackConfig) {
  const babelOptions = webpackConfig.options.babel;
  // delete webpackConfig.babel; // eslint-disable-line

  webpackConfig.module.rules.push({
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: babelOptions,
  }, {
    test: /\.tsx?$/,
    use: [{
        loader: 'babel-loader',
        options: babelOptions,
      },
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          compilerOptions: tsQuery,
        },
      },
    ],
  });
}

// vue 模版文件预处理
function injectVueTplOptions(webpackConfig, args) {
  const canCompress = args.compress && !args.dev && !args.watch;
  const postcssOptions = webpackConfig.options.postcss;
  const babelOptions = webpackConfig.options.babel;

  // console.log(postcssOptions.plugins[0]);
  // console.log(babelOptions);

  webpackConfig.module.rules.push({
    test: /\.vue.tpl$/,
    loader: 'vue-template-loader',
  });
}

export default function injectLoaderOptions(webpackConfig, args) {
  injectPostcssOptions(webpackConfig, args);
  injectBabelOptions(webpackConfig);
  injectVueTplOptions(webpackConfig, args);

  // 清楚自定义配置
  delete webpackConfig.options;
}
