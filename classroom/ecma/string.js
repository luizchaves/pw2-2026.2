/*
 * STRINGS
 */
console.log("STRINGS");

/*
 * CREATION AND LITERALS
 * Concepts covered: single quotes, double quotes, template literals, String() function, new String() wrapper object pitfalls, String.raw
 */
console.log("\nCREATION AND LITERALS");

const single = 'Desenvolvimento Web';
const double = "Curso de Redes de Computadores";
const template = `Tecnologia em Redes`;

console.log(single); // Desenvolvimento Web
console.log(double); // Curso de Redes de Computadores
console.log(template); // Tecnologia em Redes

const converted = String(42);
console.log(converted); // 42
console.log(typeof converted); // string

const prim = "DevLab";
const obj = new String("DevLab");

console.log(typeof prim); // string
console.log(typeof obj); // object
console.log(prim === obj); // false

const rawPath = String.raw`C:\projetos\devlab\nscript.js`;
console.log(rawPath); // C:\projetos\devlab\nscript.js

/*
 * ESCAPE SEQUENCES AND UNICODE
 * Concepts covered: \', \", \\, \n, \t, \uXXXX, length, charCodeAt, codePointAt, String.fromCharCode, String.fromCodePoint, normalize
 */
console.log("\nESCAPE SEQUENCES AND UNICODE");

const quote = "O professor disse: \"Pratiquem JavaScript!\"";
const singleQuoteInString = 'D\'água';
const path = "C:\\projetos\\devlab\\script.js";
const multiline = "Primeira linha\nSegunda linha";
const tabbed = "Item:\tValor";
const heart = "Eu \u2661 JavaScript!";

console.log(quote); // O professor disse: "Pratiquem JavaScript!"
console.log(singleQuoteInString); // D'água
console.log(path); // C:\projetos\devlab\script.js
console.log(multiline); // Primeira linha \n Segunda linha
console.log(tabbed); // Item:	Valor
console.log(heart); // Eu ♡ JavaScript!

console.log("café".length); // 4
console.log("♡".length); // 1
console.log("👍".length); // 2

console.log("A".charCodeAt(0)); // 65
console.log("Z".charCodeAt(0)); // 90
console.log("a".charCodeAt(0)); // 97
console.log("Á".charCodeAt(0)); // 193

console.log("👍".charCodeAt(0)); // 55357 (primeira metade do par substituto)
console.log("👍".codePointAt(0)); // 128077 (ponto de código Unicode completo)

console.log(String.fromCharCode(65, 66, 67)); // ABC
console.log(String.fromCodePoint(0x1f44d)); // 👍

const decomposed = "café".normalize("NFD");
console.log(decomposed.length); // 5 (c-a-f-e + acento combinante)
console.log(decomposed.normalize("NFC").length); // 4

/*
 * IMMUTABILITY AND ACCESS
 * Concepts covered: bracket notation, .at(), charAt(), out-of-bounds behavior, string immutability
 */
console.log("\nIMMUTABILITY AND ACCESS");

let language = "JavaScript";

console.log(language.length); // 10
console.log(language[0]); // J
console.log(language[4]); // S
console.log(language[9]); // t
console.log(language[10]); // undefined

console.log(language.at(0)); // J
console.log(language.at(-1)); // t
console.log(language.at(-2)); // p
console.log(language[-1]); // undefined

console.log(language.charAt(0)); // J
console.log(language.charAt(99)); // "" (string vazia, diferentemente de undefined no [] e at())

language[0] = "Y";
console.log(language); // JavaScript

language = "Y" + language.slice(1);
console.log(language); // YavaScript

/*
 * CONCATENATION AND TEMPLATE LITERALS
 * Concepts covered: + operator, evaluation order, coercion, concat(), interpolation ${}, multiline template literals
 */
console.log("\nCONCATENATION AND TEMPLATE LITERALS");

const firstName = "Luiz";
const lastName = "Chaves";
const fullName = firstName + " " + lastName;

console.log(fullName); // Luiz Chaves
console.log("Aula " + 5); // Aula 5

console.log(2 + 3 + "4"); // 54
console.log("2" + 3 + 4); // 234

console.log("Hello".concat(" ", "World")); // Hello World

const user = "Alice";
const role = "Desenvolvedora";
const age = 28;

const greeting = `Usuário ${user} (${role}) tem ${age} anos. Próximo ano terá ${age + 1}.`;
console.log(greeting); // Usuário Alice (Desenvolvedora) tem 28 anos. Próximo ano terá 29.

