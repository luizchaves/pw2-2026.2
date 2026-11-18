import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Client de servidor (Route Handlers, Server Components) que lê a sessão dos
// cookies da requisição. Ele usa a chave publishable e continua sujeito ao
// RLS: as queries enxergam só as linhas do usuário logado, igual ao browser.
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Rode `npm run db:env -- --force`.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component não pode escrever cookie. Quem renova a sessão é
          // o proxy.ts, então dá para ignorar com segurança.
        }
      },
    },
  });
}
