import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'JoyCon2',
      fileName: 'index',
      formats: ['es', 'umd']
    },
  // output to repository root `dist` so artifacts live at /dist
  outDir: '../dist',
    sourcemap: true
  },
  plugins: [tsconfigPaths()]
});
