"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.sort");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.match");

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _mockjs = _interopRequireWildcard(require("mockjs"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+([^\n]+)[\s\S]+?\*\//im;

function mock(_opts) {
  var routes = {};

  _opts.modules.map(function (_dir) {
    _fs.default.exists(_dir, function (exists) {
      if (exists) {
        _fs.default.readdir(_dir, function (err, files) {
          files.map(function (file) {
            if (/\.js(on)?$/i.test(file)) {
              var filepath = (0, _path.resolve)(_dir, file);
              var content = String(_fs.default.readFileSync(filepath, 'utf8')).trim() || '{}';
              var url = filepath;
              var describe = 'no description';
              var m = content.match(RE);

              if (m) {
                url = m[2].trim();
                describe = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
              }

              if (url[0] !== '/') {
                url = "/".concat(url);
              }

              var pathname = url;

              if (pathname.indexOf('?') > -1) {
                pathname = pathname.split('?')[0];
              }

              if (mock.debug && routes[pathname]) {
                console.warn("[Mock Warn]: [".concat(filepath, ": ").concat(pathname, "] already exists and has been covered with new data."));
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
                  routes[pathname].data = new Function("return (".concat(content, ")"))();
                } catch (e) {
                  delete routes[pathname];

                  if (mock.debug) {
                    console.warn('[Mock Warn]:', e);
                  }
                }
              }
            }
          });
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
      var host = "".concat(req.protocol, "://").concat(req.headers.host).concat(req.baseUrl);
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
        data = data(req, res, _mockjs.default);
      }

      var _mockData = _mockjs.default.mock(data);

      if (req.query.callback) {
        res.end("".concat(req.query.callback, "(").concat(JSON.stringify(_mockData), ")"));
      } else {
        res.json(_mockData);
      }
    } else {
      next();
    }
  };
}

var _default = mock;
exports.default = _default;