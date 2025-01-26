import createInitCommand from '@mkeke-imooc/init';
import createInstallCommand from '@mkeke-imooc/install';
import createLintCommand from '@mkeke-imooc/lint';
import createCommitCommand from '@mkeke-imooc/commit';
import createCLI from './createCLI.js';
import './exception.js';

export default function(args) {
  const program = createCLI();
  createInitCommand(program);
  createInstallCommand(program);
  createLintCommand(program);
  createCommitCommand(program);
  program.parse(process.argv);
};
