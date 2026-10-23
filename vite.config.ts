import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Vercel serves this app from the domain root, not /SR-fashions/.
  base: '/',
  plugins: [react()]
});
