<script setup lang="ts">
import { ref } from "vue";

import { readWorkbookFromLocalFile } from "@/utils/readExcel";
import { flattenObject, unFlattenObject } from "@/utils";

import Editor from "bin-editor-next";

import "brace";
import "brace/ext/emmet";
import "brace/ext/language_tools";
import "brace/mode/json";
import "brace/theme/chrome";
import "brace/theme/xcode";

import Modal from "./BaseModal.vue";

interface StringMap {
  [key: string]: string;
}

interface ExcelBody {
  English: string;
  [key: string]: unknown;
}

let excelBody: ExcelBody[]; // excel表格数据

const sourceFile = ref("");
const targetFile = ref("");
const selectedLanguage = ref("");
const languagesList = ref<string[]>([]);

const noKeys = ref<StringMap>({});

const handleClick = (e: MouseEvent) => {
  if (!sourceFile.value) {
    alert("请定制语言模版");
    e.preventDefault();
    return;
  }
};

const handleFileInputChange = async (e: Event) => {
  const fileList = (e.target as HTMLInputElement).files;
  if (!fileList) return;

  const file = fileList[0];

  try {
    const { data: sheetData } = await readWorkbookFromLocalFile(file);
    const { body, headers_key } = sheetData;

    excelBody = body;

    languagesList.value = headers_key;

    alert("文件解析成功，请选择语言");
  } catch (e) {
    alert("文件读取失败，请确认文件格式");
  }
};

const compilerLanguage = () => {
  noKeys.value = {};

  const flattenObj = flattenObject(JSON.parse(sourceFile.value));

  for (const key in flattenObj) {
    if (Object.prototype.hasOwnProperty.call(flattenObj, key)) {
      const isHave = excelBody.some((item) => {
        if (
          item.English === flattenObj[key] ||
          item["英文"] === flattenObj[key]
        ) {
          flattenObj[key] = item[selectedLanguage.value];
          return true;
        }
        return false;
      });
      if (!isHave) {
        noKeys.value[key] = flattenObj[key];
      }
    }
  }

  const unFlattenObj = unFlattenObject(flattenObj);

  // 格式化json
  targetFile.value = JSON.stringify(unFlattenObj, null, 2);
};

const handleLanguageChange = () => compilerLanguage();

const noKeysJson = ref("");
const visible = ref(false);
const showModal = () => {
  const obj = unFlattenObject(noKeys.value);
  noKeysJson.value = JSON.stringify(obj, null, 2);
  visible.value = true;
};
</script>

<template>
  <div class="cool-neumorphic-file-converter">
    <div class="cool-neumorphic-file-input-container">
      <input
        id="file-input"
        type="file"
        @change="handleFileInputChange"
        @click="handleClick"
        class="cool-neumorphic-file-input"
      />
      <div class="cool-neumorphic-file-input-icon">
        <svg
          t="1705095645421"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4265"
          width="32"
          height="32"
        >
          <path
            d="M855.04 385.024q19.456 2.048 38.912 10.24t33.792 23.04 21.504 37.376 2.048 54.272q-2.048 8.192-8.192 40.448t-14.336 74.24-18.432 86.528-19.456 76.288q-5.12 18.432-14.848 37.888t-25.088 35.328-36.864 26.112-51.2 10.24l-567.296 0q-21.504 0-44.544-9.216t-42.496-26.112-31.744-40.96-12.288-53.76l0-439.296q0-62.464 33.792-97.792t95.232-35.328l503.808 0q22.528 0 46.592 8.704t43.52 24.064 31.744 35.84 12.288 44.032l0 11.264-53.248 0q-40.96 0-95.744-0.512t-116.736-0.512-115.712-0.512-92.672-0.512l-47.104 0q-26.624 0-41.472 16.896t-23.04 44.544q-8.192 29.696-18.432 62.976t-18.432 61.952q-10.24 33.792-20.48 65.536-2.048 8.192-2.048 13.312 0 17.408 11.776 29.184t29.184 11.776q31.744 0 43.008-39.936l54.272-198.656q133.12 1.024 243.712 1.024l286.72 0z"
            p-id="4266"
            fill="#888888"
          ></path>
        </svg>
      </div>
      <span class="cool-neumorphic-file-title">选择文件</span>
    </div>

    <div class="cool-neumorphic-container">
      <div class="cool-neumorphic-item">
        <div class="cool-neumorphic-item-title">语言模板(仅支持英语)</div>
        <Editor v-model="sourceFile" height="100" lang="json" />
      </div>
      <div>
        <select
          class="cool-neumorphic-language-selector"
          placeholder="选择语言"
          v-model="selectedLanguage"
          @change="handleLanguageChange"
        >
          <option disabled selected value>选择语言</option>
          <option
            v-for="language in languagesList"
            :key="language"
            :value="language"
          >
            {{ language }}
          </option>
        </select>
        <div class="no-keys">
          未翻译词条
          <span>{{ Object.keys(noKeys).length || 0 }}</span>
          个
          <span class="show" @click="showModal">点击查看</span>
        </div>
      </div>
      <div class="cool-neumorphic-item">
        <div class="cool-neumorphic-item-title">目标语言</div>
        <Editor
          v-model="targetFile"
          height="100"
          lang="json"
          theme="xcode"
          readonly
        />
      </div>
    </div>

    <Modal title="未翻译词条" v-model:visible="visible">
      <Editor v-model="noKeysJson" height="700" lang="json" readonly />
    </Modal>
  </div>
</template>

<style scoped>
.cool-neumorphic-file-converter {
  padding: 20px;
  height: calc(100vh - 70px);
}

.cool-neumorphic-file-input-container {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  padding: 8px 0;
  border-radius: 8px;
  background-color: #f0f0f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.cool-neumorphic-file-input-container:hover {
  background-color: #e0e0e0;
}

.cool-neumorphic-file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.cool-neumorphic-file-input-icon {
  margin-right: 8px;
  color: #888888;
}
.cool-neumorphic-file-title {
  color: #333333;
  font-size: 16px;
  font-weight: bold;
}

.cool-neumorphic-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  height: 100%;
  align-items: center;
}

.cool-neumorphic-item {
  flex: 1;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  height: 100%;
  .bin-editor-next {
    height: calc(100% - 30px) !important;
  }
}

.cool-neumorphic-item-title {
  color: #333333;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.cool-neumorphic-language-selector {
  height: 28px;
  width: 150px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 4px;
  color: #333333;
  appearance: none;
}

.cool-neumorphic-language-selector:focus {
  outline: none;
  box-shadow: 0 0 4px #888888;
}

.cool-neumorphic-language-selector option[disabled] {
  color: #999999;
}

.no-keys {
  margin-top: 8px;
  font-size: 12px;
}
.no-keys .show {
  color: #3085d6;
  cursor: pointer;
}
.no-keys .show:hover {
  color: #1f5f8b;
}

.editor-container {
  height: 100%;
}

.editor {
  height: 100%;
}

.editor .CodeMirror {
  height: 100%;
}

.editor .CodeMirror-scroll {
  height: 100%;
}

.editor .CodeMirror pre {
  padding: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #333333;
  background-color: #f0f0f0;
}
</style>
