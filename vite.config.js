import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  define: {
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY ?? ''),
    'process.env.VITE_CLOUD_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_CLOUD_FIREBASE_API_KEY ?? ''),
    'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN ?? ''),
    'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID ?? ''),
    'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET ?? ''),
    'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? ''),
    'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID ?? ''),
  },
  resolve: {
    alias: {
      '@flash': path.resolve(__dirname, 'flash'),
    },
  },
  plugins: [react()],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) return 'react-vendor';
          if (id.includes('node_modules/blockly')) return 'blockly';
          if (id.includes('blocklyToolboxSafe')) return 'blockly-safe';
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
