# 说明

语言模版解析应用，可将 JS 格式的英文模版自动转换为导入 Excel 中的任何一门语言的模版。来解决在 i18n 中多国语言模版的维护问题。

# 使用

1. 在 `语言模板` 下放入需要转换的模版文件，格式为 `JS` 格式
2. 上传包含多国语言的 `Excel` 文件，格式为 `xlsx` 格式,解析成功会有相应提示
3. 选择需要转换的语言
4. 在目标语言中会自动转换为所需要的语言格式

## 模板格式
```javascript
const locale_en = {
  welcome:'welcome',
  login:{
    username:'username',
    password:'password'
  }
}
```

## Excel格式
注：表头中要有 `English` 或 `en` 或 `英语` 字眼，否则无法正常识别。表头中的文字会默认作为导出的文件名
| en | zh | ja | ms | hi |
| --- | --- | --- | --- | --- |
| welcome | 欢迎 | ようこそ | Selamat Datang | स्वागत |
| username | 用户名 | ユーザー名 | nama pengguna | उपयोक्ता नाम |
| password | 暗语 | ひそかに言う | Katalaluan | पासवर्ड |
