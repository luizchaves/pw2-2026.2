import MathLib, { sum as add } from './lib.js';
import { sqrt } from 'mathjs';

// './lib.js' is a relative specifier: it starts with ./ and includes the extension.
// 'mathjs' is a package specifier: Node resolves it from node_modules.
console.log(MathLib.sum(2, 1)); // 3
console.log(add(2, 1)); // 3
console.log(MathLib.subtract(2, 1)); // 1
console.log(MathLib.multiply(2, 1)); // 2
console.log(MathLib.divide(2, 1)); // 2
console.log(sqrt(4)); // 2
console.log(Math.sqrt(4)); // 2

// Error [ERR_MODULE_NOT_FOUND]: Cannot find module './lib'.
// In Node.js ESM, relative imports need the exact file extension.
// import MathLibWithoutExtension from './lib';
