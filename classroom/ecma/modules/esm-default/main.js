// An export default is imported without braces, and the local name is free.
import add from './lib.js';
import anyName from './lib.js';

console.log(add(2, 1)); // 3
console.log(anyName(2, 1)); // 3

// SyntaxError: The requested module './lib.js' does not provide an export named 'sum'.
// import { sum } from './lib.js';
