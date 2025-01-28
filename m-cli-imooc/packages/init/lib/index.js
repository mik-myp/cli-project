import Command from '@mkeke-imooc/command';
import { log } from '@mkeke-imooc/utils';
/**
 * examples:
 * cli-imooc init
 * cli-imooc init aaa -t project -tp template-react18 --force
 */
class InitCommand extends Command {
  get command() {
    return 'init [name]';
  }

  get description() {
    return 'init project';
  }

  get options() {
    return [
      ['-f, --force', '是否强制更新', false],
    ];
  }

  async action([name, opts]) {
    log.verbose('init', name, opts);
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

export default Init;
