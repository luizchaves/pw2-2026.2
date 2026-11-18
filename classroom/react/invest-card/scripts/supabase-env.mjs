#!/usr/bin/env node
// Gera o .env.local com as credenciais do Supabase local, lidas de
// `supabase status`. Use `npm run db:env -- --force` para sobrescrever
// um .env.local existente (por exemplo, um que aponte para a nuvem).

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../.env.local', import.meta.url));
const force = process.argv.includes('--force');

if (existsSync(envPath) && !force) {
  console.log(
    '.env.local já existe — mantido como está.\n' +
      'Use `npm run db:env -- --force` para sobrescrever com os valores locais.',
  );
  process.exit(0);
}

let status = '';

try {
  status = execFileSync('supabase', ['status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (cause) {
  console.error(
    'Não foi possível ler o status do Supabase. Rode `npm run db:start` antes.',
  );
  console.error(cause.stderr?.toString().trim() ?? cause.message);
  process.exit(1);
}

const read = (key) => status.match(new RegExp(`^${key}="(.*)"$`, 'm'))?.[1];

const apiUrl = read('API_URL');
const publishableKey = read('PUBLISHABLE_KEY') ?? read('ANON_KEY');

if (!apiUrl || !publishableKey) {
  console.error(
    'API_URL ou PUBLISHABLE_KEY não encontrados na saída de `supabase status`.',
  );
  process.exit(1);
}

writeFileSync(
  envPath,
  [
    '# Gerado por `npm run db:env` a partir de `supabase status`.',
    '# Para apontar para a nuvem, edite este arquivo (veja o README).',
    `NEXT_PUBLIC_SUPABASE_URL=${apiUrl}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`,
    '',
  ].join('\n'),
);

console.log(`.env.local gerado apontando para ${apiUrl}`);
