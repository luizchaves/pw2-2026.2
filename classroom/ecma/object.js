/*
 * OBJECTS
 */
console.log("OBJECTS");

/*
 * CREATION AND STRUCTURE
 * Concepts covered: object literal, constructor, class definition, private fields (#), method shorthand, typeof {}
 */
console.log("\nCREATION AND STRUCTURE");

const student = {
  id: 2026101,
  name: "Fulano de Tal",
  email: "fulano@ifpb.edu.br",
  active: true,
  courses: ["DW", "Redes"],
  getSummary() {
    return `${this.name} (${this.email})`;
  },
};

console.log(student.name); // Fulano de Tal
console.log(student.getSummary()); // Fulano de Tal (fulano@ifpb.edu.br)
console.log(typeof student); // object

const server = new Object();
server.ip = "192.168.0.1";
server.port = 8080;
console.log(server.ip); // 192.168.0.1

class User {
  #password;

  constructor(username, password) {
    this.username = username;
    this.#password = password;
  }

  checkPassword(pwd) {
    return this.#password === pwd;
  }
}

const userObj = new User("admin", "123456");
console.log(userObj.username); // admin
console.log(userObj.password); // undefined
console.log(userObj.checkPassword("123456")); // true

// SyntaxError: Private field '#password' must be declared in an enclosing class
// console.log(userObj.#password);

/*
 * PROPERTY SHORTHAND AND COMPUTED KEYS
 * Concepts covered: property shorthand, computed property names [key]
 */
console.log("\nPROPERTY SHORTHAND AND COMPUTED KEYS");

const name = "Alice";
const email = "alice@gmail.com";
const role = "admin";

const userShorthand = { name, email, role };
console.log(userShorthand); // { name: 'Alice', email: 'alice@gmail.com', role: 'admin' }

const dynamicKey = "interest";
const dynamicObject = {
  key: "100% Selic",
  [dynamicKey]: "100% Selic + IPCA",
};

console.log(dynamicObject.key); // 100% Selic
console.log(dynamicObject.interest); // 100% Selic + IPCA

/*
 * ACCESS, MODIFICATION AND REMOVAL
 * Concepts covered: dot notation vs bracket notation, adding/updating properties, delete operator, in vs Object.hasOwn()
 */
console.log("\nACCESS, MODIFICATION AND REMOVAL");

const host = {
  hostname: "web-server-01",
  ip: "192.168.1.10",
  "content-type": "application/json",
  200: "OK",
};

console.log(host.hostname); // web-server-01
console.log(host["content-type"]); // application/json
console.log(host[200]); // OK

const targetKey = "ip";
console.log(host[targetKey]); // 192.168.1.10

const config = {
  theme: "dark",
  timeout: 5000,
};

config.retries = 3;
config.timeout = 10000;
console.log(config); // { theme: 'dark', timeout: 10000, retries: 3 }

delete config.retries;
console.log(config); // { theme: 'dark', timeout: 10000 }
console.log(config.retries); // undefined

console.log("theme" in config); // true
console.log("retries" in config); // false
console.log(Object.hasOwn(config, "theme")); // true
console.log(Object.hasOwn(config, "retries")); // false

/*
 * MUTABILITY AND CONST
 * Concepts covered: const object mutation vs reassignment error, Object.freeze()
 */
console.log("\nMUTABILITY AND CONST");

const mutableServer = { port: 8080 };
mutableServer.port = 9090;
console.log(mutableServer.port); // 9090

// TypeError: Assignment to constant variable.
// mutableServer = { port: 3000 };

const frozenConfig = Object.freeze({
  apiUrl: "https://api.devlab.org",
  version: "v1",
});

frozenConfig.version = "v2";
frozenConfig.timeout = 5000;
console.log(frozenConfig); // { apiUrl: 'https://api.devlab.org', version: 'v1' }

/*
 * DESTRUCTURING AND RENAMING
 * Concepts covered: object destructuring, default values, renaming variables, parameter destructuring
 */
console.log("\nDESTRUCTURING AND RENAMING");

const person = {
  firstName: "Maria",
  lastName: "Silva",
  age: 30,
  city: "João Pessoa",
};

const { firstName, age } = person;
console.log(firstName); // Maria
console.log(age); // 30

const { city: location } = person;
console.log(location); // João Pessoa

const { userRole = "visitante" } = person;
console.log(userRole); // visitante

function displayServerInfo({ hostname, ip, port = 80 }) {
  return `${hostname} -> ${ip}:${port}`;
}

console.log(displayServerInfo({ hostname: "api", ip: "10.0.0.1", port: 3000 })); // api -> 10.0.0.1:3000

/*
 * SPREAD OPERATOR AND CLONING
 * Concepts covered: reference copy vs shallow clone, merging objects, property order in spread
 */
console.log("\nSPREAD OPERATOR AND CLONING");

const baseConfig = { env: "development", debug: true, port: 3000 };

const refCopy = baseConfig;
refCopy.port = 4000;
console.log(baseConfig.port); // 4000

const shallowClone = { ...baseConfig, env: "production", port: 8080 };
shallowClone.port = 9000;
console.log(baseConfig.port); // 4000
console.log(shallowClone.port); // 9000
console.log(shallowClone); // { env: 'production', debug: true, port: 9000 }

const nestedOriginal = { a: 1, info: { tag: "test" } };
const nestedClone = { ...nestedOriginal };
nestedClone.info.tag = "modified";
console.log(nestedOriginal.info.tag); // modified

/*
 * ITERATION
 * Concepts covered: for...in vs for...of, Object.keys(), Object.values(), Object.entries()
 */
console.log("\nITERATION");

const scores = { Alice: 95, Bruno: 80, Carla: 90 };

for (const key in scores) {
  console.log(key, scores[key]);
}

console.log(Object.keys(scores)); // [ 'Alice', 'Bruno', 'Carla' ]
console.log(Object.values(scores)); // [ 95, 80, 90 ]
console.log(Object.entries(scores)); // [ [ 'Alice', 95 ], [ 'Bruno', 80 ], [ 'Carla', 90 ] ]

for (const [studentName, score] of Object.entries(scores)) {
  console.log(`${studentName}: ${score}`);
}

const studentList = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Beto" },
];

for (const s of studentList) {
  console.log(s.name);
}
