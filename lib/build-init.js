"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _path = require("path");

var _chalk = require("chalk");

var _ncp = require("ncp");

function handleTemplate(_tplName, _prjName, _cwd) {
  (0, _ncp.ncp)((0, _path.resolve)(__dirname, "../template/".concat(_tplName)), (0, _path.resolve)(_cwd, _prjName));
  console.log((0, _chalk.green)("\n  \u521B\u5EFA ".concat(_tplName, " \u6A21\u677F\u6210\u529F\u3002\n")));
}

function build(args) {
  var template = args.init;
  var project = args.args[0];

  if (!template) {
    console.error((0, _chalk.red)('\n  No template name.\n'));
    process.exit();
  } else if (!project) {
    console.error((0, _chalk.red)('\n  No project name.\n'));
    process.exit();
  } else {
    handleTemplate(template, project, args.cwd);
  }
}