import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  base: '/joycon2.js/',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
