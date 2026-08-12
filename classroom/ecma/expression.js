/*
 * EXPRESSIONS AND STATEMENTS
 */
console.log("EXPRESSIONS AND STATEMENTS");

console.log(1 + 1); // 2

let assignedValue;
console.log((assignedValue = 5)); // 5

let expressionCount = 0;
console.log(expressionCount++); // 0
console.log(expressionCount); // 1

console.log(18 >= 18 ? "adult" : "minor"); // adult

// SyntaxError: Unexpected token 'if'.
// const result = if (true) { 1 } else { 2 };

// A declaration is a statement, not an expression.
// const total = 5;

/*
 * GLOBAL OBJECT
 */
console.log("\nGLOBAL OBJECT");

console.log(typeof window); // undefined, when this file runs in Node.js
console.log(typeof globalThis); // object

// ReferenceError: window is not defined.
// console.log(window);

/*
 * OPERATOR PRECEDENCE
 */
console.log("\nOPERATOR PRECEDENCE");

const fahrenheit = 50;

const wrongCelsius = fahrenheit - 32 / 1.8;
console.log(wrongCelsius); // 32.22222222222222

const celsius = (fahrenheit - 32) / 1.8;
console.log(celsius); // 10

console.log(20 - 10 * 2); // 0
console.log((20 - 10) * 2); // 20
console.log(2 * 3 ** 2); // 18

console.log(true || false && false); // true
console.log((true || false) && false); // false

// SyntaxError: Unexpected token '||'.
// console.log(null ?? false || true);

console.log((null ?? false) || true); // true

/*
 * ASSOCIATIVITY
 */
console.log("\nASSOCIATIVITY");

console.log(20 - 10 - 5); // 5
console.log(2 ** 3 ** 2); // 512

console.log(2 + 3 + "4"); // 54
console.log("2" + 3 + 4); // 234

/*
 * ARITHMETIC OPERATORS
 * Operators covered: +, -, *, /, %, **
 */
console.log("\nARITHMETIC OPERATORS");

console.log(10 + 5); // 15
console.log(10 - 5); // 5
console.log(10 * 5); // 50
console.log(10 / 5); // 2
console.log(10 % 3); // 1
console.log(2 ** 3); // 8

console.log(7 % 3); // 1
console.log(-7 % 3); // -1
console.log(7 % -3); // 1
console.log(7.5 % 2); // 1.5

const index = -7;
console.log(((index % 3) + 3) % 3); // 2

/*
 * UNARY OPERATORS: unary +, unary -, !, typeof, prefix ++
 */
console.log("\nUNARY OPERATORS");

console.log(+"5"); // 5
console.log(-"5"); // -5
console.log(!true); // false
console.log(!!"text"); // true
console.log(typeof "PW2"); // string
console.log(typeof undeclaredName); // undefined

// SyntaxError: Invalid left-hand side expression in prefix operation.
// console.log(20 - +++ 10 * 2);
// console.log(20 - ++10);

console.log(20 - + + +10 * 2); // 0

/*
 * INCREMENT AND DECREMENT OPERATORS: ++, --
 */
console.log("\nINCREMENT AND DECREMENT OPERATORS");

let count = 0;

let postfix = count++;
console.log(postfix); // 0
console.log(count); // 1

let prefix = ++count;
console.log(prefix); // 2
console.log(count); // 2

let decrement = 2;

let decrementPostfix = decrement--;
console.log(decrementPostfix); // 2
console.log(decrement); // 1

let decrementPrefix = --decrement;
console.log(decrementPrefix); // 0
console.log(decrement); // 0

// SyntaxError: Invalid left-hand side expression in postfix operation.
// console.log((++count)++);

/*
 * RELATIONAL OPERATORS: <, <=, >, >=, in, instanceof
 */
console.log("\nRELATIONAL OPERATORS");

console.log(10 > 9); // true
console.log(10 >= 10); // true
console.log(9 <= 10); // true
console.log("10" > 9); // true
console.log("2" > "10"); // true
console.log("10" > "9"); // false
console.log("abc" < "abd"); // true
console.log("2" > 10); // false

