import * as Lib from './lib.js';

console.log(Lib.sum(2, 1)); // 3
console.log(Lib.PI); // 3.14
console.log(Lib.default.PI); // 3.14
console.log(Object.keys(Lib)); // ['PI', 'default', 'sum']

// TypeError: Cannot assign to read only property 'PI' of object '[object Module]'.
// Lib.PI = 3;
