// import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import {
  existsSync,
} from 'fs';
import {
  join,
  resolve,
} from 'path';
import autoprefixer from 'autoprefixer';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
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

  const jsFileName = args.hash ? '[name]-[chunkhash:8].js' : '[name].js';
  const cssFileName = args.hash ? '[name]-[contenthash:8].css' : '[name].css';
  // const commonName = args.hash ? 'common-[chunkhash:8].js' : 'common.js';

  const silent = args.silent === true;
  const babelOptions = getBabelCommonConfig();

  const postcssOptions = {
    sourceMap: true,
    plugins: [
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'],
      }),
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
    babel: babelOptions,
    postcss: postcssOptions,

    output: {
      path: join(process.cwd(), './dist/'),
      filename: jsFileName,
      chunkFilename: jsFileName,
    },
    devtool: args.dev ? 'source-map' : args.devtool,

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
            name: 'font/[hash:8].[ext]',
            limit: 8192,
            minetype: 'application/font-woff',
          },
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader',
          options: {
            name: 'font/[hash:8].[ext]',
            limit: 8192,
            minetype: 'application/font-woff',
          },
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader',
          options: {
            name: 'font/[hash:8].[ext]',
            limit: 8192,
            minetype: 'application/octet-stream',
          },
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader',
          options: {
            name: 'font/[hash:8].[ext]',
            limit: 8192,
            minetype: 'application/vnd.ms-fontobject',
          },
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader',
          options: {
            name: 'img/[hash:8].[ext]',
            limit: 8192,
            minetype: 'image/svg+xml',
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          loader: 'url-loader',
          options: {
            name: 'img/[hash:8].[ext]',
            limit: 8192,
          },
        },
        // {
        //   test: /\.html?$/,
        //   loader: 'file-loader',
        //   options: {
        //     name: '[name].[ext]',
        //   },
        // },
      ],
    },

    plugins: [
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'common',
      //   filename: commonName,
      // }),
      new ExtractTextPlugin({
        filename: cssFileName,
        disable: args.dev,
        allChunks: true,
      }),
      new CaseSensitivePathsPlugin(),
      new FriendlyErrorsWebpackPlugin({
        onErrors: (severity, errors) => {
          if (silent) return;
          if (severity !== 'error') {
            return;
          }
          const error = errors[0];
          console.error(`${severity} : ${error.name}`);
        },
      }),
      new HtmlWebpackPlugin({
        // filename: 'index.html',
        template: 'src/page.html', // 模板路径
        inject: true, // js插入位置
      }),
    ],
  };

  return config;
}
