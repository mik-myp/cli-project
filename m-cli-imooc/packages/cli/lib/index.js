import createCLI from './createCLI.js';
import './exception.js';

export default function(args) {
  const program = createCLI();
  program.parse(process.argv);
};
