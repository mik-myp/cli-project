import chalk from "chalk";

console.log(chalk.blue("Hello world!"));
console.log(chalk.red.bgBlue.underline("Hello world!"));
console.log(chalk.hex("#DEADED").bold("Hello world!"));
console.log(chalk.rgb(255, 136, 0).italic("Hello world!"));
console.log(chalk.underline("Hello", "world", "!"));
console.log(chalk.red("Hello", chalk.underline.bgBlue("world") + "!"));

const error = (...text) => console.log(chalk.red(...text));
const warning = (...text) => console.log(chalk.yellow(...text));

error("Error: Something went wrong!");
warning("Warning: Something is not right!");
