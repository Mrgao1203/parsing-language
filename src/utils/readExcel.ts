import XLSX from "xlsx/xlsx.js";

interface RespondBody {
  code: number;
  msg: string;
  data: {
    body: Array<any>;
    headers_key: string[];
  };
}

//读取本地Excel表格
export function readWorkbookFromLocalFile(file: File): Promise<RespondBody> {
  const fileReader = new FileReader();
  fileReader.readAsBinaryString(file);
  return new Promise(function (resolve, reject) {
    fileReader.onload = function (ev) {
      try {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, {
          type: "binary",
        }); // 以二进制流方式读取得到整份excel表格对象

        // const sheetContent = [];
        // // 遍历每张表读取
        // for (const sheet in workbook.Sheets) {
        //   if (workbook.Sheets.hasOwnProperty.call(workbook.Sheets, sheet)) {
        //     sheetContent.push(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
        //     break; // 如果只取第一张表，就取消注释这行
        //   }
        // }

        const headers_key = [];

        const sheetContent = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );

        for (const key in sheetContent[1]) {
          headers_key.push(key); //获取表头key
        }

        const respondBody: RespondBody = {
          code: 100,
          msg: "文件解析成功",
          data: {
            body: sheetContent,
            headers_key: headers_key,
          },
        };
        resolve(respondBody);
      } catch (e) {
        const respondBody = {
          code: 500,
          msg: "文件类型不正确",
          data: null,
        };
        reject(respondBody);
      }
    };
  });
}
