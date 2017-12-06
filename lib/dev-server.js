'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = devServer;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _connectHistoryApiFallback = require('connect-history-api-fallback');

var _connectHistoryApiFallback2 = _interopRequireDefault(_connectHistoryApiFallback);

var _mockServer = require('./mock-server');

var _mockServer2 = _interopRequireDefault(_mockServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function devServer(compiler, args) {
  var port = args.port || 8080;
  var app = (0, _express2.default)();

  var devMiddleware = (0, _webpackDevMiddleware2.default)(compiler, {
    quiet: true
  });
  var hotMiddleware = (0, _webpackHotMiddleware2.default)(compiler, {
    log: function log() {}
  });

  devMiddleware.waitUntilValid(function () {
    console.log('> Listening at  http://localhost: ' + port);
  });

  app.use((0, _connectHistoryApiFallback2.default)());
  app.use(devMiddleware);
  app.use(hotMiddleware);

  app.use(_express2.default.static('./public'));
  app.use((0, _mockServer2.default)({
    modules: [_path2.default.resolve(args.cwd + '/src/api')]
  }));

  app.listen(port, function (err) {
    if (err) {
      console.log(err);
    }
  });

  return app;
}