import fs from 'fs';
// import path from 'path';
import Mock, {
  Random,
} from 'mockjs';
import walkdir from 'node-walkdir';

// const Random = Mock.Random;

// const template = fs.readFileSync(path.join(__dirname, 'mock-doc.html'), 'utf8');
const RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+([^\n]+)[\s\S]+?\*\//im;


function mock(_opts) {
  const routes = {}; // routes list
  // 获取路由
  _opts.modules.map((_dir) => {
    fs.exists(_dir, (exists) => {
      if (exists) {
        walkdir(_dir, /\.js(on)?$/i, (filepath) => {
          const content = String(fs.readFileSync(filepath, 'utf8')).trim() || '{}';

          let url = filepath;
          let describe = 'no description';

          const m = content.match(RE);

          if (m) {
            url = m[2].trim();
            describe = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
          }

          if (url[0] !== '/') { // fix url path
            url = `/${url}`;
          }

          let pathname = url;
          if (pathname.indexOf('?') > -1) {
            pathname = pathname.split('?')[0];
          }

          if (mock.debug && routes[pathname]) {
            console.warn(`[Mock Warn]: [${filepath}: ${pathname}] already exists and has been covered with new data.`);
          }

          routes[pathname] = {
            url,
            filepath,
            describe,
          };

          if (/\.js$/.test(filepath)) {
            routes[pathname].data = require(filepath);
          } else {
            try {
              routes[pathname].data = new Function(`return (${content})`)();
            } catch (e) {
              delete routes[pathname];
              mock.debug && console.warn('[Mock Warn]:', e);
            }
          }
        });
      }
    });
  });

  return function handle(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.send('');
    }

    const url = req.url.split('?')[0];

    // api document page
    if (url === '/api') {
      const host = `${req.protocol}://${req.headers.host}${req.baseUrl}`;

      const list = Object.keys(routes).sort().map((path) => {
        const route = routes[path];
        return {
          title: route.describe,
          url: host + route.url,
          file: route.filepath,
        };
      });

      // return res.end(template.replace('@menuList', JSON.stringify(list)));
      res.json(list);
    }

    let data = (routes[url] || 0).data;
    if (data) {
      if (typeof data === 'function') {
        data = data(req, res, Mock);
      }
      const _mockData = Mock.mock(data);
      if (req.query.callback) {
        res.end(`${req.query.callback}(${JSON.stringify(_mockData)})`);
      } else {
        res.json(_mockData);
      }

    } else {
      next();
    }
  };
}

export default mock;
