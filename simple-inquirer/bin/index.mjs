#!/usr/bin/env node
import EventEmitter from "events";
import MuteStream from "mute-stream";
import readline from "readline";
import ansiEscapes from "ansi-escapes";
import { fromEvent } from "rxjs";

// 定义选项配置
const option = {
  type: "list",
  name: "name",
  message: "select your name",
  choices: [
    { name: "jack", value: "jack" },
    { name: "rose", value: "rose" },
    { name: "tom", value: "tom" },
  ],
};

// Prompt 函数：返回一个 Promise，在用户完成选择后解析为选中的值
function Prompt(option) {
  return new Promise((resolve, reject) => {
    try {
      // 创建 List 实例
      const list = new List(option);
      // 渲染初始界面
      list.render();
      // 监听 exit 事件，当用户选择完毕时解析 Promise
      list.on("exit", resolve);
    } catch (error) {
      // 捕获异常并拒绝 Promise
      reject(error);
    }
  });
}

// List 类：继承自 EventEmitter，用于管理选择器的状态和事件
class List extends EventEmitter {
  constructor(option) {
    super();
    this.name = option.name; // 选项名称
    this.message = option.message; // 提示信息
    this.choices = option.choices; // 可选列表
    this.input = process.stdin; // 标准输入流

    // 创建 MuteStream 实例，控制输出流的静音和取消静音
    const ms = new MuteStream();
    ms.pipe(process.stdout);
    this.output = ms;

    // 创建 readline 接口
    this.rl = readline.createInterface({
      input: this.input,
      output: this.output,
    });

    this.selected = 0; // 当前选中项索引
    this.height = 0; // 终端高度

    // 监听键盘事件
    this.keypress = fromEvent(this.rl.input, "keypress").forEach(
      this.onkeypress.bind(this)
    );

    this.haveSelected = false; // 是否已选择
  }

  // 处理键盘事件
  onkeypress = (keymap) => {
    const key = keymap[1];
    if (key.name === "down") {
      // 向下箭头：选中下一个选项
      this.selected++;
      if (this.selected >= this.choices.length) {
        this.selected = 0;
      }
      this.render();
    } else if (key.name === "up") {
      // 向上箭头：选中上一个选项
      this.selected--;
      if (this.selected < 0) {
        this.selected = this.choices.length - 1;
      }
      this.render();
    } else if (key.name === "return") {
      // 回车键：确认选择
      this.haveSelected = true;
      this.render();
      this.close();
      this.emit("exit", this.choices[this.selected]);
    }
  };

  // 渲染界面
  render() {
    this.output.unmute(); // 取消静音
    this.clean(); // 清除之前的渲染内容
    this.output.write(this.getContent()); // 写入新内容
    this.output.mute(); // 静音
  }

  // 获取渲染内容
  getContent = () => {
    if (!this.haveSelected) {
      let title =
        "\x1B[32m?\x1B[39m \x1B[1m" +
        this.message +
        "\x1B[22m\x1B[0m \x1B[0m\x1B[2m(Use arrow keys)\x1B[22m\n";
      this.choices.forEach((choice, index) => {
        if (index === this.selected) {
          if (index === this.choices.length - 1) {
            title += "\x1B[36m❯ " + choice.name + "\x1B[39m ";
          } else {
            title += "\x1B[36m❯ " + choice.name + "\x1B[39m \n";
          }
        } else {
          if (index === this.choices.length - 1) {
            title += `  ${choice.name} `;
          } else {
            title += `  ${choice.name} \n`;
          }
        }
      });
      this.height = this.choices.length + 1;
      return title;
    } else {
      const name = this.choices[this.selected].name;
      let title =
        "\x1B[32m?\x1B[39m \x1B[1m" +
        this.message +
        "\x1B[22m\x1B[0m \x1B[36m" +
        name +
        "\x1B[39m\x1B[0m \n";
      return title;
    }
  };

  // 清除之前的渲染内容
  clean() {
    const emptyLines = ansiEscapes.eraseLines(this.height);
    this.output.write(emptyLines);
  }

  // 关闭选择器
  close() {
    this.output.unmute(); // 取消静音
    this.rl.output.end(); // 结束输出流
    this.rl.pause(); // 暂停 readline 接口
    this.rl.close(); // 关闭 readline 接口
  }
}

// 执行 Prompt 函数并打印选择结果
Prompt(option).then((answers) => {
  console.log("answers:", answers);
});
