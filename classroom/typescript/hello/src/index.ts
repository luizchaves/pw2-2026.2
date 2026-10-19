import type { User } from './user';

let name: string;

// interface User {
//   name: string;
//   age: number;
//   // toString(): () => string;
// }

interface UserIFPB extends User {
  id: string;
}

type UserType = User & { id: string };

function greetTyped(user: User): string {
  return `Olá, ${user.name}`;
}

console.log(greetTyped({ name: 'Ana', age: 32 }));
// greetTyped({ nome: "Ana" });
// Erro: Object literal may only specify known properties,
// and 'nome' does not exist in type 'User'.
