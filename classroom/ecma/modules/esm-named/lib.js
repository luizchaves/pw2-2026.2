// ESM (ECMAScript Modules) module system
// named exports
// A module can have as many named exports as needed, but each name must be unique.
export function sum(a, b) {
  return a + b;
}

export const subtract = function (a, b) {
  return a - b;
};

export const multiply = (a, b) => {
  return a * b;
};

export const divide = (a, b) => a / b;

// SyntaxError: Identifier 'sum' has already been declared.
// export function sum(a, b) {
//   return a + b;
// }
