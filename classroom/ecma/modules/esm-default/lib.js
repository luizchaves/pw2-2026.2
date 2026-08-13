// ESM (ECMAScript Modules) module system
// default export
function sum(a, b) {
  return a + b;
}

export default sum;

// SyntaxError: Identifier '.default' has already been declared.
// export default function subtract(a, b) {
//   return a - b;
// }
