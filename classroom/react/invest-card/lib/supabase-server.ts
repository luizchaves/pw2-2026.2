import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: este módulo é só para código de servidor (Route Handlers, Server
// Actions). A secret key ignora RLS — se ela vazar para o bundle do browser,
// qualquer pessoa manda no banco. Nunca importe isto de um componente
// marcado com 'use client'.
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SECRET_KEY. Rode `npm run db:env -- --force`.',
    );
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
