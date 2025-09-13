import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BleLibTemplate',
      fileName: 'index',
      formats: ['es', 'umd']
    },
    outDir: 'dist',
    sourcemap: true
  },
  plugins: [tsconfigPaths()]
});
