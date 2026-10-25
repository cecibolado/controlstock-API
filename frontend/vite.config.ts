import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(frontendDir, '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const apiPort = env.PORT || '3000';

  return {
    plugins: [react()],
    envDir: projectRoot,
    server: { port: 5173, proxy: { '/api': `http://127.0.0.1:${apiPort}` } },
  };
});
