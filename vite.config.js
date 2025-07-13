import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import dotenv from 'dotenv';

dotenv.config(); // ⬅️ Load .env before build starts

//console.log('✅ VITE_OPENAI_API_KEY during build:', process.env.VITE_OPENAI_API_KEY);
console.log('✅ VITE_COHERE_API_KEY during build:', process.env.VITE_COHERE_API_KEY);

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'background.js', dest: '.' },
        { src: 'style.css', dest: '.' }
      ]
    })
  ],
  define: {
    //'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY),
    'import.meta.env.VITE_COHERE_API_KEY': JSON.stringify(process.env.VITE_COHERE_API_KEY)
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
        view: 'view.html'
      }
    }
  }
});
