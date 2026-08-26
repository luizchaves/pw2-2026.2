/*
 * JSON (JAVASCRIPT OBJECT NOTATION)
 */
console.log("JSON (JAVASCRIPT OBJECT NOTATION)");

/*
 * JSON FORMAT RULES
 * Concepts covered: JSON format restrictions, double quotes requirement, valid data types
 */
console.log("\nJSON FORMAT RULES");

const validJsonText = `{
  "id": 101,
  "name": "Servidor Principal",
  "active": true,
  "tags": ["web", "production"],
  "specs": { "cpu": 4, "ram": "16GB" }
}`;

console.log(typeof validJsonText); // string

/*
 * SERIALIZATION (JSON.stringify)
 * Concepts covered: JSON.stringify(), space/indentation, replacer argument
 */
console.log("\nSERIALIZATION (JSON.stringify)");

const userObject = {
  id: 1,
  name: "Carlos",
  email: "carlos@gmail.com",
};

const jsonString = JSON.stringify(userObject);
console.log(typeof jsonString); // string
console.log(jsonString); // {"id":1,"name":"Carlos","email":"carlos@gmail.com"}

const prettyJson = JSON.stringify(userObject, null, 2);
console.log(prettyJson);

const filteredJson = JSON.stringify(userObject, ["name", "email"]);
console.log(filteredJson); // {"name":"Carlos","email":"carlos@gmail.com"}

const replacerJson = JSON.stringify(userObject, (key, value) => {
  if (key === "email") {
    return undefined;
  }
  return value;
});
console.log(replacerJson); // {"id":1,"name":"Carlos"}

/*
 * OMITTED VALUES IN STRINGIFY
 * Concepts covered: values lost during stringify (undefined, function, Symbol)
 */
console.log("\nOMITTED VALUES IN STRINGIFY");

const complexObj = {
  name: "Fulano",
  age: 25,
  password: undefined,
  getSummary() {
    return this.name;
  },
  sym: Symbol("id"),
};

console.log(JSON.stringify(complexObj)); // {"name":"Fulano","age":25}

/*
 * DESERIALIZATION (JSON.parse)
 * Concepts covered: JSON.parse(), accessing property on unparsed string returns undefined, reviver function
 */
console.log("\nDESERIALIZATION (JSON.parse)");

const rawJson = '{"name":"Tesouro Selic","value":17476,"date":"2026-08-12T00:00:00.000Z"}';

console.log(rawJson.name); // undefined

const parsedObject = JSON.parse(rawJson);
console.log(typeof parsedObject); // object
console.log(parsedObject.name); // Tesouro Selic

const revivedObject = JSON.parse(rawJson, (key, value) => {
  if (key === "date") {
    return new Date(value);
  }
  return value;
});

console.log(revivedObject.date instanceof Date); // true
console.log(revivedObject.date.toISOString()); // 2026-08-12T00:00:00.000Z

/*
 * DEEP CLONING AND STRUCTURED CLONE
 * Concepts covered: JSON deep clone limitations vs structuredClone()
 */
console.log("\nDEEP CLONING AND STRUCTURED CLONE");

const originalNested = { a: 1, b: { c: 2 } };

const jsonDeepCopy = JSON.parse(JSON.stringify(originalNested));
jsonDeepCopy.b.c = 99;
console.log(originalNested.b.c); // 2
console.log(jsonDeepCopy.b.c); // 99

const nativeDeepCopy = structuredClone(originalNested);
nativeDeepCopy.b.c = 500;
console.log(originalNested.b.c); // 2
console.log(nativeDeepCopy.b.c); // 500
