<script setup lang="ts">
import { withDefaults } from "vue";

withDefaults(
  defineProps<{
    title: string;
    visible: boolean;
  }>(),
  {
    visible: false,
  }
);
const emits = defineEmits(["update:visible"]);

const close = () => {
  emits("update:visible", false);
};
</script>

<template>
  <div class="modal" :style="{ display: visible ? 'block' : 'none' }">
    <div class="modal-content">
      <div class="modal-title">
        <div>{{ title }}</div>
        <span class="close" @click="close">&times;</span>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 900px;
}

.modal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
}

.close {
  color: #aaaaaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: #000000;
  text-decoration: none;
  cursor: pointer;
}

.buttons {
  text-align: right;
  margin-top: 16px;
}

.confirmBtn,
.cancelBtn {
  border: none;
  background-color: #3085d6;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}

.confirmBtn:hover,
.cancelBtn:hover {
  background-color: #1f5f8b;
}
</style>
