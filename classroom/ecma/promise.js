/*
 * PROMISES AND ASYNC / AWAIT
 *
 * Execute com: node promise.js (Node 22+, pois o arquivo usa await no topo)
 *
 * Leia o terminal de cima para baixo: cada seção espera a anterior terminar
 * (usamos `await` no nível do módulo), então a saída segue a ordem do arquivo.
 */
console.log("PROMISES AND ASYNC / AWAIT");

/*
 * SETUP: A "API" DE COTAÇÕES USADA EM TODO O ARQUIVO
 * Concepts covered: promisify setTimeout, one example reused in every section
 */

// `delay` embrulha o setTimeout (callback) em uma Promise, ficando "await-ável"
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Preços fixos só para simular uma consulta lenta (rede, banco, arquivo...)
const prices = { PETR4: 38.5, VALE3: 61.2, ITUB4: 32.75 };

// getPrice é a função que vamos consumir de várias formas ao longo do arquivo:
// demora `ms` para responder, resolve com a cotação ou rejeita com um Error
function getPrice(symbol, ms = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (symbol in prices) {
        resolve({ symbol, price: prices[symbol] });
      } else {
        reject(new Error(`Ativo não encontrado: ${symbol}`));
      }
    }, ms);
  });
}

/*
 * THE PROBLEM: CALLBACKS
 * Concepts covered: callback style, error-first callback, callback hell (nesting)
 */
console.log("\nTHE PROBLEM: CALLBACKS");

// Antes das Promises, o resultado chegava por uma função de callback.
// Convenção error-first: o primeiro parâmetro é o erro (null quando deu certo).
function getPriceCallback(symbol, callback) {
  setTimeout(() => {
    if (symbol in prices) {
      callback(null, { symbol, price: prices[symbol] });
    } else {
      callback(new Error(`Ativo não encontrado: ${symbol}`));
    }
  }, 50);
}

// Cada passo que depende do anterior adiciona um nível de indentação
// e repete o tratamento de erro: é o famoso "callback hell".
getPriceCallback("PETR4", (error, petr4) => {
  if (error) {
    console.error(error.message);
    return;
  }
  getPriceCallback("VALE3", (error, vale3) => {
    if (error) {
      console.error(error.message);
      return;
    }
    console.log("Callbacks aninhados, total:", petr4.price + vale3.price); // 99.7
  });
});

await delay(200); // espera a demonstração acima terminar antes da próxima seção

/*
 * PROMISE STATES
 * Concepts covered: 3 states (pending, fulfilled, rejected), Promise.resolve, Promise.reject
 */
console.log("\nPROMISE STATES");

// Uma Promise é um objeto que representa um valor que ainda não chegou.
// Ela nasce pending e muda UMA única vez: para fulfilled ou para rejected.

const pendingPromise = new Promise(() => {}); // nunca resolve nem rejeita
console.log(pendingPromise); // Promise { <pending> }

const fulfilledPromise = Promise.resolve("Sucesso!"); // atalho para já resolvida
console.log(fulfilledPromise); // Promise { 'Sucesso!' }

const rejectedPromise = Promise.reject(new Error("Falha ao carregar"));
rejectedPromise.catch(() => {}); // toda rejeição precisa de um catch, senão o Node derruba o processo
console.log(rejectedPromise); // Promise { <rejected> Error: Falha ao carregar }

// O valor NÃO está disponível no console.log: ele chega depois, no .then()
const quotePromise = getPrice("PETR4");
console.log(quotePromise); // Promise { <pending> }
console.log(await quotePromise); // { symbol: 'PETR4', price: 38.5 }

/*
 * THE EXECUTOR RUNS SYNCHRONOUSLY
 * Concepts covered: executor body is synchronous, .then() callback is always async
 */
console.log("\nTHE EXECUTOR RUNS SYNCHRONOUSLY");

// O corpo do `new Promise(...)` roda na hora (síncrono).
// Só o callback do .then() é agendado para depois do script atual.
console.log("1. Antes de criar a Promise");

const promise = new Promise((resolve) => {
  console.log("2. Dentro do executor (SÍNCRONO)");
  resolve("Dados prontos");
});

console.log("3. Depois de criar a Promise");

promise.then((data) => {
  console.log(`4. Dentro do .then() (${data})`);
});

console.log("5. Fim do bloco síncrono");

await promise; // garante que o passo 4 apareça antes da próxima seção

/*
 * CONSUMING PROMISES (.then, .catch, .finally)
 * Concepts covered: .then(), chaining, returning values vs promises, single .catch(), .finally()
 */
console.log("\nCONSUMING PROMISES (.then, .catch, .finally)");

// Encadeamento: cada .then() recebe o que o anterior retornou.
// Retornar uma Promise faz o próximo .then() esperar por ela.
await getPrice("PETR4")
  .then((quote) => {
    console.log("Passo 1, cotação:", quote.price); // 38.5
    return quote.price * 100; // valor comum -> vira o argumento do próximo .then()
  })
  .then((total) => {
    console.log("Passo 2, 100 ações custam:", total); // 3850
    return getPrice("VALE3"); // Promise -> o próximo .then() espera ela resolver
  })
  .then((quote) => {
    console.log("Passo 3, outra cotação:", quote.price); // 61.2
  })
  .catch((error) => {
    // Um único catch no fim cobre QUALQUER passo que falhar acima
    console.error("Erro na cadeia:", error.message);
  })
  .finally(() => {
    // Roda sempre, com sucesso ou com erro (ideal para esconder um loading)
    console.log("Cadeia finalizada (limpeza).");
  });

