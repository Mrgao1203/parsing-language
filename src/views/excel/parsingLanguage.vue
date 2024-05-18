<script setup lang="ts">
import { ref, watch } from "vue";

import { readWorkbookFromLocalFile } from "@/utils/readExcel";
import { exportFile, flattenObject, unFlattenObject } from "@/utils";

import Editor from "bin-editor-next";

import "brace";
import "brace/ext/emmet";
import "brace/ext/language_tools";
import "brace/mode/json";
import "brace/mode/javascript";
import "brace/theme/chrome";
import "brace/theme/xcode";

import JSZip from "jszip";
import { saveAs } from "file-saver";

import Modal from "./BaseModal.vue";

interface StringMap {
  [key: string]: string;
}

interface ExcelBody {
  English: string;
  [key: string]: string;
}

let excelBody: ExcelBody[]; // excel表格数据

const sourceFile = ref("");
const sourceFileJs = ref("");
const targetFile = ref("");
const selectedLanguage = ref("");
const languagesList = ref<string[]>([]);

const noKeys = ref<StringMap>({});

watch(
  () => sourceFileJs.value,
  (v) => {
    /**
     * 1. 去除等号前的内容
     * 2. 去除最后一个分号
     */

    const json = v.trim().replace(/.*=/g, "").replace(/;$/g, "");

    // 解析字符串为对象
    const obj = eval("(" + json + ")");

    sourceFile.value = JSON.stringify(obj, null, 2);
  }
);

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

    initCheckedLanguage();
  } catch (e) {
    alert("文件读取失败，请确认文件格式");
  }
};

