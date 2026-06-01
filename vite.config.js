import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".html"));
const inputMap = {};
files.forEach((f) => {
  inputMap[f.replace(".html", "")] = resolve(__dirname, f);
});

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: inputMap,
    },
  },
});
