/*
 * FUNCTIONS
 */
console.log("FUNCTIONS");

/*
 * FUNCTION DECLARATION
 * Syntax covered: function name(parameters) { return value; }
 */
console.log("\nFUNCTION DECLARATION");

function addition(param1, param2) {
  return param1 + param2;
}

console.log(addition(1)); // NaN
console.log(addition(1, 2)); // 3
console.log(addition(1, 2, 3)); // 3

/*
 * FUNCTION EXPRESSION
 * Syntax covered: const name = function (parameters) { return value; };
 */
console.log("\nFUNCTION EXPRESSION");

const subtraction = function (param1, param2) {
  return param1 - param2;
};

console.log(subtraction); // [Function: subtraction]
console.log(subtraction(2, 1)); // 1

/*
 * ARROW FUNCTION
 * Syntax covered: =>, explicit return, implicit return
 */
console.log("\nARROW FUNCTION");

const multiplication = (param1, param2) => {
  return param1 * param2;
};

const division = (param1, param2) => param1 / param2;

console.log(multiplication(2, 3)); // 6
console.log(division(6, 2)); // 3

const double = (number) => number * 2;
const createObject = (name) => ({ name });
const wrongCreateObject = (name) => { name };

console.log(double(5)); // 10
console.log(createObject("Fulano")); // { name: "Fulano" }
console.log(wrongCreateObject("Fulano")); // undefined

// SyntaxError: Unexpected token '='.
// function wrongAddition = (param1, param2) {
//   return param1 + param2;
// }

/*
 * RETURN
 * Syntax covered: return
 */
console.log("\nRETURN");

function greeting(name) {
  console.log(`Hello, ${name}`); // Hello, Fulano
}

const greetingResult = greeting("Fulano");
console.log(greetingResult); // undefined

function greetingMessage(name) {
  return `Hello, ${name}`;
}

console.log(greetingMessage("Fulano")); // Hello, Fulano

function checkAge(age) {
  if (age < 18) {
    return "minor";
  }

  return "adult";
}

console.log(checkAge(17)); // minor
console.log(checkAge(18)); // adult

/*
 * DEFAULT PARAMETERS
 * Syntax covered: parameter = defaultValue
 */
console.log("\nDEFAULT PARAMETERS");

function power(base, exponent = 1) {
  return base ** exponent;
}

console.log(power(2)); // 2
console.log(power(2, 3)); // 8
console.log(power(2, undefined)); // 2
console.log(power(2, null)); // 1

function register(message, date = new Date("2026-08-12T00:00:00.000Z"), prefix = message.length) {
  return `${prefix}: ${message} (${date.toISOString()})`;
}

console.log(register("PW2")); // 3: PW2 (2026-08-12T00:00:00.000Z)

/*
 * REST PARAMETERS
 * Syntax covered: ...rest
 */
console.log("\nREST PARAMETERS");

function collect(first, ...rest) {
  console.log(first); // 1
  console.log(rest); // [2, 3]
  console.log(Array.isArray(rest)); // true
}

collect(1, 2, 3);

function sumAll(...numbers) {
  let total = 0;

  for (const number of numbers) {
    total += number;
  }

  return total;
}

console.log(sumAll()); // 0
console.log(sumAll(1, 2, 3)); // 6
console.log(sumAll(1, 2, 3, 4, 5)); // 15

const values = [1, 2, 3];
console.log(sumAll(...values)); // 6

// SyntaxError: Rest parameter must be last formal parameter.
// function invalidRest(...rest, last) {}

/*
 * ARGUMENTS OBJECT
 * Syntax covered: arguments
 */
console.log("\nARGUMENTS OBJECT");

function showArguments() {
  console.log(arguments.length); // 3
  console.log(arguments[0]); // 1
  console.log(Array.isArray(arguments)); // false
  console.log(typeof arguments); // object
}

showArguments(1, 2, 3);

function sumArguments() {
  return Array.from(arguments).reduce((total, number) => total + number, 0);
}

