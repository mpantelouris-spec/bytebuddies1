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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/@react-three')) return 'r3f';
          if (id.includes('node_modules/framer-motion')) return 'framer';
          if (id.includes('virtual-robot-designer')) return 'vrd';
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
  optimizeDeps: {
    include: [
      'blockly', 'blockly/blocks', 'blockly/javascript',
      'three', '@react-three/fiber', '@react-three/drei', 'framer-motion',
    ],
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
