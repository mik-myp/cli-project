import createInitCommand from "@mkeke-imooc/init";
import createInstallCommand from "@mkeke-imooc/install";
import createCLI from "./createCLI.js";
import "./exception.js";

export default function (args) {
  const program = createCLI();
  createInitCommand(program);
  createInstallCommand(program);
  program.parse(process.argv);
}
