/*
 * VARIABLES: VAR, LET, CONST
 */

/*
 * VARIABLE DECLARATIONS
 */
console.log("VARIABLE DECLARATIONS");

var declaredWithVar = 10;
let declaredWithLet = 20;
const declaredWithConst = 30;

console.log(declaredWithVar); // 10
console.log(declaredWithLet); // 20
console.log(declaredWithConst); // 30

/*
 * VALID IDENTIFIERS
 */
console.log("\nVALID IDENTIFIERS");

const _total = 10;
const $price = 19.9;
const fullName = "Fulano";

console.log(_total); // 10
console.log($price); // 19.9
console.log(fullName); // Fulano

// SyntaxError: Invalid or unexpected token.
// const 2phase = "PW2";

// SyntaxError: Identifier is a reserved word.
// const let = 10;

// The - character is the subtraction operator, not part of an identifier.
// const full-name = "Fulano";

/*
 * INITIALIZATION
 */
console.log("\nINITIALIZATION");

let value;

console.log(value); // undefined
console.log(typeof value); // undefined

value = 100;
value += 50;
console.log(value); // 150

// SyntaxError: Missing initializer in const declaration.
// const missingValue;

/*
 * REASSIGNMENT
 */
console.log("\nREASSIGNMENT");

declaredWithVar = 100;
declaredWithLet = 200;

console.log(declaredWithVar); // 100
console.log(declaredWithLet); // 200

// TypeError: Assignment to constant variable.
// declaredWithConst = 300;

const values = [];
values.push("A");
values.push("B");
console.log(values); // ["A", "B"]

const user = { name: "Alice" };
user.name = "Bob";
console.log(user); // { name: "Bob" }

// TypeError: Assignment to constant variable.
// values = [1, 2];

/*
 * REDECLARATION
 */
console.log("\nREDECLARATION");

var course = "PW2";
var course = "Programacao para Web 2";
console.log(course); // Programacao para Web 2

// SyntaxError: Identifier 'semester' has already been declared.
// let semester = "2026.2";
// let semester = "2027.1";

// SyntaxError: Identifier 'number' has already been declared.
// let number = 10;
// var number = 20;

/*
 * SCOPE
 */
console.log("\nSCOPE");

let semester = "2026.2";
console.log(semester); // 2026.2

if (true) {
  let semester = "inside block";
  const period = "morning";

  console.log(semester); // inside block
  console.log(period); // morning
}

console.log(semester); // 2026.2

function testBlockScope() {
  if (true) {
    var functionScoped = 1;
    let blockScoped = 2;

    console.log(blockScoped); // 2
  }

  console.log(functionScoped); // 1

  // ReferenceError: blockScoped is not defined.
  // console.log(blockScoped);
}

testBlockScope();

function greeting() {
  const message = "Hello";
  console.log(message); // Hello
}

greeting();

// ReferenceError: message is not defined.
// console.log(message);

/*
 * HOISTING AND TEMPORAL DEAD ZONE
 */
console.log("\nHOISTING AND TEMPORAL DEAD ZONE");

console.log(hoistedVar); // undefined
var hoistedVar = 10;
console.log(hoistedVar); // 10

// ReferenceError: Cannot access 'tdzLet' before initialization.
// console.log(tdzLet);
// let tdzLet = 10;

// ReferenceError: Cannot access 'tdzConst' before initialization.
// console.log(tdzConst);
// const tdzConst = 10;

/*
 * IMPLICIT GLOBAL
 */
console.log("\nIMPLICIT GLOBAL");

function createImplicitGlobal() {
  implicitTotal = 100;
  return implicitTotal;
}

console.log(createImplicitGlobal()); // 100
console.log(globalThis.implicitTotal); // 100
delete globalThis.implicitTotal;

// Under "use strict" or inside ES modules:
// ReferenceError: implicitTotal is not defined.

/*
 * LOOP SCOPE
 */
console.log("\nLOOP SCOPE");

const callbacksWithVar = [];
const callbacksWithLet = [];

for (var i = 0; i < 3; i++) {
  callbacksWithVar.push(() => i);
}

for (let j = 0; j < 3; j++) {
  callbacksWithLet.push(() => j);
}

console.log(callbacksWithVar.map((callback) => callback())); // [3, 3, 3]
console.log(callbacksWithLet.map((callback) => callback())); // [0, 1, 2]

/*
 * DYNAMIC TYPING
 */
console.log("\nDYNAMIC TYPING");

let variable = 10;
console.log(variable); // 10
console.log(typeof variable); // number

variable = "Fulano";
console.log(variable); // Fulano
console.log(typeof variable); // string

/*
 * BEST PRACTICES
 */
console.log("\nBEST PRACTICES");

const defaultChoice = "const";
let changesOverTime = 0;
changesOverTime += 1;

console.log(defaultChoice); // const
console.log(changesOverTime); // 1

// Prefer const by default, let when reassignment is needed, and avoid var.
// Always declare variables. Do not depend on implicit globals.

/*
 * CASE SENSITIVE
 */
console.log("\nCASE SENSITIVE");

const number = 8;
const Number = 80;
const NUMBER = 800;

console.log(number); // 8
console.log(Number); // 80
console.log(NUMBER); // 800
