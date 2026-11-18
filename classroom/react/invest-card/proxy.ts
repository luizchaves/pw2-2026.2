import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

// No Next.js 16 o middleware passou a se chamar proxy: mesmo arquivo na raiz,
// mesma função, nome novo.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Tudo menos os estáticos — rodar o refresh de sessão em imagem e fonte
     * só gastaria requisição.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
