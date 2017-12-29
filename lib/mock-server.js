'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mockjs = require('mockjs');

var _mockjs2 = _interopRequireDefault(_mockjs);

var _nodeWalkdir = require('node-walkdir');

var _nodeWalkdir2 = _interopRequireDefault(_nodeWalkdir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+([^\n]+)[\s\S]+?\*\//im;

function mock(_opts) {
  var routes = {};
  _opts.modules.map(function (_dir) {
    _fs2.default.exists(_dir, function (exists) {
      if (exists) {
        (0, _nodeWalkdir2.default)(_dir, /\.js(on)?$/i, function (filepath) {
          var content = String(_fs2.default.readFileSync(filepath, 'utf8')).trim() || '{}';

          var url = filepath;
          var describe = 'no description';

          var m = content.match(RE);

          if (m) {
            url = m[2].trim();
            describe = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
          }

          if (url[0] !== '/') {
            url = '/' + url;
          }

          var pathname = url;
          if (pathname.indexOf('?') > -1) {
            pathname = pathname.split('?')[0];
          }

          if (mock.debug && routes[pathname]) {
            console.warn('[Mock Warn]: [' + filepath + ': ' + pathname + '] already exists and has been covered with new data.');
          }

          routes[pathname] = {
            url: url,
            filepath: filepath,
            describe: describe
          };

          if (/\.js$/.test(filepath)) {
            routes[pathname].data = require(filepath);
          } else {
            try {
              routes[pathname].data = new Function('return (' + content + ')')();
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

    var url = req.originalUrl.split('?')[0];

    if (url === '/api') {
      var host = req.protocol + '://' + req.headers.host + req.baseUrl;

      var list = Object.keys(routes).sort().map(function (path) {
        var route = routes[path];
        return {
          title: route.describe,
          url: host + route.url,
          file: route.filepath
        };
      });

      res.json(list);
    }

    var data = (routes[url] || 0).data;
    if (data) {
      if (typeof data === 'function') {
        data = data(req, res, _mockjs2.default);
      }
      var _mockData = _mockjs2.default.mock(data);
      if (req.query.callback) {
        res.end(req.query.callback + '(' + JSON.stringify(_mockData) + ')');
      } else {
        res.json(_mockData);
      }
    } else {
      next();
    }
  };
}

exports.default = mock;