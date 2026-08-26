/*
 * REGULAR EXPRESSIONS (REGEXP)
 */
console.log("REGULAR EXPRESSIONS (REGEXP)");

/*
 * CREATION AND FLAGS
 * Concepts covered: literal notation, RegExp constructor, escaping backslashes, flags (i, g, m, u, s, y)
 */
console.log("\nCREATION AND FLAGS");

const literalRegex = /javascript/i;
console.log(literalRegex.test("JavaScript")); // true

const term = "javascript";
const constructorRegex = new RegExp(term, "i");
console.log(constructorRegex.test("JAVASCRIPT")); // true

const digitConstructor = new RegExp("\\d{3}");
console.log(digitConstructor.test("123")); // true

const unicodeFlag = /^\p{Letter}+$/u;
console.log(unicodeFlag.test("Café")); // true

const dotAllFlag = /first.second/s;
console.log(dotAllFlag.test("first\nsecond")); // true

const stickyRegex = /foo/y;
stickyRegex.lastIndex = 3;
console.log(stickyRegex.test("xxxfoo")); // true

/*
 * CHARACTER CLASSES AND RANGES
 * Concepts covered: ., \d, \D, \w, \W, \s, \S, sets [...], ranges [a-z], negation [^...]
 */
console.log("\nCHARACTER CLASSES AND RANGES");

const hasDigits = /\d+/;
const hasNoDigits = /\D+/;
const hasWordChars = /\w+/;
const hasWhitespace = /\s/;

console.log(hasDigits.test("Código 123")); // true
console.log(hasNoDigits.test("123")); // false
console.log(hasWordChars.test("code_1")); // true
console.log(hasWhitespace.test("NoSpace")); // false

const hexColor = /^#[0-9a-fA-F]{6}$/;
console.log(hexColor.test("#ff0000")); // true
console.log(hexColor.test("#zzzzzz")); // false

const vowelsOnly = /^[aeiouAEIOU]+$/;
console.log(vowelsOnly.test("aei")); // true
console.log(vowelsOnly.test("abc")); // false

/*
 * ANCHORS AND BOUNDARIES
 * Concepts covered: ^ (start / negation), $ (end), \b (word boundary)
 */
console.log("\nANCHORS AND BOUNDARIES");

const looseCheck = /\d{3}/;
console.log(looseCheck.test("abc123xyz")); // true

const exactCheck = /^\d{3}$/;
console.log(exactCheck.test("abc123xyz")); // false
console.log(exactCheck.test("123")); // true

const wordBoundary = /\bweb\b/i;
console.log(wordBoundary.test("web design")); // true
console.log(wordBoundary.test("website")); // false

/*
 * QUANTIFIERS (GREEDY VS LAZY)
 * Concepts covered: *, +, ?, {n}, {n,m}, greedy vs lazy (*?, +?)
 */
console.log("\nQUANTIFIERS (GREEDY VS LAZY)");

const urlPattern = /^https?:\/\//;
console.log(urlPattern.test("http://ifpb.edu.br")); // true
console.log(urlPattern.test("https://ifpb.edu.br")); // true

const yearPattern = /^\d{4}$/;
console.log(yearPattern.test("2026")); // true
console.log(yearPattern.test("26")); // false

const html = "<div>Primeira tag</div><div>Segunda tag</div>";

const greedyRegex = /<div>.*<\/div>/;
console.log(html.match(greedyRegex)[0]); // <div>Primeira tag</div><div>Segunda tag</div>

const lazyRegex = /<div>.*?<\/div>/;
console.log(html.match(lazyRegex)[0]); // <div>Primeira tag</div>

/*
 * GROUPS, ALTERNATION AND LOOKAHEADS
 * Concepts covered: (...), (?:...), (?<name>...), |, lookaheads (?=...), lookbehinds (?<=...)
 */
console.log("\nGROUPS, ALTERNATION AND LOOKAHEADS");

const domainPattern = /\.(com|org|net|edu\.br)$/i;
console.log(domainPattern.test("ifpb.edu.br")); // true
console.log(domainPattern.test("site.xyz")); // false

const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const dateMatch = "22/08/2026".match(datePattern);
console.log(dateMatch[1]); // 22
console.log(dateMatch[2]); // 08
console.log(dateMatch[3]); // 2026

const namedDatePattern = /^(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})$/;
const namedMatch = "22/08/2026".match(namedDatePattern);
console.log(namedMatch.groups.day); // 22
console.log(namedMatch.groups.month); // 08
console.log(namedMatch.groups.year); // 2026

const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
console.log(passwordPattern.test("Pass1234")); // true
console.log(passwordPattern.test("password")); // false

const priceLookbehind = /(?<=\$)\d+/;
console.log("Preço: $100".match(priceLookbehind)[0]); // 100

/*
 * REGEXP AND STRING METHODS
 * Concepts covered: test(), exec(), match(), matchAll() with /g, search(), replace() with $1 / callbacks, split()
 */
console.log("\nREGEXP AND STRING METHODS");

const pattern = /DW-(\d{4})/;
const sampleText = "Turma DW-2026 de Desenvolvimento Web";

console.log(pattern.test(sampleText)); // true

const execResult = pattern.exec(sampleText);
console.log(execResult[0]); // DW-2026
console.log(execResult[1]); // 2026

const textWithEmails = "ana@gmail.com, bruno@ifpb.edu.br";
const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

console.log(textWithEmails.match(emailPattern)); // [ 'ana@gmail.com', 'bruno@ifpb.edu.br' ]

for (const m of "a1b2".matchAll(/\d/g)) {
  console.log(m[0], m.index);
}

// TypeError: String.prototype.matchAll called with a non-global RegExp argument
// "a1b2".matchAll(/\d/);

const formattedDate = "2026-08-22".replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1");
console.log(formattedDate); // 22/08/2026

const rawCep = "58.000-000";
const cleanCep = rawCep.replace(/\D/g, "");
console.log(cleanCep); // 58000000

const items = "HTML; CSS, JavaScript   Node.js".split(/[\s,;]+/);
console.log(items); // [ 'HTML', 'CSS', 'JavaScript', 'Node.js' ]

/*
 * PRACTICAL VALIDATORS
 * Concepts covered: CPF, CEP, 24h time validation
 */
console.log("\nPRACTICAL VALIDATORS");

const cpfPattern = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
console.log(cpfPattern.test("111.222.333-44")); // true
console.log(cpfPattern.test("11122233344")); // true
console.log(cpfPattern.test("111A22233344")); // false

const time24hPattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
console.log(time24hPattern.test("14:30")); // true
console.log(time24hPattern.test("23:59")); // true
console.log(time24hPattern.test("24:00")); // false