const person = { name: "Fulano", address: null };

console.log("name" in person); // true
console.log("age" in person); // false
console.log(3 in [1, 2, 3]); // false
console.log(0 in [1, 2, 3]); // true
console.log([1, 2, 3].includes(3)); // true

const obj = { a: 1 };
delete obj.a;
console.log("a" in obj); // false

console.log([] instanceof Array); // true
console.log([] instanceof Object); // true
console.log(new Date() instanceof Date); // true
console.log((() => { }) instanceof Function); // true
console.log("text" instanceof String); // false
console.log(42 instanceof Number); // false

/*
 * EQUALITY OPERATORS: ==, ===, !=, !==
 */
console.log("\nEQUALITY OPERATORS");

console.log(1 == 1); // true
console.log(1 === 1); // true
console.log(1 == "1"); // true
console.log(1 === "1"); // false
console.log(1 != "1"); // false
console.log(1 !== "1"); // true

/*
 * IMPLICIT COERCION
 */
console.log("\nIMPLICIT COERCION");

console.log("5" + 9); // 59
console.log("5" - 3); // 2
console.log(`total: ${42}`); // total: 42

if ("text") {
  console.log("entered"); // entered
}

console.log(Number("5") + 9); // 14
console.log(String(42)); // 42

/*
 * LOGICAL OPERATORS: &&, ||, !, ??
 */
console.log("\nLOGICAL OPERATORS");

console.log(true && true); // true
console.log(true && false); // false
console.log(false || true); // true
console.log(false || false); // false
console.log(!false); // true

console.log("a" && "b"); // b
console.log("" || "default"); // default
console.log(0 && "x"); // 0
console.log(typeof (1 && 2)); // number

let value;
console.log(value || 10); // 10
console.log(value ?? 10); // 10

value = 0;
console.log(value || 10); // 10
console.log(value ?? 10); // 0

/*
 * BITWISE OPERATORS: &, |, ^, <<, >>, ~
 */
console.log("\nBITWISE OPERATORS");

console.log(1 & 1); // 1
console.log(2 & 1); // 0
console.log(3 & 1); // 1
console.log(4 & 1); // 0

console.log(4 | 2); // 6
console.log(5 ^ 3); // 6
console.log(3 << 1); // 6
console.log(12 >> 1); // 6
console.log(1 << 3); // 8
console.log(~5); // -6
console.log(4 & 2); // 0

/*
 * CONDITIONAL OPERATOR: ?:
 */
console.log("\nCONDITIONAL OPERATOR");

const age = 18;
const ageStatus = age >= 18 ? "adult" : "minor";
console.log(ageStatus); // adult

/*
 * ASSIGNMENT OPERATORS: =, +=, -=, *=, ||=, ??=, &&=
 */
console.log("\nASSIGNMENT OPERATORS");

let total = 10;
total += 5;
console.log(total); // 15

total *= 2;
console.log(total); // 30

let text = "10";
text += 5;
console.log(text); // 105
console.log(typeof text); // string

let numericText = "10";
numericText -= 5;
console.log(numericText); // 5

const [first, second] = [1, 2];
console.log(first); // 1
console.log(second); // 2

const { name, course } = { name: "Fulano", course: "PW2" };
console.log(name); // Fulano
console.log(course); // PW2

let a = 0;
let b = null;
let c = "text";

a ||= 10;
b ??= 20;
c &&= c.toUpperCase();

console.log(a, b, c); // 10 20 TEXT

/*
 * OPTIONAL CHAINING: ?., ?.(), ??, .
 */
console.log("\nOPTIONAL CHAINING");

const student = { name: "Fulano", address: null };

console.log(student.address?.city); // undefined
console.log(student.contact?.email); // undefined
console.log(student.save?.()); // undefined
console.log(student.address?.city ?? "not informed"); // not informed

// TypeError: Cannot read properties of null (reading 'city').
// console.log(student.address.city);
