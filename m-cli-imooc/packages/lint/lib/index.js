import path from "node:path";
import Command from "@mkeke-imooc/command";
import { log, printErrorLog } from "@mkeke-imooc/utils";
import { ESLint } from "eslint";
import vueConfig from "../lib/eslint/vueConfig.js";
import { execa } from "execa";
import ora from "ora";
import jest from "jest";
import Mocha from "mocha";

/**
 * examples:
 * mkeke-imooc-cli lint
 */
class LintCommand extends Command {
  get command() {
    return "lint";
  }

  get description() {
    return "lint project";
  }

  get options() {
    return [];
  }

  extractESLint(resultText, type) {
    const map = {
      problems: /[0-9]+ problems/,
      errors: /[0-9]+ errors/,
      warnings: /[0-9]+ warnings/,
    };
    return resultText.match(map[type])[0].match(/[0-9]+/)[0];
  }

  parseESLintResult(resultText) {
    const problems = this.extractESLint(resultText, "problems");
    const errors = this.extractESLint(resultText, "errors");
    const warnings = this.extractESLint(resultText, "warnings");
    return {
      problems: +problems || 0,
      errors: +errors || 0,
      warnings: +warnings || 0,
    };
  }

  async action() {
    log.verbose("lint");
    // 1. eslint
    // 准备工作，安装依赖
    const spinner = ora("正在安装依赖").start();
    try {
      await execa("npm", ["install", "-D", "eslint-config-airbnb-base@15.0.0"]);
      await execa("npm", ["install", "-D", "eslint-plugin-vue@9.8.0"]);
    } catch (error) {
      printErrorLog(error);
    } finally {
      spinner.stop();
    }
    log.info("正在执行eslint检查");

    const cwd = process.cwd();
    const eslint = new ESLint({ cwd, overrideConfig: vueConfig });
    const results = await eslint.lintFiles(["src/**/*.js", "src/**/*.vue"]);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
    const eslintResult = this.parseESLintResult(resultText);
    log.verbose("eslintResult", eslintResult);
    log.success(
      "eslint检查完毕",
      "错误: " + eslintResult.errors,
      "，警告: " + eslintResult.warnings
    );
    // 2. jest
    log.info("正在执行jest检查");
    await jest.run("test");
    log.success("jest检查完毕");
    // 3. mocha
    log.info("正在执行mocha检查");
    const mochaInstance = new Mocha();
    mochaInstance.addFile(path.resolve(cwd, "__tests__/mocha_test.js"));
    mochaInstance.run(() => {
      log.success("mocha检查完毕");
    });
  }
}

function Lint(instance) {
  return new LintCommand(instance);
}

export default Lint;