console.log(sumArguments(1, 2, 3)); // 6

function outerArguments() {
  const arrow = () => arguments.length;
  return arrow(9, 9);
}

console.log(outerArguments(1, 2, 3)); // 3

// Arrow functions do not have their own arguments object.
// const arrowArguments = () => arguments.length; // ReferenceError in this file.

/*
 * DESTRUCTURED PARAMETERS
 * Syntax covered: object destructuring, parameter defaults
 */
console.log("\nDESTRUCTURED PARAMETERS");

function createUser({ name = "anonymous", active = true } = {}) {
  return `${name} / ${active}`;
}

console.log(createUser({ name: "Fulano" })); // Fulano / true
console.log(createUser({ name: "Beltrano", active: false })); // Beltrano / false
console.log(createUser()); // anonymous / true

// TypeError: Cannot destructure property 'name' of 'undefined'.
// function createInvalidUser({ name }) {
//   return name;
// }
// createInvalidUser();

/*
 * CALLBACK
 * Syntax covered: function value passed as argument
 */
console.log("\nCALLBACK");

function calc(param1, param2, callback) {
  return callback(param1, param2);
}

console.log(calc(2, 1, addition)); // 3
console.log(calc(2, 1, subtraction)); // 1
console.log(calc(2, 1, multiplication)); // 2
console.log(calc(2, 1, division)); // 2
console.log(calc(2, 1, (base, exponent) => base ** exponent)); // 2

function isValidNumber(number, callback) {
  return Boolean(callback(number));
}

console.log(isValidNumber(1, (number) => number > 0)); // true
console.log(isValidNumber(1, (number) => number < 0)); // false
console.log(isValidNumber(1, (number) => number & 1)); // true

// TypeError: callback is not a function.
// console.log(calc(2, 1, addition()));

/*
 * HOISTING
 * Syntax covered: function declaration, function expression
 */
console.log("\nHOISTING");

console.log(hoistedAddition(2, 3)); // 5

function hoistedAddition(param1, param2) {
  return param1 + param2;
}

// ReferenceError: Cannot access 'notHoistedSubtraction' before initialization.
// console.log(notHoistedSubtraction(2, 3));
// const notHoistedSubtraction = function (param1, param2) {
//   return param1 - param2;
// };

// TypeError: notHoistedMultiplication is not a function.
// console.log(notHoistedMultiplication(2, 3));
// var notHoistedMultiplication = function (param1, param2) {
//   return param1 * param2;
// };

/*
 * REDEFINITION
 * Syntax covered: repeated function declaration
 */
console.log("\nREDEFINITION");

function runRedefinitionExample() {
  function operation(param1, param2) {
    return param1 + param2;
  }

  function operation(param) {
    return param + 1;
  }

  console.log(operation(1)); // 2
  console.log(operation(1, 2)); // 2
}

runRedefinitionExample();

/*
 * CASE SENSITIVE
 * Syntax covered: identifiers with different case
 */
console.log("\nCASE SENSITIVE");

function sumLower(param1, param2) {
  return param1 + param2;
}

function SumLower(param) {
  return param + 1;
}

console.log(sumLower(1, 2)); // 3
console.log(SumLower(1, 2)); // 2

/*
 * CLOSURE
 * Syntax covered: nested function, lexical scope
 */
console.log("\nCLOSURE");

function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2

/*
 * THIS AND ARROW FUNCTIONS
 * Syntax covered: this, method shorthand, arrow function
 */
console.log("\nTHIS AND ARROW FUNCTIONS");

const calculator = {
  factor: 2,
  regularDouble(number) {
    return number * this.factor;
  },
  arrowDouble: (number) => number * this.factor,
  createArrowDouble() {
    return (number) => number * this.factor;
  },
};

console.log(calculator.regularDouble(5)); // 10
console.log(calculator.arrowDouble(5)); // NaN
console.log(calculator.createArrowDouble()(5)); // 10
