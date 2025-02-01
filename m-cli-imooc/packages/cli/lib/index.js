import createInitCommand from "@mkeke-imooc/init";
import createInstallCommand from "@mkeke-imooc/install";
import createLintCommand from "@mkeke-imooc/lint";
import createCLI from "./createCLI.js";
import "./exception.js";

export default function (args) {
  const program = createCLI();
  createInitCommand(program);
  createInstallCommand(program);
  createLintCommand(program);
  program.parse(process.argv);
}
