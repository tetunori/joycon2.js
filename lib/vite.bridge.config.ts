import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/bridge.ts',
      name: 'JoyCon2Bridge',
      fileName: 'bridge',
      formats: ['es', 'umd']
    },
    outDir: '../dist',
    sourcemap: true
  },
  plugins: [tsconfigPaths()]
});
