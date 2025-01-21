import inquirer from "inquirer";

// inquirer
//   .prompt([
//     {
//       type: "input",
//       name: "username",
//       message: "What is your username?",
//     },
//     {
//       type: "password",
//       name: "password",
//       message: "What is your password?",
//       mask: "*",
//     },
//     {
//       type: "confirm",
//       name: "confirm",
//       message: "Are you sure?",
//       default: true,
//     },
//   ])
//   .then((answers) => {
//     console.log("Answers:", answers);
//   })
//   .catch((error) => {
//     if (error.isTtyError) {
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       // Something else went wrong
//     }
//   });

inquirer
  .prompt([
    {
      type: "input",
      name: "username",
      message: "What is your username?",
      default: "user123",
    },
    {
      type: "password",
      name: "password",
      message: "What is your password?",
      mask: "*",
    },
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure?",
      default: true,
    },
    {
      type: "list",
      name: "language",
      message: "What is your preferred programming language?",
      choices: ["JavaScript", "Python", "Java", "C++"],
    },
    {
      type: "checkbox",
      name: "hobbies",
      message: "What are your hobbies?",
      choices: ["Reading", "Gaming", "Coding", "Hiking"],
    },
    {
      type: "expand",
      name: "expand",
      message: "Conflict on `file.js`: ",
      choices: [
        {
          key: "x",
          name: "Overwrite",
          value: "overwrite",
        },
        {
          key: "m",
          name: "Merge",
          value: "merge",
        },
        {
          key: "a",
          name: "Abort",
          value: "abort",
        },
      ],
    },
  ])
  .then((answers) => {
    console.log("Answers:", answers);
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