// Agora a mesma cadeia falhando no primeiro passo: os .then() são pulados
await getPrice("XXXX")
  .then((quote) => {
    console.log("Nunca chega aqui:", quote.price);
    return quote.price * 100;
  })
  .catch((error) => {
    console.error("Erro na cadeia:", error.message); // Ativo não encontrado: XXXX
  })
  .finally(() => {
    console.log("Cadeia finalizada (limpeza).");
  });

/*
 * ASYNC AND AWAIT
 * Concepts covered: async returns a promise, await unwraps it, throw == reject, try/catch/finally
 */
console.log("\nASYNC AND AWAIT");

// async/await é a MESMA Promise, escrita como código sequencial.
// Compare esta função com a cadeia de .then() da seção anterior.
async function buyReport(symbol, amount) {
  try {
    const quote = await getPrice(symbol); // await "desembrulha" a Promise
    const total = quote.price * amount;
    console.log(`${amount} x ${symbol} =`, total.toFixed(2));
    return total; // função async SEMPRE devolve uma Promise
  } catch (error) {
    // catch pega tanto um reject quanto um throw de dentro da função
    console.error("Erro no relatório:", error.message);
    return 0;
  } finally {
    console.log("Relatório finalizado.");
  }
}

const total = await buyReport("PETR4", 100); // 100 x PETR4 = 3850.00
console.log("Retorno da função async:", total); // 3850
console.log(buyReport("VALE3", 10)); // Promise { <pending> } (sem await, é só a Promise)
await delay(150);

await buyReport("XXXX", 10); // Erro no relatório: Ativo não encontrado: XXXX

// Dentro de uma função async, `throw` é equivalente a `Promise.reject`
async function validateAmount(amount) {
  if (amount <= 0) {
    throw new Error("Quantidade deve ser positiva");
  }
  return amount;
}

await validateAmount(-5).catch((error) => console.error(error.message)); // Quantidade deve ser positiva

/*
 * EVENT LOOP AND MICROTASK QUEUE
 * Concepts covered: call stack -> microtask queue (promises) -> macrotask queue (timers)
 */
console.log("\nEVENT LOOP AND MICROTASK QUEUE");

// Ordem de execução: primeiro todo o código síncrono,
// depois TODAS as microtasks (promises), e só então as macrotasks (setTimeout).
setTimeout(() => {
  console.log("4. Macrotask (setTimeout 0ms)");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("2. Microtask (Promise)");
  })
  .then(() => {
    console.log("3. Microtask (Promise encadeada)");
  });

console.log("1. Código síncrono");

await delay(10); // deixa a fila esvaziar antes da próxima seção

/*
 * SEQUENTIAL VS PARALLEL
 * Concepts covered: await inside a loop (serial) vs Promise.all (concurrent)
 */
console.log("\nSEQUENTIAL VS PARALLEL");

const symbols = ["PETR4", "VALE3", "ITUB4"];

// Cada await espera o anterior: 3 requisições de 100ms = ~300ms
let start = Date.now();
const sequential = [];
for (const symbol of symbols) {
  const quote = await getPrice(symbol);
  sequential.push(quote.price);
}
console.log("Sequencial:", sequential, `~${Date.now() - start}ms`); // ~300ms

// Dispara as 3 ao mesmo tempo e espera a mais lenta: ~100ms
start = Date.now();
const quotes = await Promise.all(symbols.map((symbol) => getPrice(symbol)));
console.log(
  "Paralelo:",
  quotes.map((quote) => quote.price),
  `~${Date.now() - start}ms`
); // ~100ms

/*
 * PROMISE COMBINATORS
 * Concepts covered: Promise.all fail-fast, allSettled, race, any
 */
console.log("\nPROMISE COMBINATORS");

// all: resolve com TODOS os valores, na ordem do array;
// se UMA rejeitar, a combinação rejeita imediatamente (fail-fast)
console.log(await Promise.all([getPrice("PETR4"), getPrice("VALE3")]));

await Promise.all([getPrice("PETR4"), getPrice("XXXX"), getPrice("VALE3")])
  .then((results) => console.log(results))
  .catch((error) => console.error("all rejeitou:", error.message)); // Ativo não encontrado: XXXX

// allSettled: NUNCA rejeita; devolve o status de cada uma (ideal para relatórios)
const settled = await Promise.allSettled([getPrice("PETR4"), getPrice("XXXX")]);
console.log(settled);
// [
//   { status: 'fulfilled', value: { symbol: 'PETR4', price: 38.5 } },
//   { status: 'rejected', reason: Error: Ativo não encontrado: XXXX }
// ]

for (const result of settled) {
  if (result.status === "fulfilled") {
    console.log("OK:", result.value.symbol);
  } else {
    console.log("FALHOU:", result.reason.message);
  }
}

