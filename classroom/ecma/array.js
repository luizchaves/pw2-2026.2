/*
 * ARRAYS
 */
console.log("ARRAYS");

/*
 * CREATION AND STRUCTURE
 * Concepts covered: array literal, heterogeneous types, Array constructor, sparse arrays, Array.from, Array.isArray, const mutation vs reassignment
 */
console.log("\nCREATION AND STRUCTURE");

const numbers = [10, 20, 30, 40];
const empty = [];
const mixed = [42, "JavaScript", true, null, { role: "admin" }, [1, 2]];

console.log(numbers); // [ 10, 20, 30, 40 ]
console.log(empty); // []
console.log(mixed[1]); // JavaScript
console.log(mixed[5][0]); // 1

const constructorArray = new Array(10, 20, 30);
const fixedLength = new Array(3);
console.log(constructorArray); // [ 10, 20, 30 ]
console.log(fixedLength); // [ <3 empty items> ]

const sparseLiteral = [10, , 30];
console.log(sparseLiteral); // [ 10, <1 empty item>, 30 ]

const digits = Array.from("12345");
console.log(digits); // [ '1', '2', '3', '4', '5' ]

console.log(typeof numbers); // object
console.log(Array.isArray(numbers)); // true
console.log(Array.isArray({})); // false

const mutableConstArray = [];
mutableConstArray.push(1);
mutableConstArray.push(2);
console.log(mutableConstArray); // [ 1, 2 ]

// TypeError: Assignment to constant variable.
// mutableConstArray = [1, 2];

/*
 * ACCESS, MODIFICATION AND LENGTH
 * Concepts covered: bracket notation, .at(), length property, truncating array, delete operator
 */
console.log("\nACCESS, MODIFICATION AND LENGTH");

const colors = ["vermelho", "verde", "azul"];

console.log(colors[0]); // vermelho
console.log(colors[2]); // azul
console.log(colors[3]); // undefined

console.log(colors.at(0)); // vermelho
console.log(colors.at(-1)); // azul
console.log(colors.at(-2)); // verde

colors[1] = "amarelo";
colors[3] = "roxo";
console.log(colors); // [ 'vermelho', 'amarelo', 'azul', 'roxo' ]

console.log(colors.length); // 4

const fruits = ["maçã", "banana", "laranja"];
fruits[5] = "uva";
console.log(fruits); // [ 'maçã', 'banana', 'laranja', <2 empty items>, 'uva' ]
console.log(fruits.length); // 6
console.log(fruits[3]); // undefined

fruits.length = 2;
console.log(fruits); // [ 'maçã', 'banana' ]

const itemsToDelete = [10, 20, 30, 40];
delete itemsToDelete[2];
console.log(itemsToDelete); // [ 10, 20, <1 empty item>, 40 ]
console.log(itemsToDelete.length); // 4
console.log(itemsToDelete[2]); // undefined

/*
 * SPREAD OPERATOR AND DESTRUCTURING
 * Concepts covered: ... (spread), copying arrays, passing array arguments, destructuring, defaults, rest
 */
console.log("\nSPREAD OPERATOR AND DESTRUCTURING");

const original = [1, 2, 3];
const copy = [...original];
copy.push(4);
console.log(original); // [ 1, 2, 3 ]
console.log(copy); // [ 1, 2, 3, 4 ]

const front = ["HTML", "CSS"];
const back = ["Node.js", "SQL"];
const fullstack = [...front, "JavaScript", ...back];
console.log(fullstack); // [ 'HTML', 'CSS', 'JavaScript', 'Node.js', 'SQL' ]

console.log(Math.min(10, 20, 30)); // 10
console.log(Math.min([10, 20, 30])); // NaN
console.log(Math.min(...[10, 20, 30])); // 10

const coords = [10, 20, 30];
const [x, y] = coords;
console.log(x); // 10
console.log(y); // 20

const [first, , third, fourth = 0] = [100, 200, 300];
console.log(first); // 100
console.log(third); // 300
console.log(fourth); // 0

const [leader, vice, ...others] = ["Ana", "Bruno", "Carlos", "Daniela"];
console.log(leader); // Ana
console.log(vice); // Bruno
console.log(others); // [ 'Carlos', 'Daniela' ]

/*
 * ITERATION
 * Concepts covered: for loop, for...of, for...in pitfalls, entries(), forEach()
 */
console.log("\nITERATION");

const languages = ["JavaScript", "Python", "Java"];

for (let i = 0; i < languages.length; i++) {
  console.log(`${i}: ${languages[i]}`);
}

for (const lang of languages) {
  console.log(lang);
}

const products = [
  { id: 1, name: "Teclado" },
  { id: 2, name: "Mouse" },
];

for (const product of products) {
  console.log(product.name);
}

for (const index in languages) {
  console.log(typeof index, index, languages[index]);
}

for (const [index, lang] of languages.entries()) {
  console.log(index, lang);
}

languages.forEach((lang, index) => {
  console.log(`${index + 1}. ${lang}`);
});

/*
 * OPERATOR IN VS INCLUDES
 * Concepts covered: in operator (checks index/property) vs includes() (checks value)
 */
console.log("\nOPERATOR IN VS INCLUDES");

const list = [1, 2, 3];

console.log(3 in list); // false
console.log(0 in list); // true
console.log(list.includes(3)); // true

const user = { name: "Fulano", address: null };
console.log("name" in user); // true
console.log("age" in user); // false

delete user.name;
console.log("name" in user); // false

/*
 * MUTATOR METHODS
 * Concepts covered: push, pop, unshift, shift, splice, reverse, sort
 */
