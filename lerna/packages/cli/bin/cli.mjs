#!/usr/bin/env node

"use strict";

console.log(1231);

import cli from "../src/cli.mjs";
import a from "m-lerna-a";
import b from "m-lerna-b";
// // eslint-disable-next-line no-unused-expressions
cli().parse(process.argv.slice(2));
a();
console.log(b());
