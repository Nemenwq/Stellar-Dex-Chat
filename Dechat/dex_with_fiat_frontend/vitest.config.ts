import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 15000,
    hookTimeout: 15000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      cleanOnRerun: true,
      all: false,
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/node_modules/**',
        '**/.next/**',
      ],
    },
  },
});
