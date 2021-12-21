import ExcelJS from "exceljs";

const excel = async (sheetName, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns;
  sheet.addRows(rows);

  await workbook.xlsx.writeFile(`xlsx/${sheetName}.xlsx`);
};

export default excel;
