const sum = require("../src/sum.js");
const assert = require("assert");

describe("sum", () => {
  it("1 + 2 = 3", (done) => {
    assert.equal(sum(1, 2), 3);
    done();
  });
});
