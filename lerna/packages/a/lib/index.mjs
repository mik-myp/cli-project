"use strict";

import chalk from "chalk";

console.log("a");

export default function () {
  console.log(chalk.blue("Hello world!"));
  return "Hello from a";
}
