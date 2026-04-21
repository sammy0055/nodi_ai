// import ExcelJS from 'exceljs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // recreate __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const filePath = path.resolve(__dirname, '../../../files/pizza-nani.xlsx');

// export async function mapExcelFile(filePath: string) {
//   const workbook = new ExcelJS.Workbook();
//   await workbook.xlsx.readFile(filePath);

//   const sheet = workbook.getWorksheet(1) as ExcelJS.Worksheet;

//   if (!sheet) return [];

//   // get headers (row 1)
//   const headers = sheet.getRow(1).values.slice(1);

//   const result: any[] = [];

//   sheet.eachRow((row: any, rowNumber) => {
//     if (rowNumber === 1) return; // skip header

//     const values = row.values.slice(1);

//     const obj = headers.reduce((acc: any, key: any, index: number) => {
//       acc[key] = values[index] ?? null;
//       return acc;
//     }, {});

//     result.push(obj);
//   });

//   return result;
// }

// const run = async () => {
//   try {
//     const data = await mapExcelFile(filePath);
//     console.log('====================================');
//     console.log(data);
//     console.log('====================================');
//   } catch (error: any) {
//     console.log('====================================');
//     console.log('run error:', error);
//     console.log('====================================');
//   }
// };

// run();
