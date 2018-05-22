import path from 'path';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import connectHistoryApiFallback from 'connect-history-api-fallback';
import bodyParser from 'body-parser';
import mockServer from './mock-server';
export default function devServer(compiler, args) {
  var port = args.port || 8080;
  var app = express();
  var devMiddleware = webpackDevMiddleware(compiler, {
    quiet: true
  });
  var hotMiddleware = webpackHotMiddleware(compiler, {
    log: function log() {}
  });
  devMiddleware.waitUntilValid(function () {
    console.log("> Listening at  http://localhost:".concat(port));
  });
  app.use(connectHistoryApiFallback());
  app.use(devMiddleware);
  app.use(hotMiddleware);
  app.use(express.static(path.resolve("".concat(args.cwd, "/public"))));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(mockServer({
    modules: [path.resolve("".concat(args.cwd, "/api")), path.resolve("".concat(args.cwd, "/src/api"))]
  }));
  app.listen(port, function (err) {
    if (err) {
      console.log(err);
    }
  });
  return app;
}