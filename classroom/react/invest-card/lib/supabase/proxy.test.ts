import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

// O que interessa aqui é a decisão de rota; o cliente do Supabase é dublê e
// só responde quem está logado.
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

function requestFor(path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

function signedIn() {
  getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
}

function signedOut() {
  getUser.mockResolvedValue({ data: { user: null } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateSession — sem sessão', () => {
  it('manda para o login guardando o destino', async () => {
    signedOut();

    const response = await updateSession(requestFor('/investments'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?next=%2Finvestments',
    );
  });

  it('deixa a landing, o login e o cadastro passarem', async () => {
    signedOut();

    for (const path of ['/', '/login', '/signup']) {
      const response = await updateSession(requestFor(path));

      expect(response.headers.get('location')).toBeNull();
    }
  });

  it('não redireciona rota de API: ela responde 401 em JSON', async () => {
    signedOut();

    // Redirecionar devolveria HTML onde o fetch espera JSON.
    const response = await updateSession(requestFor('/api/quotes/refresh'));

    expect(response.headers.get('location')).toBeNull();
  });
});

describe('updateSession — com sessão', () => {
  it('tira de /login e /signup, levando ao dashboard', async () => {
    signedIn();

    for (const path of ['/login', '/signup']) {
      const response = await updateSession(requestFor(path));

      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    }
  });

  it('deixa ver a landing, que se adapta a quem já entrou', async () => {
    signedIn();

    const response = await updateSession(requestFor('/'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('deixa passar as rotas protegidas', async () => {
    signedIn();

    const response = await updateSession(requestFor('/dashboard'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('valida o token no servidor, em vez de confiar no cookie', async () => {
    signedIn();

    await updateSession(requestFor('/dashboard'));

    // getUser() confere com o Supabase; getSession() só leria o cookie, que o
    // browser poderia ter forjado.
    expect(getUser).toHaveBeenCalled();
  });
});
