import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@agentmd-dev/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@agentmd-dev/cli': path.resolve(__dirname, '../../packages/cli/src/cli.ts'),
      '@agentmd-dev/sdk': path.resolve(__dirname, '../../packages/sdk/src/index.ts'),
      '@agentmd-dev/workflows': path.resolve(__dirname, '../../packages/workflows/index.ts'),
    },
  },
});
