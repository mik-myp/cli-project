import factory from "yargs/yargs";
// import cli from "./cli.mjs";

function cli(cwd) {
  const parser = factory(null, cwd);

  parser.alias("h", "help");
  parser.alias("v", "version");

  parser.usage(
    "$0",
    "TODO: description",
    (yargs) => {
      yargs.options({
        // TODO: options
      });
    }
    // (argv) => cli(argv)
  );

  return parser;
}

export default cli;
