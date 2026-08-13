import { sum, subtract, multiply, divide } from './lib.js';

console.log(sum(2, 1)); // 3
console.log(subtract(2, 1)); // 1
console.log(multiply(2, 1)); // 2
console.log(divide(2, 1)); // 2

// SyntaxError: The requested module './lib.js' does not provide an export named 'add'.
// import { add } from './lib.js';

// Use "as" to create a local alias for an existing named export.
// import { sum as add } from './lib.js';
