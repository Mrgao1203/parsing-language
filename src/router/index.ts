/*
 * @Author: 高瑞寒 15932717091@163.com
 * @Date: 2022-06-03 23:02:02
 * @LastEditTime: 2024-01-13 04:57:37
 * @LastEditors: 高瑞寒 15932717091@163.com
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/views/excel/parsingLanguage.vue"),
    },
  ],
});

export default router;
