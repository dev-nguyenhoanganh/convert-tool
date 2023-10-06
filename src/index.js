const btnRender = document.querySelector("button#render");
// const btnSelectDir = document.querySelector("button#selectDir");
// const folderName = document.querySelector("input#dir");
const btnOutput = document.querySelector("button#output");
const outputFolder = document.querySelector("input#output");
const inputHulf = document.querySelector("input#HULFT_ID");
const date = document.querySelector("input#reference-date");
const SHEET_NAME_READER = "案件追加項目";
const progress = document.querySelector(".meter>span");
const excelFile = document.querySelector("input#formFile");

let counter = 1;

const onError = (error) => {
  if (error) {
    alert(error.message);
  }
};

const onRead = (filename, content, length) => {
  const fileName =
    outputFolder.value + inputHulf.value + "_" + window.myAPI.fDate(date.value) + ".csv";

  console.log(content);

  const exportData = content.map((row) => {
    return '"' + row.join('","') + '"';
  });

  window.myAPI.exportFile(fileName, exportData.join("\r\n"), onError);
  progress.className = "w-" + Math.round((counter++ * 100) / length);
};

// btnSelectDir.addEventListener("click", () => {
//   window.myAPI.selectFolder().then((result) => {
//     if (result) {
//       folderName.value = result + "\\";
//     }
//   });
// });

btnOutput.addEventListener("click", () => {
  window.myAPI.selectFolder().then((result) => {
    if (result) {
      outputFolder.value = result + "\\";
    }
  });
});

btnRender.addEventListener("click", () => {
  progress.className = "w-0";

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileData = e.target?.result;

    window.myAPI.convertFile(fileData, SHEET_NAME_READER, onRead, onError);
  };

  if (excelFile.files && excelFile.files.length) {
    const file = excelFile.files[0];
    reader.readAsBinaryString(file);
  } else {
    alert("Vui lòng chọn file");
  }

  // window.myAPI.readFiles(folderName.value, SHEET_NAME_READER, onRead, onError);
});

