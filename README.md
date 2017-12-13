# Build tools for FE

Universal front-end automation tools

## Install

```bash
npm install qu-build -g
```

## Usage

```bash
Usage: qu-build [options]

Options:

    -v, --version              output the version number
    -o, --output-path <path>   output path
    -w, --watch [delay]        watch file changes and rebuild
    -d, --dev                  start develop server
    -p, --port [port]          develop server port, default is 8080
    -b, --build                build this project
    -t, --test                 test this project, use jest
    --hash                     build with hash and output map.json
    --publicPath <publicPath>  publicPath for webpack
    --devtool <devtool>        sourcemap generate method, default is null
    --config <path>            custom config path, default is webpack.config.js
    --no-compress              build without compress (default: true)
    --json                     running webpack with --json, ex. result.json
    --verbose                  run with more logging messages.
    -h, --help                 output usage information


  Commands:

    init        generate a new project from a template, templates: [vue, pages]

```

## Template Create

```bash
# vue template project
qu-build init vue project-name

# multi page template project
qu-build init pages project-name
```

## Mock

Use mockjs, mock storage directory `./src/api`, support `.js`,`.json`.

```javascript
/**
 * @url /order/addOrderComment.do
 * 
 */
module.exports = function (req) {
  return {
    success: Math.random() < 0.5 ? false : true,
    msg: '@word',
    code: Math.random() < 0.5 ? -200 : 0,
  };
}
```
or
```json
{
    "msg": "@word",
    "code": 200,
}
```

If you use `jsonp`, request parameters increase `callback`. The return data will be `jsonp`.

```javascript
/**
 *  http://localhost:8080/?callback=jQuery1513158553653
 */
jQuery1513158553653({
  "msg": "abc",
  "code": 200,
})
```

## Directory

```bash
./public                # static resource directory;
./api                   # mock directory;
./src                   # development source code;
./package.json          # project info
./webpack.config.js     # custom webpack configuration
```

## Config

webpack.config.js

```javascript
// get webpack
var webpack = require('qu-build/lib/webpack');

module.exports = function(webpackConfig) {
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify('true')
    });
  );
  return webpackConfig;
};
```