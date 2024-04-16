/*
 * @Author: 高瑞寒 15932717091@163.com
 * @Date: 2022-06-03 23:02:02
 * @LastEditTime: 2024-01-15 13:46:26
 * @LastEditors: 高瑞寒 nick.qao@hytechc.com
 * @Description:
 */
import { fileURLToPath, URL } from "url";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue(), vueJsx()],
  server: {
    host: "0.0.0.0",
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
  },
  build: {
    outDir: "parsing-excel",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
