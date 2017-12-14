import path from 'path';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import connectHistoryApiFallback from 'connect-history-api-fallback';
import mockServer from './mock-server';


export default function devServer(compiler, args) {
  const port = args.port || 8080;
  const app = express();

  const devMiddleware = webpackDevMiddleware(compiler, {
    quiet: true,
  });
  const hotMiddleware = webpackHotMiddleware(compiler, {
    log: () => {},
  });

  devMiddleware.waitUntilValid(() => {
    console.log(`> Listening at  http://localhost: ${port}`);
  });


  app.use(connectHistoryApiFallback());
  app.use(devMiddleware);
  app.use(hotMiddleware);

  app.use(express.static('./public'));
  app.use(mockServer({
    modules: [path.resolve(`${args.cwd}/api`), path.resolve(`${args.cwd}/src/api`)],
  }));

  app.listen(port, (err) => {
    if (err) {
      console.log(err);
    }
  });

  return app;
}
