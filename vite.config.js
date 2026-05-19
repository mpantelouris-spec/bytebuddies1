import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@flash': path.resolve(__dirname, 'flash'),
    },
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['blockly', 'blockly/blocks', 'blockly/javascript'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    hmr: {
      overlay: true,
    },
  },
})
