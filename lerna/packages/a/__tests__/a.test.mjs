"use strict";
import a from "../lib/index.mjs";
import { strict } from "assert";

strict.strictEqual(a(), "Hello from a");
console.info("a tests passed", a());
