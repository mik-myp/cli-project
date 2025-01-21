#!/usr/bin/env node
// TODO:24h后提交到npm，并重新安装到全局npm中测试
const lib = require("m-imooc-test-lib");

// 简单的命令注册和参数处理
const process = require("process");

// console.log(process, process.argv);

const argv = process.argv;

const command = argv[2];

const options = argv.slice(3);

// m-imooc-test --init --name react-test
if (options.length > 1) {
  let [option, param] = options;
  option = option.replace("--", "");

  console.log(option, param);

  if (command) {
    if (lib[command] && typeof lib[command] === "function") {
      lib[command]({ option, param });
    } else {
      console.log("无效的命令");
    }
  } else {
    console.log("请输入命令");
  }
}

// 全局命令：m-imooc-test --version， m-imooc-test -v，m-imooc-test -V
if (command.startsWith("--") || command.startsWith("-")) {
  const globalCommand = command.replace(/--|-/g, "");
  if (
    globalCommand === "version" ||
    globalCommand === "v" ||
    globalCommand === "V"
  ) {
    console.log(require("../package.json").version);
  }
}

// console.log(lib, lib.sum(1, 3));
// console.log(lib.multiply(3, 4));
// lib.init();

// console.log("hello m-imooc-test");
