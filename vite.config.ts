/*
 * @Author: 高瑞寒 15932717091@163.com
 * @Date: 2022-06-03 23:02:02
 * @LastEditTime: 2022-06-03 23:35:23
 * @LastEditors: 高瑞寒 15932717091@163.com
 * @Description:
 */
import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
