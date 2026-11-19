import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Sem @vitejs/plugin-react: ele existe para o Fast Refresh, que teste não
  // usa, e a versão atual pede Babel 8 (o projeto está no 7). O transformador
  // do próprio Vite (oxc) já entende o JSX dos .tsx.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // O e2e é do Playwright; o Vitest cuida de unidade e componente.
    exclude: ['**/node_modules/**', '**/.next/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      // text no terminal, html para abrir em coverage/index.html.
      reporter: ['text', 'html'],
      // Mede o código do projeto, não o que é configuração, casca do Next ou
      // primitivo gerado pelo shadcn.
      include: ['app/**', 'components/**', 'contexts/**', 'features/**', 'lib/**'],
      exclude: [
        'components/ui/**',
        '**/*.test.{ts,tsx}',
        '**/test-fixtures.ts',
        'app/**/layout.tsx',
      ],
    },
    // O cliente do browser falha ao carregar sem estas variáveis. Valores de
    // mentira bastam: nenhum teste aqui chega a falar com o Supabase.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54351',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    },
  },
});
