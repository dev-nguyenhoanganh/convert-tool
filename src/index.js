const btnRender = document.querySelector("button#render");
// const btnSelectDir = document.querySelector("button#selectDir");
// const folderName = document.querySelector("input#dir");
const btnOutput = document.querySelector("button#output");
const outputFolder = document.querySelector("input#output");
const inputHulf = document.querySelector("input#HULFT_ID");
const date = document.querySelector("input#reference-date");
const SHEET_NAME_READER = "output";
const progress = document.querySelector(".meter>span");
const excelFile = document.querySelector("input#formFile");
const range = document.querySelector("input#range");

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

  if (content.length === 0) {
    alert('File trống hoặc không tồn tại sheet "output"');
    return;
  }

  const escapeData = content.map((row) => {
    const escapeRow = row.map((item) => {
      let cell = item;
      if (cell) {
        cell = item.replace(/"/g, '""');
        // .repalce(/\\/g, '\\\\')
      }

      return cell;
    });

    return '"' + escapeRow.join('","') + '"';
  });

  window.myAPI.exportFile(fileName, escapeData.join("\r\n"), onError);
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
    const rangeConvert = range.value || undefined;
    window.myAPI.convertFile(fileData, SHEET_NAME_READER, rangeConvert, onRead, onError);
  };

  if (excelFile.files && excelFile.files.length) {
    const file = excelFile.files[0];
    reader.readAsBinaryString(file);
  } else {
    alert("Vui lòng chọn file");
  }

  // window.myAPI.readFiles(folderName.value, SHEET_NAME_READER, onRead, onError);
});
