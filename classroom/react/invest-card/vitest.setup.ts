import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cada teste monta a sua árvore: sem isto, o DOM do anterior continua na tela
// e as buscas por texto encontram duas ocorrências.
afterEach(() => {
  cleanup();
});
