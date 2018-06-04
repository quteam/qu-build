import path from 'path';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import connectHistoryApiFallback from 'connect-history-api-fallback';
import bodyParser from 'body-parser';
import mockServer from './mock-server';


export default function devServer(compiler, args) {
  const port = args.port || 8080;
  const app = express();

  const devMiddleware = webpackDevMiddleware(compiler, {
    logLevel: args.verbose ? 'info' : 'error',
  });
  const hotMiddleware = webpackHotMiddleware(compiler, {
    log: () => { },
  });

  devMiddleware.waitUntilValid(() => {
    console.log(`> Listening at  http://localhost:${port}`);
  });

  app.use(connectHistoryApiFallback());
  app.use(mockServer({
    modules: [path.resolve(`${args.cwd}/api`), path.resolve(`${args.cwd}/src/api`)],
  }));
  app.use(devMiddleware);
  app.use(hotMiddleware);
  app.use(express.static(path.resolve(`${args.cwd}/public`)));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.listen(port, (err) => {
    if (err) {
      console.log(err);
    }
  });

  return app;
}