const cardHtml = `
<div class="user-card">
  <h2>${user}</h2>
  <p>Cargo: ${role}</p>
</div>
`;
console.log(cardHtml);

/*
 * SEARCH AND INSPECTION
 * Concepts covered: includes, startsWith, endsWith, indexOf, lastIndexOf, search() with regex, localeCompare()
 */
console.log("\nSEARCH AND INSPECTION");

const filename = "relatorio-financeiro-2026.pdf";

console.log(filename.includes("financeiro")); // true
console.log(filename.startsWith("relatorio")); // true
console.log(filename.endsWith(".pdf")); // true

const phrase = "A linguagem JavaScript é a linguagem da Web";
console.log(phrase.indexOf("linguagem")); // 2
console.log(phrase.lastIndexOf("linguagem")); // 27
console.log(phrase.indexOf("Python")); // -1

console.log(phrase.search(/JavaScript/)); // 12
console.log(phrase.search(/Python/)); // -1

const email1 = "USER@domain.com";
const email2 = "user@domain.com";
console.log(email1 === email2); // false
console.log(email1.toLowerCase() === email2.toLowerCase()); // true

console.log("a".localeCompare("b", "pt-BR")); // -1
console.log("b".localeCompare("a", "pt-BR")); // 1
console.log("a".localeCompare("a", "pt-BR")); // 0
console.log("Álvaro".localeCompare("Ana", "pt-BR")); // -1

/*
 * REGULAR EXPRESSION MATCHING
 * Concepts covered: match(), matchAll() requirement for /g flag
 */
console.log("\nREGULAR EXPRESSION MATCHING");

const codeText = "a1b2c3";

console.log(codeText.match(/\d/)); // [ '1', index: 1, input: 'a1b2c3', groups: undefined ]
console.log(codeText.match(/\d/g)); // [ '1', '2', '3' ]

for (const match of codeText.matchAll(/\d/g)) {
  console.log(match[0], match.index);
}

// TypeError: String.prototype.matchAll called with a non-global RegExp argument
// codeText.matchAll(/\d/);

/*
 * EXTRACTION AND SLICING
 * Concepts covered: slice vs substring, negative indices, split (string, regex, limit), spread array slicing for emojis
 */
console.log("\nEXTRACTION AND SLICING");

const email = "usuario@redes.ifpb.edu.br";
const atIndex = email.indexOf("@");

const username = email.slice(0, atIndex);
const domain = email.slice(atIndex + 1);
console.log(username); // usuario
console.log(domain); // redes.ifpb.edu.br

const text = "JavaScript";
console.log(text.slice(-6, -2)); // Scri
console.log(text.substring(-6, 4)); // Java

const parts = email.split("@");
console.log(parts); // [ 'usuario', 'redes.ifpb.edu.br' ]

const csvItems = "HTML,CSS;JavaScript:Node.js";
console.log(csvItems.split(/[,;:]/)); // [ 'HTML', 'CSS', 'JavaScript', 'Node.js' ]
console.log(csvItems.split(/[,;:]/, 2)); // [ 'HTML', 'CSS' ]

console.log("a👍b".slice(0, 2)); // a\ud83d (metade do par substituto de emoji)
console.log([... "a👍b"].slice(0, 2).join("")); // a👍

/*
 * TRANSFORMATION AND FORMATTING
 * Concepts covered: toUpperCase, toLowerCase, trim, trimStart, trimEnd, padStart, padEnd, repeat, replace, replaceAll
 */
console.log("\nTRANSFORMATION AND FORMATTING");

const rawInput = "  contato@EMPRESA.com  \n";
const cleanEmail = rawInput.trim().toLowerCase();
console.log(cleanEmail); // contato@empresa.com

console.log("  test".trimStart()); // test
console.log("test  ".trimEnd()); // test

const code = "42";
console.log(code.padStart(6, "0")); // 000042
console.log(code.padEnd(6, "*")); // 42****

console.log("Olá! ".repeat(3)); // Olá! Olá! Olá!

const sentence = "O gato subiu no telhado. O gato é esperto.";
console.log(sentence.replace("gato", "cachorro")); // O cachorro subiu no telhado. O gato é esperto.
console.log(sentence.replaceAll("gato", "cachorro")); // O cachorro subiu no telhado. O cachorro é esperto.
console.log(sentence.replace(/gato/g, "cachorro")); // O cachorro subiu no telhado. O cachorro é esperto.
