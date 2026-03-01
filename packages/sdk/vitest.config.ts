import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
    },
    resolve: {
        alias: {
            '@agentmd-dev/core': path.resolve(__dirname, '../core/src/index.ts'),
        },
    },
});
