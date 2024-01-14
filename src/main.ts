/*
 * @Author: 高瑞寒 15932717091@163.com
 * @Date: 2022-06-03 23:02:02
 * @LastEditTime: 2022-06-03 23:31:25
 * @LastEditors: 高瑞寒 15932717091@163.com
 * @Description:
 */
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import "@/assets/base.css";

const app = createApp(App);

app.use(router);

app.mount("#app");
