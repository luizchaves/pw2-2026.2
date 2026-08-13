const needsCalculation = true;

// SyntaxError: import declarations may only appear at top level of a module.
// if (needsCalculation) {
//   import { sum } from './lib.js';
// }

if (needsCalculation) {
  const { sum, default: MathLib } = await import('./lib.js');

  console.log(sum(2, 1)); // 3
  console.log(MathLib.sum(2, 1)); // 3
}
