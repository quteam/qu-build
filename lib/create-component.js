"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createComponent;

var _path = require("path");

var _chalk = require("chalk");

var _ncp = require("ncp");

function handleTemplate(_tplName, _prjName, _cwd) {
  (0, _ncp.ncp)((0, _path.resolve)(__dirname, "../template/".concat(_tplName)), (0, _path.resolve)(_cwd, _prjName));
  console.log((0, _chalk.green)('\n  创建组件成功。\n'));
}

function createComponent(args) {
  handleTemplate('component', args.component, args.cwd);
}