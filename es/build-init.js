import { resolve } from 'path';
import { green, red } from 'chalk';
import { ncp } from 'ncp';

function handleTemplate(_tplName, _prjName, _cwd) {
  ncp(resolve(__dirname, "../template/".concat(_tplName)), resolve(_cwd, _prjName));
  console.log(green("\n  \u521B\u5EFA ".concat(_tplName, " \u6A21\u677F\u6210\u529F\u3002\n")));
}

export default function build(args) {
  var template = args.init;
  var project = args.args[0];

  if (!template) {
    console.error(red('\n  No template name.\n'));
    process.exit();
  } else if (!project) {
    console.error(red('\n  No project name.\n'));
    process.exit();
  } else {
    handleTemplate(template, project, args.cwd);
  }
}