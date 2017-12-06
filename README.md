# 前端自动化工具

## 安装

```bash
npm install qu-build -g
```

## 使用

```bash
Usage: qu-build [options]

-v, --version              output the version number
-o, --output-path <path>   output path
-w, --watch [delay]        watch file changes and rebuild
-d, --dev                  start develop server
-p, --port [port]          develop server port, default is 8080
--hash                     build with hash and output map.json
--publicPath <publicPath>  publicPath for webpack
--devtool <devtool>        sourcemap generate method, default is null
--config <path>            custom config path, default is webpack.config.js
--no-compress              build without compress (default: false)
--json                     running webpack with --json, ex. result.json
--verbose                  run with more logging messages.
-h, --help                 output usage information
```