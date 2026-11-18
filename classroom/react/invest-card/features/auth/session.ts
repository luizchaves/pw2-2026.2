import { connection } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Quem está logado, lido no servidor a partir dos cookies. Ler a sessão no
 * cliente faria o HTML do servidor e o do navegador discordarem (erro de
 * hidratação) e os botões piscarem.
 *
 * `connection()` corta o prerender aqui: com `cacheComponents` ligado, o que
 * vem depois só roda com uma requisição de verdade na mão. Sem isso o build
 * tenta prerenderizar esta leitura e esbarra no `Date.now()` que o cliente do
 * Supabase usa para conferir a validade do token.
 */
export async function getSessionUser() {
  await connection();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
