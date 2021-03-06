import { resolve } from 'path';
import { green } from 'chalk';
import { ncp } from 'ncp';

function handleTemplate(_tplName, _prjName, _cwd) {
  ncp(resolve(__dirname, "../template/".concat(_tplName)), resolve(_cwd, _prjName));
  console.log(green('\n  创建组件成功。\n'));
}

export default function createComponent(args) {
  handleTemplate('component', args.component, args.cwd);
}