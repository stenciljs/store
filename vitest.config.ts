import { defineConfig } from 'vitest/config';

const exclude = ['node_modules', 'dist', 'test-app'];

export default defineConfig({
  test: {
    exclude,
    coverage: {
      enabled: true,
      exclude: [
        ...exclude,
        'vitest.config.ts',
        'rollup.config.js'
      ],
      provider: 'v8',
      thresholds: {
        branches: 93,
        functions: 86,
        lines: 80,
        statements: 80,
      },
    },
  },
});
