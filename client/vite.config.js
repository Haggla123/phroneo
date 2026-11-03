import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ root: 'client', envDir: '..', plugins: [react()], publicDir: '../public', build: { outDir: '../dist', emptyOutDir: true } });
