/*
 * PROMISES AND ASYNC / AWAIT
 */
console.log("PROMISES AND ASYNC / AWAIT");

/*
 * PROMISE STATES AND EXECUTOR
 * Concepts covered: 3 states (pending, fulfilled, rejected), synchronous executor execution, Promise.resolve, Promise.reject
 */
console.log("\nPROMISE STATES AND EXECUTOR");

const pendingPromise = new Promise(() => {});
console.log(pendingPromise); // Promise { <pending> }

const fulfilledPromise = Promise.resolve("Sucesso!");
console.log(fulfilledPromise); // Promise { 'Sucesso!' }

const rejectedPromise = Promise.reject(new Error("Falha ao carregar"));
rejectedPromise.catch(() => {}); // evita aviso de UnhandledPromiseRejection no terminal
console.log(rejectedPromise); // Promise { <rejected> Error: Falha ao carregar }

console.log("1. Antes de criar a Promise");

const promise = new Promise((resolve) => {
  console.log("2. Dentro do executor da Promise (execução SÍNCRONA)");
  resolve("Dados prontos");
});

console.log("3. Depois de criar a Promise");

promise.then((data) => {
  console.log(`4. Dentro do .then() (${data})`);
});

console.log("5. Fim do script principal");

/*
 * CONSUMING PROMISES (.then, .catch, .finally)
 * Concepts covered: .then(), chaining .then(), .catch(), .finally() behavior
 */
console.log("\nCONSUMING PROMISES (.then, .catch, .finally)");

function checkAge(age) {
  return new Promise((resolve, reject) => {
    if (typeof age !== "number" || age < 0) {
      reject(new Error("Idade inválida"));
    } else if (age >= 18) {
      resolve("Acesso permitido");
    } else {
      reject("Acesso negado: menor de idade");
    }
  });
}

checkAge(20)
  .then((message) => {
    console.log("Passo 1:", message);
    return "Token: ABC-123";
  })
  .then((token) => {
    console.log("Passo 2:", token);
  })
  .catch((error) => {
    console.error("Erro:", error.message || error);
  })
  .finally(() => {
    console.log("Operação finalizada (limpeza).");
  });

/*
 * PROMISE COMBINATORS
 * Concepts covered: Promise.all() fast-fail, Promise.allSettled(), Promise.race(), Promise.any()
 */
console.log("\nPROMISE COMBINATORS");

const p1 = Promise.resolve(10);
const p2 = Promise.resolve(20);
const p3 = Promise.resolve(30);

Promise.all([p1, p2, p3]).then((results) => {
  console.log("Promise.all resultados:", results); // [ 10, 20, 30 ]
});

const pFail = Promise.reject("Falha de conexão no serviço B");
pFail.catch(() => {});

Promise.all([p1, pFail, p3])
  .then((res) => console.log(res))
  .catch((err) => console.log("Promise.all rejeitado:", err)); // Falha de conexão no serviço B

const mixedPromises = [
  Promise.resolve("Dados da API A"),
  Promise.reject("Erro 500 na API B"),
  Promise.resolve("Dados da API C"),
];
mixedPromises[1].catch(() => {});

Promise.allSettled(mixedPromises).then((results) => {
  console.log("Promise.allSettled resultados:");
  console.log(results);
});

const slow = new Promise((resolve) => setTimeout(() => resolve("Lento"), 100));
const fastSuccess = Promise.resolve("Rápido");
const fastFail = Promise.reject("Erro Rápido");
fastFail.catch(() => {});

Promise.race([slow, fastSuccess]).then((res) => {
  console.log("Promise.race venceu:", res); // Rápido
});

Promise.any([fastFail, slow, fastSuccess]).then((res) => {
  console.log("Promise.any venceu com primeiro sucesso:", res); // Rápido
});

/*
 * EVENT LOOP AND MICROTASK QUEUE
 * Concepts covered: Event Loop execution order (call stack -> microtask queue -> macrotask queue)
 */
console.log("\nEVENT LOOP AND MICROTASK QUEUE");

setTimeout(() => {
  console.log("Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
  console.log("Microtask 1 (Promise)");
}).then(() => {
  console.log("Microtask 2 (Promise encadeada)");
});

/*
 * ASYNC AND AWAIT
 * Concepts covered: async function implicit promise return, await operator, try/catch/finally
 */
console.log("\nASYNC AND AWAIT");

function fetchNumber() {
  return Promise.resolve(42);
}

async function processData() {
  try {
    console.log("Buscando número...");
    const num = await fetchNumber();
    console.log("Número recebido:", num);
    return num * 2;
  } catch (error) {
    console.error("Erro no processamento:", error);
    throw error;
  } finally {
    console.log("Finalizado o processamento async.");
  }
}

processData().then((result) => console.log("Resultado final async:", result));

/*
 * ASYNC ITERATION AND ARRAYS
 * Concepts covered: for await...of, async reduce, map + Promise.all
 */
console.log("\nASYNC ITERATION AND ARRAYS");

async function runAsyncOperations() {
  const ids = [1, 2, 3];

  const fetchItem = (id) => Promise.resolve(`Item ${id}`);

  const items = await Promise.all(ids.map((id) => fetchItem(id)));
  console.log("Promise.all com map:", items); // [ 'Item 1', 'Item 2', 'Item 3' ]

  const asyncIterable = [Promise.resolve("A"), Promise.resolve("B")];
  for await (const val of asyncIterable) {
    console.log("for await...of:", val);
  }

  const sequentialSum = await ids.reduce(async (accPromise, id) => {
    const acc = await accPromise;
    return acc + id;
  }, Promise.resolve(0));
  console.log("Reduce assíncrono:", sequentialSum); // 6
}

runAsyncOperations();

/*
 * FETCH API AND RESPONSE VALIDATION
 * Concepts covered: fetch API response.ok check requirement (HTTP 404/500 do not reject fetch promise)
 */
console.log("\nFETCH API AND RESPONSE VALIDATION");

async function simulateFetch(url) {
  const mockResponse = {
    ok: url !== "invalid-url",
    status: url === "invalid-url" ? 404 : 200,
    json: async () => ({ user: "luizchaves" }),
  };

  if (!mockResponse.ok) {
    throw new Error(`Erro HTTP: ${mockResponse.status}`);
  }

  return await mockResponse.json();
}

async function getUserData(url) {
  try {
    const data = await simulateFetch(url);
    console.log("Usuário retornado pelo fetch:", data.user);
  } catch (error) {
    console.error("Falha no fetch capturada:", error.message);
  }
}

getUserData("valid-url");
getUserData("invalid-url");
