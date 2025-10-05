import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // GitHub Pages のリポジトリ名に合わせる
  base: "/joycon2.js/example/dist/",
  resolve: {
    alias: {
      "@joycon2": path.resolve(__dirname, "../dist/joycon2.js"),
    },
  },
  build: {
    outDir: "dist", // デフォルトだが念のため
  },
});
