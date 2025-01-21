module.exports = {
  sum(a, b) {
    return a + b;
  },
  multiply(a, b) {
    return a * b;
  },
  init({ option, param }) {
    console.log("执行init", option, param);
  },
};