const compilerLanguage = (translateLang: string = selectedLanguage.value) => {
  noKeys.value = {};

  const flattenObj = flattenObject(JSON.parse(sourceFile.value));

  for (const key in flattenObj) {
    if (Object.prototype.hasOwnProperty.call(flattenObj, key)) {
      const isHave = excelBody.some((item) => {
        if (
          item.English?.trim() === flattenObj[key].trim() ||
          item["英文"].trim() === flattenObj[key].trim() ||
          item?.en.trim() === flattenObj[key].trim()
        ) {
          flattenObj[key] = item[translateLang];
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

  const JSONString = JSON.stringify(unFlattenObj, null, 2);

  // 格式化json
  targetFile.value = JSONString;

  return JSONString;
};

const handleLanguageChange = () => {
  setDefaultExportFileName();
  setDefaultExportVariableName();
  compilerLanguage();
};

const noKeysJson = ref("");
const visible = ref(false);
const showModal = () => {
  const obj = unFlattenObject(noKeys.value);
  noKeysJson.value = JSON.stringify(obj, null, 2);
  visible.value = true;
};

const exportFileName = ref("");
const exportVariableName = ref("");

function setDefaultExportFileName() {
  exportFileName.value = selectedLanguage.value
    .replace(/ /g, "_")
    .replace(".", "");
}
function setDefaultExportVariableName() {
  exportVariableName.value = `locale_${selectedLanguage.value}`
    .replace(/ /g, "_")
    .replace(".", "");
}

const visibleDownload = ref(false);
const openDownFile = async () => {
  visibleDownload.value = true;
};

// MARK：批量导出
const variableNamePrefix = ref("locale_");
const checkedLanguage = ref<
  Array<{
    variableName: string;
    fileName: string;
    lang: string;
    checked: boolean;
  }>
>([]);
function initCheckedLanguage() {
  languagesList.value.forEach((language) => {
    checkedLanguage.value.push({
      variableName: `${variableNamePrefix.value}${language}`
        .replace(/ /g, "_")
        .replace(".", ""),
      fileName: language.replace(/ /g, "_").replace(".", ""),
      lang: language,
      checked: false,
    });
  });
}
function changeFileName(e: Event, index: number) {
  checkedLanguage.value[
    index
  ].variableName = `${variableNamePrefix.value}${checkedLanguage.value[index].fileName}`;
}
function downloadSelectFile() {
  const zip = new JSZip();
  for (let i = 0; i < checkedLanguage.value.length; i++) {
    const element = checkedLanguage.value[i];
    if (element.checked) {
      console.log("text", compilerLanguage(element.lang));
      zip.file(
        `${element.fileName}.js`,
        `const ${element.variableName} = ${compilerLanguage(element.lang)}`
      );
    }
  }

  zip
    .generateAsync({ type: "blob" })
    .then((content) => {
      saveAs(content, "language.zip");
    })
    .catch((e) => {
      console.error(e);
    });
}
const visibleHelp = ref(true);
</script>

<template>
  <div class="cool-neumorphic-file-converter">
    <a class="help" href="https://github.com/Mrgao1203/parsing-language/">
      <svg
        t="1715998829590"
        class="icon"
        viewBox="0 0 1627 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1473"
        width="50"
        height="50"
      >
        <path
          d="M1367.503975 0H0l1627.980922 1024V260.476948c0-144.076312-116.400636-260.476948-260.476947-260.476948z m-117.214627 573.049285c-10.581876 9.767886-22.791733 13.837838-36.629571 13.837837-14.651828 0-26.047695-4.883943-35.81558-14.651828-9.767886-9.767886-15.465819-21.163752-15.465819-35.81558s4.883943-26.861685 15.465819-35.81558c8.139905-8.953895 20.349762-13.837838 35.00159-13.837838s27.675676 4.883943 36.629571 13.837838c9.767886 8.953895 14.651828 21.163752 14.651828 35.81558 0.81399 14.651828-4.069952 26.861685-13.837838 36.629571z m87.09698-254.779015c-6.511924 8.139905-23.605723 23.605723-52.09539 48.025437-10.581876 9.767886-18.721781 19.535771-23.605723 28.489667-5.697933 10.581876-8.953895 23.605723-8.953895 37.443561v10.581876c0 4.069952-3.255962 6.511924-6.511924 6.511923h-65.119237c-4.069952 0-6.511924-3.255962-6.511924-6.511923v-10.581876c0-23.605723 4.069952-43.955485 12.209857-60.235294 8.953895-17.90779 31.745628-42.327504 70.81717-77.329094l9.767886-11.395867c9.767886-12.209857 14.651828-26.047695 14.651828-39.885532 0-18.721781-4.883943-34.187599-15.465819-44.769476-10.581876-10.581876-26.047695-16.279809-46.397456-16.279809-25.233704 0-43.141494 7.325914-53.72337 22.791733-9.767886 13.023847-15.465819 33.373609-15.465819 58.607313 0 4.069952-3.255962 6.511924-6.511924 6.511924h-64.305246c-4.069952 0-6.511924-3.255962-6.511924-6.511924 0-45.583466 13.837838-82.213037 40.699523-109.074721s63.491256-40.699523 109.888712-40.699523c40.699523 0 74.887122 11.395866 99.306837 34.187599 25.233704 22.791733 38.257552 53.72337 38.257551 91.980922-0.81399 30.931638-8.953895 56.979332-24.419713 78.143084z"
          fill="#FC9701"
          p-id="1474"
        ></path>
      </svg>
    </a>
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
      <span class="cool-neumorphic-file-title">导入翻译文档</span>
    </div>

    <div class="cool-neumorphic-container">
      <div class="cool-neumorphic-item">
        <div class="cool-neumorphic-item-title">语言模板(英语)</div>
        <Editor v-model="sourceFileJs" height="100" lang="javascript" />
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
        <div class="cool-neumorphic-item-title">
          <span>目标语言</span>
          <input
            type="text"
            v-model="exportFileName"
            class="export-name"
            placeholder="文件名"
          />
          <input
            type="text"
            v-model="exportVariableName"
            class="export-name"
            placeholder="变量名"
          />
          <div class="btn-group">
            <button
              @click="
                exportFile(
                  `const ${exportVariableName} = ${targetFile}`,
                  `${exportFileName}.js`,
                  'js'
                )
              "
              :disabled="!selectedLanguage"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <!-- 批量下载 -->
            <button
              @click="openDownFile"
              class="download-files"
              :disabled="!selectedLanguage"
            >
              批量下载
            </button>
          </div>
        </div>
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

    <Modal
      title="批量下载"
      v-model:visible="visibleDownload"
      :width="850"
      body-class="table-body"
    >
      <div class="select-download-btn">
        <button @click="downloadSelectFile">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
        <div>前缀： <input type="text" v-model="variableNamePrefix" /></div>
      </div>
      <div class="download-container">
        <table class="neumorphism-table">
          <thead>
            <tr>
              <th style="width: 60px">选择</th>
              <th style="width: 240px">语言</th>
              <th style="width: 200px">文件名</th>
              <th style="width: 200px">变量名(前缀+文件名)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(language, key) in checkedLanguage" :key="key">
              <td style="width: 60px">
                <input
                  type="checkbox"
                  class="neumorphism-checkbox"
                  v-model="language.checked"
                />
              </td>
              <td style="width: 240px">
                <span class="language-name">{{ language.lang }}</span>
              </td>
              <td style="width: 200px">
                <span class="language-input">
                  <input
                    type="text"
                    v-model="checkedLanguage[key].fileName"
                    @input="(e) => changeFileName(e, key)"
                  />
                </span>
              </td>
              <td style="width: 200px">
                <span class="language-input">
                  <input
                    disabled
                    type="text"
                    :value="variableNamePrefix + language.fileName"
                  />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.help {
  position: absolute;
  top: -9px;
  right: 0;
  z-index: 999;
  cursor: pointer;
}
.checkout-container {
  position: relative;
}
.neumorphism-table {
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}
.neumorphism-table tbody {
  overflow: auto;
}
.neumorphism-table tr {
  width: 100%;
}
.neumorphism-table th,
.neumorphism-table td {
  padding: 10px;
  background: #f0f0f0;
}

.neumorphism-table th {
  text-align: left;
  font-weight: bold;
}
:deep(.table-body) {
  display: flex;
  flex-direction: column;
}
button {
  background: #e0e0e0;
  border: none;
  padding: 2px 10px;
  border-radius: 8px;
  box-shadow: 8px 8px 16px #b8b8b8, -8px -8px 16px #ffffff;
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  color: #333333;
}
button[disabled] {
  background: #f0f0f0;
  color: #999999;
}

button:active {
  box-shadow: 3px 3px 6px #b8b8b8, -3px -3px 6px #ffffff;
}
.select-download-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: #f0f0f0;
  width: 100%;
  margin-bottom: 20px;
}
.btn-group {
  display: flex;
  gap: 20px;
}
.download-container {
  height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  .download-item {
    display: flex;
    gap: 20px;
    .language-name {
      width: 150px;
    }
    .language-input {
      width: 200px;
    }
  }
}
input[type="text"] {
  background: #e0e0e0;
  border: none;
  padding: 4px 10px;
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
}
input[type="text"]:focus {
  box-shadow: 3px 3px 6px #b8b8b8, -3px -3px 6px #ffffff;
}
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
  display: flex;
  justify-content: space-between;
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
