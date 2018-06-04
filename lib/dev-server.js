"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = devServer;

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _webpackDevMiddleware = _interopRequireDefault(require("webpack-dev-middleware"));

var _webpackHotMiddleware = _interopRequireDefault(require("webpack-hot-middleware"));

var _connectHistoryApiFallback = _interopRequireDefault(require("connect-history-api-fallback"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _mockServer = _interopRequireDefault(require("./mock-server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function devServer(compiler, args) {
  var port = args.port || 8080;
  var app = (0, _express.default)();
  var devMiddleware = (0, _webpackDevMiddleware.default)(compiler, {
    logLevel: args.verbose ? 'info' : 'error'
  });
  var hotMiddleware = (0, _webpackHotMiddleware.default)(compiler, {
    log: function log() {}
  });
  devMiddleware.waitUntilValid(function () {
    console.log("> Listening at  http://localhost:".concat(port));
  });
  app.use((0, _connectHistoryApiFallback.default)());
  app.use((0, _mockServer.default)({
    modules: [_path.default.resolve("".concat(args.cwd, "/api")), _path.default.resolve("".concat(args.cwd, "/src/api"))]
  }));
  app.use(devMiddleware);
  app.use(hotMiddleware);
  app.use(_express.default.static(_path.default.resolve("".concat(args.cwd, "/public"))));
  app.use(_bodyParser.default.json());
  app.use(_bodyParser.default.urlencoded({
    extended: true
  }));
  app.listen(port, function (err) {
    if (err) {
      console.log(err);
    }
  });
  return app;
}