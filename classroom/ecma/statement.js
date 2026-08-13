/*
 * STATEMENTS
 */
console.log("STATEMENTS");

/*
 * IF STATEMENT: if, else
 */
console.log("\nIF STATEMENT");

const positiveNumber = 10;

if (positiveNumber > 0) {
  console.log("Positive number"); // Positive number
}

const negativeNumber = -5;

if (negativeNumber > 0)
  console.log("Positive number");
console.log("End of verification"); // End of verification

let value = 0;

if (value = 10) {
  console.log("Entered", value); // Entered 10
}

const list = [];

if (list) {
  console.log("Empty array is truthy"); // Empty array is truthy
}

if (list.length) {
  console.log("Array has items");
} else {
  console.log("Array has no items"); // Array has no items
}

/*
 * IF ELSE STATEMENT: if, else, else if
 */
console.log("\nIF ELSE STATEMENT");

const number = 0;

if (number > 0) {
  console.log("Positive number");
} else {
  console.log("Non-positive number"); // Non-positive number
}

if (number > 0) {
  console.log("Positive number");
} else if (number < 0) {
  console.log("Negative number");
} else {
  console.log("Zero"); // Zero
}

const grade = 95;

if (grade >= 60) {
  console.log("Approved"); // Approved
} else if (grade >= 90) {
  console.log("Approved with distinction");
} else {
  console.log("Failed");
}

if (grade >= 90) {
  console.log("Approved with distinction"); // Approved with distinction
} else if (grade >= 60) {
  console.log("Approved");
} else {
  console.log("Failed");
}

if (grade >= 60) console.log("Approved"); // Approved
if (grade >= 90) console.log("Approved with distinction"); // Approved with distinction

/*
 * SWITCH STATEMENT: switch, case, break, default
 * Comparison used by switch: strict equality (===)
 */
console.log("\nSWITCH STATEMENT");

const number1 = 10;
const number2 = 20;
const operator = "+";
let result;

switch (operator) {
  case "+":
    result = number1 + number2;
    break;
  case "-":
    result = number1 - number2;
    break;
  case "*":
    result = number1 * number2;
    break;
  case "/":
    result = number1 / number2;
    break;
  default:
    result = "Invalid operator";
}

console.log(result); // 30

const option = "1";

switch (option) {
  case 1:
    console.log("number one");
    break;
  case "1":
    console.log("string one"); // string one
    break;
  default:
    console.log("none");
}

/*
 * SWITCH FALL THROUGH: switch, case, break, default
 * Comparison used by switch: strict equality (===)
 */
console.log("\nSWITCH FALL THROUGH");

const selectedOperator = "-";

switch (selectedOperator) {
  case "+":
    console.log("addition");
  case "-":
    console.log("subtraction"); // subtraction
  case "*":
    console.log("multiplication"); // multiplication
    break;
  default:
    console.log("invalid");
}

switch (selectedOperator) {
  case "+":
  case "-":
    console.log("additive operator"); // additive operator
    break;
  case "*":
  case "/":
    console.log("multiplicative operator");
    break;
  default:
    console.log("invalid");
}

/*
 * SWITCH TRUE: switch, case, break, default
 */
console.log("\nSWITCH TRUE");

switch (true) {
  case positiveNumber > 0:
    console.log("Positive number"); // Positive number
    break;
  case positiveNumber < 0:
    console.log("Negative number");
    break;
  default:
    console.log("Zero");
}

/*
 * WHILE STATEMENT: while
 */
console.log("\nWHILE STATEMENT");

let count = 1;

while (count <= 5) {
  console.log(count); // 1, 2, 3, 4, 5
  count++;
}

count = 10;

while (count < 10) {
  console.log(count);
  count++;
}

/*
 * DO WHILE STATEMENT: do...while
 */
console.log("\nDO WHILE STATEMENT");

count = 10;

do {
  console.log(count); // 10
  count++;
} while (count < 10);

count = 1;

do {
  console.log(count); // 1, 2, 3, 4, 5
  count++;
} while (count <= 5);

/*
 * FOR STATEMENT: for
 */
console.log("\nFOR STATEMENT");

let total = 0;

for (let i = 1; i <= 10; i++) {
  total += i;
}

console.log(total); // 55

for (let i = 1; i <= 5; i++) {
  console.log(i); // 1, 2, 3, 4, 5
}

for (let i = 1; i < 6; i++) {
  console.log(i); // 1, 2, 3, 4, 5
}

/*
 * BREAK AND CONTINUE: break, continue
 */
console.log("\nBREAK AND CONTINUE");

for (let i = 1; i <= 5; i++) {
  if (i === 3) continue;
  if (i === 5) break;

  console.log(i); // 1, 2, 4
}

/*
 * NESTED LOOPS: for
 */
console.log("\nNESTED LOOPS");

let output = "";

for (let ten = 0; ten <= 2; ten++) {
  for (let unit = 0; unit <= 2; unit++) {
    output += `${ten}${unit} `;
  }
}

console.log(output.trim()); // 00 01 02 10 11 12 20 21 22

/*
 * LABELED STATEMENT: label, break, continue
 */
console.log("\nLABELED STATEMENT");

outerBreak:
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    if (j === 2) break outerBreak;

    console.log(i, j); // 1 1
  }
}

outerContinue:
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    if (j === 2) continue outerContinue;

    console.log(i, j); // 1 1, 2 1, 3 1
  }
}

/*
 * NUMBER SERIES: for, if, else
 */
console.log("\nNUMBER SERIES");

let numbers = "";

for (let ten = 0; ten < 10; ten++) {
  for (let unit = 0; unit < 10; unit++) {
    numbers += `${ten}${unit}`;

    if (unit === 9 && ten !== 9) {
      numbers += ",\n";
    } else if (unit !== 9) {
      numbers += ", ";
    }
  }
}

console.log(numbers);

numbers = "";

for (let ten = 9; ten >= 0; ten--) {
  for (let unit = 9; unit >= 0; unit--) {
    numbers += `${ten}${unit}`;

    if (unit === 0 && ten !== 0) {
      numbers += ",\n";
    } else if (unit !== 0) {
      numbers += ", ";
    }
  }
}

console.log(numbers);
