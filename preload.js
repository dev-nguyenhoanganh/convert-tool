const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const XLSX = require("xlsx");
const iconv = require("iconv-lite");
const { format } = require("date-fns");

const fDate = (date, formatDate = "yyyyMMdd") => {
  if (date === "" || date.toString() === "Invalid Date") {
    return "";
  }

  return format(new Date(date), formatDate);
};

const readFiles = (dirname, sheetName, onResolve, onReject) => {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onReject(err);
      return;
    }
    filenames.forEach(async (filename, index) => {
      try {
        const index = filename.lastIndexOf(".");
        if (index === -1) {
          throw new Error("File not exist.");
        }

        const extension = filename.slice(index);
        if (![".xlsx", ".xlsm", ".xls"].includes(extension)) {
          return;
        }

        const data = XLSX.readFile(dirname + filename);
        const result = XLSX.utils.sheet_to_json(data.Sheets[sheetName], {
          header: 1,
          blankrows: false,
          skipHidden: true,
          range: "A4:AA1000",
        });
        onResolve(filename, result, filenames.length);
      } catch (e) {
        onReject(e);
      }
    });
  });
};

const exportFile = (fileName, data, onError) => {
  const buffer = iconv.encode(data.normalize("NFC"), "Shift_JIS");
  fs.writeFileSync(fileName, buffer, onError);
};

const convertFile = (fileData, sheetName, range, onResolve, onReject) => {
  try {
    const data = XLSX.read(fileData, { type: "binary" });
    const result = XLSX.utils.sheet_to_json(data.Sheets[sheetName], {
      header: 1,
      blankrows: false,
      skipHidden: true,
      range,
    });
    onResolve("", result, 1);
  } catch (e) {
    onReject(e);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

contextBridge.exposeInMainWorld("myAPI", {
  selectFolder: () => ipcRenderer.invoke("dialog:openDirectory"),
  readFiles,
  exportFile,
  convertFile,
  fDate,
  openDialog: (type, message) =>
    ipcRenderer.invoke("dialog:showMessageBoxSync", type, message),
});
