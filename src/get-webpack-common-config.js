// import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { existsSync } from 'fs';
import {
  join,
  resolve,
} from 'path';
import autoprefixer from 'autoprefixer';
import ImageminPlugin from 'imagemin-webpack-plugin';
import getBabelCommonConfig from './get-babel-common-config';

export default function getWebpackCommonConfig(args) {
  const pkgPath = join(args.cwd, 'package.json');
  const pkg = existsSync(pkgPath) ? require(pkgPath) : {};

  if (!pkg.name) {
    const [
      name,
    ] = args.cwd.split('/').splice(-1);
    pkg.name = name;
  }

  if (!pkg.entry) {
    pkg.entry = {
      [pkg.name]: './src',
    };
  }

  const jsFileName = args.hash ? 'js/[name]-[chunkhash:5].js' : 'js/[name].js';
  const cssFileName = args.hash ? 'css/[name]-[contenthash:5].css' : 'css/[name].css';
  // const commonName = args.hash ? 'common-[chunkhash:5].js' : 'common.js';

  const silent = args.silent === true;
  const babelOptions = getBabelCommonConfig(args);

  const browsersObj = {};
  if (!pkg.browserslist) {
    browsersObj.browsers = ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'];
  }

  const postcssOptions = {
    sourceMap: true,
    plugins: [
      autoprefixer(browsersObj),
    ],
  };

  const emptyBuildins = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'fs',
    'module',
    'net',
    'readline',
    'repl',
    'tls',
  ];

  const browser = pkg.browser || {};

  const node = emptyBuildins.reduce((obj, name) => {
    if (!(name in browser)) {
      return {
        ...obj,
        ...{
          [name]: 'empty',
        },
      };
    }
    return obj;
  }, {});

  const config = {
    options: {
      babel: babelOptions,
      postcss: postcssOptions,
    },

    mode: args.dev ? 'development' : 'production',
    stats: 'errors-only',
    context: args.cwd,
    output: {
      path: pkg.outputPath ? join(args.cwd, `./${pkg.outputPath}/${pkg.name}/${pkg.version}`) : join(args.cwd, './dist/'),
      filename: jsFileName,
      chunkFilename: jsFileName,
    },
    devtool: args.dev || args.sourcemap ? 'source-map' : false,

    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },

    resolve: {
      // css-loader modules is true, less-loader can't found image, so add "./"
      modules: ['./', 'node_modules', resolve(__dirname, '../node_modules')],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    resolveLoader: {
      modules: ['node_modules', resolve(__dirname, '../node_modules')],
    },
    entry: pkg.entry,
    node,
    module: {
      rules: [{
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/font-woff',
        },
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/font-woff',
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/octet-stream',
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'application/vnd.ms-fontobject',
        },
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          name: 'img/[name]-[hash:5].[ext]',
          limit: 8192,
          minetype: 'image/svg+xml',
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
        loader: 'url-loader',
        options: {
          name: 'img/[name]-[hash:5].[ext]',
          limit: 8192,
        },
      },
      {
        test: /\.module\.(html|htm|txt|tpl)$/,
        loader: 'raw-loader',
      },
      ],
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: cssFileName,
        chunkFilename: cssFileName,
      }),
      // new CaseSensitivePathsPlugin(),
      new ImageminPlugin({
        disable: !!args.dev,
        pngquant: {
          quality: '95-100',
        },
        jpegtran: {
          progressive: true,
        },
      }),
      // new HtmlWebpackPlugin({
      //   // filename: 'index.html',
      //   template: 'src/page.html', // 模板路径
      //   inject: true, // js插入位置
      // }),
    ],
  };

  return config;
}
