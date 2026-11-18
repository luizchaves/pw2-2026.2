import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase ausentes. Copie .env.example para .env.local e preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  );
}

// createBrowserClient (do @supabase/ssr) guarda a sessão em COOKIE, e não em
// localStorage. É isso que deixa o servidor — o proxy.ts e os Route Handlers —
// enxergar quem está logado: o cookie viaja em toda requisição, o localStorage
// nunca sai do browser.
export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey);
