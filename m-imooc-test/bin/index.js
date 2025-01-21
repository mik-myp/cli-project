#!/usr/bin/env node

// commander
const commander = require("commander");
const { version, bin } = require("../package.json");

// 获取commander的单例
// const { program } = commander;

// 实例化一个commander对象
const program = new commander.Command();

program
  .name(Object.keys(bin)[0])
  .usage("<command> [options]")
  .version(version)
  .option("-d, --debug", "开启调试模式", false)
  .option("-r, --registry <registry>", "指定npm registry地址");

// command 注册命令

const clone = program.command("clone <source> [destination]");
clone
  .description("clone a repository into a newly created directory")
  .option("-f, --force", "overwrite target directory if it exists")
  .option("-b, --branch <branch>", "checkout a branch")
  .action((source, destination, options) => {
    console.log("clone", source, destination, options);
  });

// addCommand 注册子命令
const service = new commander.Command("service");
service
  .command("start [port]")
  .description("start servece at some port")
  .action((port) => {
    console.log("service start", port);
  });

service
  .command("stop")
  .description("stop service")
  .action(() => {
    console.log("stop service");
  });
program.addCommand(service);

// m-imooc-test install init -> m-imooc-install init
program
  .command("install [name]", "install some package", {
    executableFile: "m-imooc-install",
    isDefault: true,
    hidden: false,
  })
  .alias("i");

program
  .argument("<cmd> [options]")
  .description("test command", {
    cmd: "command to run",
    options: "options for command",
  })
  .action((cmd, env) => {
    console.log("test command", cmd, env);
  });

program.parse(process.argv);

program.outputHelp();
program.opts();

// yargs
// const yargs = require("yargs/yargs");
// const { hideBin } = require("yargs/helpers");

// const arg = hideBin(process.argv);

// const cli = yargs(arg);

// cli
//   .usage("Usage: m-imooc-test [command] <options>")
//   .demandCommand(
//     1,
//     "A command is required. Pass --help to see all available commands and options."
//   )
//   .strict()
//   .recommendCommands()
//   .fail((msg, err, yargs) => {
//     console.log(msg, err, yargs);
//   })
//   .alias("h", "help")
//   .alias("v", "version")
//   .wrap(cli.terminalWidth())
//   .epilogue(
//     `
// When a command fails, all logs are written to lerna-debug.log in the current working directory.

// For more information, find our manual at URL_ADDRESS    For more information, find our manual at https://github.com/lerna/lerna.
// `
//   )
//   .options({
//     debug: {
//       type: "boolean",
//       describe: "开启调试模式",
//       alias: "d",
//     },
//   })
//   .option("registry", {
//     type: "string",
//     describe: "指定npm registry地址",
//     alias: "r",
//   })
//   .group(["debug"], "Dev Options:")
//   .group(["registry"], "Extra Options:")
//   .command(
//     "init [name]",
//     "Do init a project",
//     (yargs) => {
//       yargs.option("name", {
//         type: "string",
//         describe: "项目名称",
//         alias: "n",
//       });
//     },
//     (argv) => {
//       console.log(argv);
//     }
//   )
//   .command({
//     command: "list",
//     describe: "List all packages",
//     aliases: ["ls", "la", "ll"],
//     builder: (yargs) => {
//       yargs.option("all", {
//         type: "boolean",
//         describe: "List all packages",
//         alias: "a",
//       });
//     },
//     handler: (argv) => {
//       console.log(argv);
//     },
//   }).argv;

// const lib = require("m-imooc-test-lib");

// // 简单的命令注册和参数处理
// const process = require("process");

// // console.log(process, process.argv);

// const argv = process.argv;

// const command = argv[2];

// const options = argv.slice(3);

// // m-imooc-test --init --name react-test
// if (options.length > 1) {
//   let [option, param] = options;
//   option = option.replace("--", "");

//   console.log(option, param);

//   if (command) {
//     if (lib[command] && typeof lib[command] === "function") {
//       lib[command]({ option, param });
//     } else {
//       console.log("无效的命令");
//     }
//   } else {
//     console.log("请输入命令");
//   }
// }

// // 全局命令：m-imooc-test --version， m-imooc-test -v，m-imooc-test -V
// if (command.startsWith("--") || command.startsWith("-")) {
//   const globalCommand = command.replace(/--|-/g, "");
//   if (
//     globalCommand === "version" ||
//     globalCommand === "v" ||
//     globalCommand === "V"
//   ) {
//     console.log(require("../package.json").version);
//   }
// }

// console.log(lib, lib.sum(1, 3));
// console.log(lib.multiply(3, 4));
// lib.init();

// console.log("hello m-imooc-test");
