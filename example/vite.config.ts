import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  base: "/joycon2.js/",
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      "@joycon2": path.resolve(__dirname, "../dist/joycon2.js"),
    },
  },

});
