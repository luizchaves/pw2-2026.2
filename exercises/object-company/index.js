const companies = [
  {
    name: "Amazon",
    founded: "1994	",
    industry: "E-Commerce, Cloud",
    kind: "Internet company"
  },
  {
    name: "Facebook",
    founded: "2004",
    industry: "Social",
    kind: "Internet company"
  },
  {
    name: "Alphabet Inc.",
    founded: "2015",
    industry: "Search, Cloud, Advertising",
    kind: "Internet company"
  }
];

console.log(companies[2].founded); // 2015

function show(companies) {
  let result = "";

  for (const company of companies) {
    result += `${company.name.padEnd(15, ".")}${company.founded}\n`;
  }

  return result;
}

console.log(show(companies));

// Melhorias:
// 1. Tamanho dinâmico do padding, baseado no maior nome da lista
// 2. Ordenação da lista por nome
// 3. Tentar substituir o for...of por um map() e join() para gerar a string final
