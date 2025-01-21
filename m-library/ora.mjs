import ora, { oraPromise } from "ora";

let percent = 0;
const spinner = ora("Loading unicorns").start();

spinner.color = "yellow";
spinner.text = `Loading rainbows ${percent}%`;
spinner.prefixText = "Prefix:";

const interval = setInterval(() => {
  percent += 10;
  spinner.text = `Loading rainbows ${percent}%`;
  spinner.render();
  if (percent >= 100) {
    clearInterval(interval);
    spinner.succeed("Loading rainbows completed");
  }
}, 1000);

(async () => {
  await oraPromise(
    new Promise((resolve) => {
      console.log("doing something...");
      setTimeout(resolve, 3000);
    }),
    {
      successText: "Done!",
      failText: "Failed!",
      prefixText: "Prefix:",
      text: "Loading...",
      spinner: {
        interval: 80,
        frames: ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"],
      },
    }
  );
})();
