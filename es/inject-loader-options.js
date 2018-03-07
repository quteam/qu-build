import ExtractTextPlugin from 'extract-text-webpack-plugin';
import getTSCommonConfig from './get-ts-common-config';
var tsQuery = getTSCommonConfig();

function injectPostcssOptions(webpackConfig, args) {
  function extractCSS(_opts) {
    if (!args.dev) {
      return ExtractTextPlugin.extract({
        use: _opts,
        publicPath: '../'
      });
    }

    _opts.unshift('style-loader');

    return _opts;
  }

  var canCompress = args.compress && !args.dev && !args.watch;
  var postcssOptions = webpackConfig.options.postcss;
  webpackConfig.module.rules.push({
    test: function test(filePath) {
      return /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath);
    },
    use: extractCSS([{
      loader: 'css-loader',
      options: {
        sourceMap: true,
        minimize: canCompress
      }
    }, {
      loader: 'postcss-loader',
      options: postcssOptions
    }])
  }, {
    test: /\.module\.css$/,
    use: extractCSS([{
      loader: 'css-loader',
      options: {
        sourceMap: true,
        modules: true,
        minimize: canCompress,
        localIdentName: '[local]___[hash:base62:5]'
      }
    }, {
      loader: 'postcss-loader',
      options: postcssOptions
    }])
  }, {
    test: function test(filePath) {
      return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
    },
    use: extractCSS([{
      loader: 'css-loader',
      options: {
        sourceMap: true,
        minimize: canCompress
      }
    }, {
      loader: 'postcss-loader',
      options: postcssOptions
    }, {
      loader: 'less-loader',
      options: {
        sourceMap: true
      }
    }])
  }, {
    test: /\.module\.less$/,
    use: extractCSS([{
      loader: 'css-loader',
      options: {
        sourceMap: true,
        modules: true,
        minimize: canCompress,
        localIdentName: '[local]___[hash:base62:5]'
      }
    }, {
      loader: 'postcss-loader',
      options: postcssOptions
    }, {
      loader: 'less-loader',
      options: {
        sourceMap: true
      }
    }])
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
  var canCompress = args.compress && !args.dev && !args.watch;
  var postcssOptions = webpackConfig.options.postcss;
  var babelOptions = webpackConfig.options.babel;
  webpackConfig.module.rules.push({
    test: /\.vue.tpl$/,
    loader: 'vue-template-loader'
  });
}

export default function injectLoaderOptions(webpackConfig, args) {
  injectPostcssOptions(webpackConfig, args);
  injectBabelOptions(webpackConfig);
  injectVueTplOptions(webpackConfig, args);
  delete webpackConfig.options;
}