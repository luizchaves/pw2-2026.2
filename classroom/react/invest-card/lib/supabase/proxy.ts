import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { AUTH_ROUTES, HOME_ROUTE, PUBLIC_ROUTES, ROUTES } from '@/lib/routes';

/**
 * Renova a sessão e decide quem entra. Roda no proxy (o antigo middleware),
 * antes de qualquer página: o access token tem 1h de validade, e sem este
 * refresh o usuário seria deslogado no meio do uso.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // O token renovado precisa ir para os dois lados: para a requisição
        // (que segue para a página) e para a resposta (que atualiza o browser).
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getUser() valida o token no servidor do Supabase. getSession() só lê o
  // cookie, que o browser poderia ter forjado — por isso não serve de guarda.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Rota de API não é página: redirecionar para /login devolveria HTML onde o
  // fetch espera JSON. Elas se defendem sozinhas respondendo 401.
  if (pathname.startsWith('/api')) {
    return response;
  }

  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = ROUTES.login;
    // Guarda para onde a pessoa queria ir, para voltar depois do login.
    redirectUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // A landing fica de fora: ela se adapta à sessão em vez de sumir.
  if (user && AUTH_ROUTES.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = HOME_ROUTE;
    redirectUrl.search = '';

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