console.log("\nMUTATOR METHODS");

const stack = [10, 20];

console.log(stack.push(30)); // 3
console.log(stack.unshift(5)); // 4
console.log(stack); // [ 5, 10, 20, 30 ]

console.log(stack.pop()); // 30
console.log(stack.shift()); // 5
console.log(stack); // [ 10, 20 ]

const months = ["Jan", "Mar", "Abr", "Jun"];
const removedMonths = months.splice(1, 0, "Fev");
console.log(months); // [ 'Jan', 'Fev', 'Mar', 'Abr', 'Jun' ]
console.log(removedMonths); // []

months.splice(4, 1, "Maio");
console.log(months); // [ 'Jan', 'Fev', 'Mar', 'Abr', 'Maio' ]

const lettersToReverse = ["a", "b", "c"];
lettersToReverse.reverse();
console.log(lettersToReverse); // [ 'c', 'b', 'a' ]

const unsortedNumbers = [10, 2, 5, 1, 20];
unsortedNumbers.sort();
console.log(unsortedNumbers); // [ 1, 10, 2, 20, 5 ]

unsortedNumbers.sort((a, b) => a - b);
console.log(unsortedNumbers); // [ 1, 2, 5, 10, 20 ]

const accentedNames = ["Érica", "Ana", "Carla", "Álvaro", "Bruno"];
accentedNames.sort((a, b) => a.localeCompare(b));
console.log(accentedNames); // [ 'Álvaro', 'Ana', 'Bruno', 'Carla', 'Érica' ]

/*
 * ACCESSOR AND SEARCH METHODS
 * Concepts covered: includes, indexOf, lastIndexOf, join, template literal interpolation, slice, concat, flat
 */
console.log("\nACCESSOR AND SEARCH METHODS");

const items = ["a", "b", "c", "d", "b"];

console.log(items.includes("c")); // true
console.log(items.includes("z")); // false
console.log(items.indexOf("b")); // 1
console.log(items.lastIndexOf("b")); // 4

const tags = ["web", "javascript", "frontend"];
console.log(tags.join(" - ")); // web - javascript - frontend
console.log(tags.join("")); // webjavascriptfrontend

console.log(`List: ${tags}`); // List: web,javascript,frontend
console.log(`List: ${tags.join(" | ")}`); // List: web | javascript | frontend

const values = [10, 20, 30, 40, 50];
console.log(values.slice(1, 4)); // [ 20, 30, 40 ]
console.log(values.slice(-2)); // [ 40, 50 ]
console.log(values); // [ 10, 20, 30, 40, 50 ]

console.log([1, 2].concat([3, 4])); // [ 1, 2, 3, 4 ]

const nestedArray = [1, [2, [3, 4]]];
console.log(nestedArray.flat()); // [ 1, 2, [ 3, 4 ] ]
console.log(nestedArray.flat(2)); // [ 1, 2, 3, 4 ]

const chainedAccessors = values.slice(1, 4).concat([60]).join(" - ");
console.log(chainedAccessors); // 20 - 30 - 40 - 60

/*
 * FUNCTIONAL PROGRAMMING (HOFS)
 * Concepts covered: forEach vs map, map(parseInt) trap, filter, reduce, some, every, find, findIndex, chaining
 */
console.log("\nFUNCTIONAL PROGRAMMING (HOFS)");

const numberList = [1, 2, 3, 4, 5];

const forEachResult = numberList.forEach((n) => n * 2);
console.log(forEachResult); // undefined

const doubled = numberList.map((n) => n * 2);
console.log(doubled); // [ 2, 4, 6, 8, 10 ]

console.log(["1", "2", "3"].map(parseInt)); // [ 1, NaN, NaN ]
console.log(["1", "2", "3"].map((str) => parseInt(str, 10))); // [ 1, 2, 3 ]

const evens = numberList.filter((n) => n % 2 === 0);
console.log(evens); // [ 2, 4 ]

const odds = numberList.filter((n) => n & 1);
console.log(odds); // [ 1, 3, 5 ]

const sumWithInit = numberList.reduce((acc, current) => acc + current, 0);
console.log(sumWithInit); // 15

const sumWithoutInit = numberList.reduce((acc, current) => acc + current);
console.log(sumWithoutInit); // 15

const users = [
  { id: 1, name: "Alice", age: 25, active: true },
  { id: 2, name: "Bruno", age: 17, active: true },
  { id: 3, name: "Carla", age: 30, active: false },
];

console.log(users.some((u) => !u.active)); // true
console.log(users.every((u) => u.age >= 18)); // false

const firstUnderage = users.find((u) => u.age < 18);
console.log(firstUnderage); // { id: 2, name: 'Bruno', age: 17, active: true }

const carlaIndex = users.findIndex((u) => u.name === "Carla");
console.log(carlaIndex); // 2

const filteredAndMappedSum = numberList
  .filter((n) => n > 2)
  .map((n) => n * 10)
  .reduce((acc, n) => acc + n, 0);
console.log(filteredAndMappedSum); // 120

/*
 * PROTOTYPE EXTENSION AND RANGE
 * Concepts covered: extending Array.prototype, Array.from range generation
 */
console.log("\nPROTOTYPE EXTENSION AND RANGE");

Array.prototype.myMap = function (callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

console.log([1, 2, 3].myMap((n) => n * 3)); // [ 3, 6, 9 ]

const range = Array.from({ length: 5 }, (_, index) => index + 1);
console.log(range); // [ 1, 2, 3, 4, 5 ]
