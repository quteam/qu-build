import { resolve } from 'path';
import { green, red } from 'chalk';
import { ncp } from 'ncp';

function handleTemplate(_tplName, _prjName) {
  ncp(resolve(__dirname, `../template/${_tplName}`), resolve(process.cwd(), _prjName));
  console.log(green(`\n  创建 ${_tplName} 模板成功。\n`));
}

export default function build(args) {
  const template = args.init;
  const project = args.args[0];
  if (!template) {
    console.error(red('\n  No template name.\n'));
    process.exit();
  } else if (!project) {
    console.error(red('\n  No project name.\n'));
    process.exit();
  } else {
    handleTemplate(template, project);
  }
}
