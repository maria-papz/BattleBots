import { defineConfig } from 'vite';
import { apiServerPlugin } from './vite-plugin-api-server';

export default defineConfig({
  base: './',
  plugins: [apiServerPlugin()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.API_PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
  },
});
