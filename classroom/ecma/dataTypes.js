/*
 * DATA TYPES
 */
console.log("DATA TYPES");

/*
 * PRIMITIVE VALUES
 */
console.log("\nPRIMITIVE VALUES");

console.log(undefined); // undefined
console.log(null); // null
console.log(true); // true
console.log(false); // false
console.log('Hello, World!'); // Hello, World!
console.log("Programacao para Web 2"); // Programacao para Web 2
console.log(`Hello, ${1 + 1}`); // Hello, 2
console.log(42); // 42
console.log(42n); // 42n
console.log(Symbol("id")); // Symbol(id)

/*
 * NULL AND UNDEFINED
 */
console.log("\nNULL AND UNDEFINED");

let notInitialized;
const empty = null;

console.log(notInitialized); // undefined
console.log(typeof notInitialized); // undefined
console.log(empty); // null
console.log(typeof empty); // object

/*
 * BOOLEAN CONVERSION AND FALSY VALUES
 */
console.log("\nBOOLEAN CONVERSION AND FALSY VALUES");

console.log(Boolean(false)); // false
console.log(Boolean(0)); // false
console.log(Boolean(-0)); // false
console.log(Boolean(0n)); // false
console.log(Boolean("")); // false
console.log(Boolean(null)); // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN)); // false

console.log(Boolean([])); // true
console.log(Boolean({})); // true
console.log(Boolean("0")); // true

/*
 * NUMBER VALUES
 */
console.log("\nNUMBER VALUES");

console.log(-15); // -15
console.log(15); // 15
console.log(0b1111); // 15
console.log(0o17); // 15
console.log(0xf); // 15
console.log(15_000); // 15000
console.log(3.14); // 3.14
console.log(314e-2); // 3.14
console.log(Math.PI); // 3.141592653589793

console.log(0 / 0); // NaN
console.log(typeof (0 / 0)); // number
console.log(NaN === NaN); // false
console.log(Number.isNaN(0 / 0)); // true

console.log(1 / 0); // Infinity
console.log(-1 / 0); // -Infinity

console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

/*
 * BIGINT
 */
console.log("\nBIGINT");

const big = 9007199254740991n;

console.log(typeof big); // bigint
console.log(big + 1n); // 9007199254740992n
console.log(big + BigInt(1)); // 9007199254740992n
console.log(big == 9007199254740991); // true
console.log(big === 9007199254740991); // false

// TypeError: Cannot mix BigInt and other types, use explicit conversions.
// console.log(big + 1);

/*
 * SYMBOL
 */
console.log("\nSYMBOL");

const firstSymbol = Symbol("id");
const secondSymbol = Symbol("id");

console.log(typeof firstSymbol); // symbol
console.log(firstSymbol === secondSymbol); // false
console.log(Symbol.for("id") === Symbol.for("id")); // true

// Symbol("id")     // always creates a new symbol.
// Symbol.for("id") // looks up "id" in the registry and reuses the existing symbol.

/*
 * OBJECT VALUES
 */
console.log("\nOBJECT VALUES");

console.log([]); // []
console.log([1, 2, 3]); // [1, 2, 3]
console.log([1, , 3]); // [1, <1 empty item>, 3]
console.log([1010, "Fulano", true, ["PW2", "ER"]]); // [1010, "Fulano", true, ["PW2", "ER"]]
console.log({ id: 1010, name: "Fulano", active: true }); // { id: 1010, name: "Fulano", active: true }
console.log(function sum(a, b) {
  return a + b;
}); // [Function: sum]
console.log(new Date("2026-08-12T00:00:00.000Z")); // 2026-08-12T00:00:00.000Z
console.log(/pw2/i); // /pw2/i

/*
 * TYPEOF
 */
console.log("\nTYPEOF");

console.log(typeof undefined); // undefined
console.log(typeof null); // object
console.log(typeof true); // boolean
console.log(typeof "Hello"); // string
console.log(typeof 42); // number
console.log(typeof 42n); // bigint
console.log(typeof Symbol("id")); // symbol
console.log(typeof []); // object
console.log(Array.isArray([])); // true
console.log(typeof {}); // object
console.log(typeof function () { }); // function

/*
 * EXPLICIT CONVERSION
 */
console.log("\nEXPLICIT CONVERSION");

console.log(Number("42") + 8); // 50
console.log(String(42) + 8); // 428
console.log(Boolean(0)); // false
console.log(parseInt("42px")); // 42
console.log(Number("42px")); // NaN
console.log(Number("")); // 0
console.log((42).toString()); // 42

/*
 * DYNAMIC AND WEAK TYPING
 */
console.log("\nDYNAMIC AND WEAK TYPING");

let variable = 10;
console.log(variable); // 10
console.log(typeof variable); // number

variable = "Fulano";
console.log(variable); // Fulano
console.log(typeof variable); // string

console.log("5" + 9); // 59
console.log("5" - 3); // 2
console.log(`total: ${42}`); // total: 42
console.log(Number("5") + 9); // 14
