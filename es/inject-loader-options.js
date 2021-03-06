import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import getTSCommonConfig from './get-ts-common-config';
var tsQuery = getTSCommonConfig();

function injectPostcssOptions(webpackConfig, args) {
  function extractCSS(_opts) {
    if (!args.dev) {
      _opts.unshift(MiniCssExtractPlugin.loader);
    }

    _opts.unshift('style-loader');

    return _opts;
  }

  var canCompress = !args.dev && !args.watch;
  var postcssOptions = webpackConfig.options.postcss;
  var cssLoaderRule = {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      minimize: canCompress
    }
  };
  var cssLoaderRule2 = {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      modules: true,
      minimize: canCompress,
      localIdentName: '[local]___[hash:base62:5]'
    }
  };
  var postCSSRule = {
    loader: 'postcss-loader',
    options: postcssOptions
  };
  var lessLoaderRule = {
    loader: 'less-loader',
    options: {
      sourceMap: true
    }
  };
  webpackConfig.module.rules.push({
    enforce: 'post',
    test: function test(filePath) {
      return /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath);
    },
    use: extractCSS([cssLoaderRule, postCSSRule])
  }, {
    test: /\.module\.css$/,
    use: extractCSS([cssLoaderRule2, postCSSRule])
  }, {
    test: function test(filePath) {
      return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
    },
    use: lessLoaderRule
  }, {
    enforce: 'post',
    test: function test(filePath) {
      return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
    },
    use: extractCSS([cssLoaderRule, postCSSRule])
  }, {
    test: /\.module\.less$/,
    use: extractCSS([cssLoaderRule2, postCSSRule, lessLoaderRule])
  });
}

function injectBabelOptions(webpackConfig) {
  var babelOptions = webpackConfig.options.babel;
  webpackConfig.module.rules.push({
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: babelOptions
  }, {
    test: /\.tsx?$/,
    use: [{
      loader: 'babel-loader',
      options: babelOptions
    }, {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        compilerOptions: tsQuery
      }
    }]
  });
}

function injectVueTplOptions(webpackConfig, args) {
  var canCompress = !args.dev && !args.watch;
  var postcssOptions = webpackConfig.options.postcss;
  var babelOptions = webpackConfig.options.babel;
  webpackConfig.module.rules.push({
    test: /\.vue.tpl$/,
    loader: 'vue-tpl-loader',
    options: {
      transformToRequire: {
        img: 'src'
      }
    }
  });
}

export default function injectLoaderOptions(webpackConfig, args) {
  injectPostcssOptions(webpackConfig, args);
  injectBabelOptions(webpackConfig);
  injectVueTplOptions(webpackConfig, args);
  delete webpackConfig.options;
}