// race: vence a PRIMEIRA que terminar, mesmo que seja uma rejeição.
// Uso clássico: timeout para uma operação lenta.
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(`Timeout de ${ms}ms`)), ms);
  });
}

console.log(await Promise.race([getPrice("PETR4", 100), timeout(300)]));
// { symbol: 'PETR4', price: 38.5 }

await Promise.race([getPrice("PETR4", 500), timeout(100)]).catch((error) =>
  console.error("race rejeitou:", error.message)
); // Timeout de 100ms

// any: vence o primeiro SUCESSO; ignora as rejeições pelo caminho
console.log(await Promise.any([getPrice("XXXX", 10), getPrice("VALE3", 100)]));
// { symbol: 'VALE3', price: 61.2 }

// Se todas rejeitarem, any lança um AggregateError com a lista de erros
await Promise.any([getPrice("XXXX"), getPrice("YYYY")]).catch((error) => {
  console.error("any rejeitou:", error.constructor.name); // AggregateError
  console.error(error.errors.map((e) => e.message)); // [ 'Ativo não encontrado: XXXX', ... ]
});

/*
 * ASYNC WITH ARRAY METHODS
 * Concepts covered: map + Promise.all, async filter, sequential reduce, for await...of
 */
console.log("\nASYNC WITH ARRAY METHODS");

// map: o callback async devolve Promises, então o array precisa de Promise.all
const pricesList = await Promise.all(
  symbols.map(async (symbol) => {
    const quote = await getPrice(symbol);
    return quote.price;
  })
);
console.log("map + Promise.all:", pricesList); // [ 38.5, 61.2, 32.75 ]

// filter NÃO espera Promises (toda Promise é truthy!).
// A solução é mapear para os dados e filtrar depois, de forma síncrona.
const allQuotes = await Promise.all(symbols.map((symbol) => getPrice(symbol)));
const cheap = allQuotes.filter((quote) => quote.price < 40);
console.log(
  "filter depois do await:",
  cheap.map((quote) => quote.symbol)
); // [ 'PETR4', 'ITUB4' ]

// reduce assíncrono: o acumulador é uma Promise, então cada passo faz await nele
const portfolio = await symbols.reduce(async (accPromise, symbol) => {
  const acc = await accPromise;
  const quote = await getPrice(symbol);
  return acc + quote.price;
}, Promise.resolve(0));
console.log("reduce assíncrono:", portfolio.toFixed(2)); // 132.45

// for await...of: itera sobre um array de Promises já disparadas,
// aguardando cada uma na ordem
for await (const quote of symbols.map((symbol) => getPrice(symbol))) {
  console.log("for await...of:", quote.symbol, quote.price);
}

/*
 * COMMON PITFALLS
 * Concepts covered: forEach + async, missing await, unhandled rejection
 */
console.log("\nCOMMON PITFALLS");

// 1) forEach ignora o retorno do callback async: ninguém espera por ele
symbols.forEach(async (symbol) => {
  const quote = await getPrice(symbol);
  console.log("forEach (chega atrasado):", quote.symbol);
});
console.log("Linha depois do forEach: executa ANTES das cotações chegarem");
await delay(200); // só para as linhas acima aparecerem antes de seguir

// 2) Esquecer o await devolve a Promise, não o valor
const forgotten = getPrice("PETR4");
console.log("Sem await:", forgotten); // Promise { <pending> }
console.log("Com await:", await forgotten); // { symbol: 'PETR4', price: 38.5 }

// 3) Promise rejeitada sem catch derruba o processo (UnhandledPromiseRejection).
// Descomente para ver o erro:
// getPrice("XXXX");

/*
 * FETCH API AND RESPONSE VALIDATION
 * Concepts covered: fetch returns a Response, HTTP 404/500 do NOT reject, response.ok, response.json()
 */
console.log("\nFETCH API AND RESPONSE VALIDATION");

// fetch só rejeita em erro de REDE. Um 404 ou 500 resolve normalmente,
// por isso é obrigatório checar response.ok antes de ler o corpo.
async function fakeFetch(url) {
  const found = url.endsWith("/PETR4");
  await delay(50);
  return {
    ok: found,
    status: found ? 200 : 404,
    json: async () => (found ? { symbol: "PETR4", price: 38.5 } : { error: "not found" }),
  };
}

async function getQuote(symbol) {
  try {
    const response = await fakeFetch(`https://api.exemplo.com/quote/${symbol}`);

    console.log(`${symbol} -> status`, response.status, "| ok:", response.ok);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json(); // json() também é assíncrono
    console.log("Cotação recebida:", data);
    return data;
  } catch (error) {
    console.error("Falha no fetch:", error.message);
    return null;
  }
}

await getQuote("PETR4"); // PETR4 -> status 200 | ok: true
await getQuote("XXXX"); // XXXX -> status 404 | ok: false -> Erro HTTP 404

// Com o fetch real do Node/navegador, o código é exatamente o mesmo:
//
// const response = await fetch("https://brapi.dev/api/quote/PETR4");
// if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
// const data = await response.json();
