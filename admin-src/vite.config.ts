import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served at /admin on the deployed site, so assets must resolve relative to it.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  // Built output lands at the repo root as /admin, so Vercel serves it there directly.
  build: { outDir: '../admin', emptyOutDir: true },
  server: {
    // `npm run dev` here talks to the Vercel functions running on :3000
    proxy: { '/api': 'http://localhost:3000' },
  },
});
