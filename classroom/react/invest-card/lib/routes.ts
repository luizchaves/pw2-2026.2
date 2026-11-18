/**
 * Os caminhos do app em um lugar só. Mover uma tela passa a ser mudar uma
 * linha aqui — quando a carteira saiu de `/` para `/investments`, o endereço
 * estava repetido no formulário, no proxy, na navbar e no dashboard.
 */
export const ROUTES = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  investments: '/investments',
} as const;

/** Primeira tela de quem entra, e para onde a landing manda quem já entrou. */
export const HOME_ROUTE = ROUTES.dashboard;

/** Abrem sem sessão. */
export const PUBLIC_ROUTES: string[] = [
  ROUTES.landing,
  ROUTES.login,
  ROUTES.signup,
];

/** Não fazem sentido para quem já entrou: o proxy manda para o HOME_ROUTE. */
export const AUTH_ROUTES: string[] = [ROUTES.login, ROUTES.signup];
