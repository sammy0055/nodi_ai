import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Transaction } from 'sequelize';
import { sequelize } from '../../models/db';
import { ImageUploadHelper } from '../../helpers/image-upload';
import { readFile } from 'fs/promises';
import { WhatsappCatalogHelper } from '../../helpers/whatsapp-catalog';
import { ProductOptionChoiceModel } from '../../models/product-option-choice.model';
import { WhatSappSettingsModel } from '../../models/whatsapp-settings.model';
import { ProductModel } from '../../models/products.model';
import { ProductOptionModel } from '../../models/product-option.model';
import { productOptionsTaxonomy } from '../../data/taxonomy';

const PIZA_NANI = '8e853d10-8bc4-4308-8eaa-6c0169fa2604';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../../../files/pizza-nani.xlsx');

const uploadImage = async (imageName: string, productId: string) => {
  const manageImageFile = new ImageUploadHelper();
  const imagePath = path.resolve(__dirname, `../../../files/images/${imageName}`);

  const file = await readFile(imagePath);

  const { imgUrl, path: uploadedPath } = await manageImageFile.uploadImageTos3(file, {
    orgainationId: PIZA_NANI,
    productId,
  });

  return { imgUrl, uploadedPath };
};

// ✅ MAP EXCEL WITH ROW TRACKING
export async function mapExcelFile(filePath: string): Promise<any> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const productSheet = workbook.getWorksheet(1);
  const optionSheet = workbook.getWorksheet(2);
  const choiceSheet = workbook.getWorksheet(3);

  if (!productSheet || !optionSheet || !choiceSheet) return [];

  const parseSheet = (sheet: ExcelJS.Worksheet | any) => {
    const headers = sheet.getRow(1).values.slice(1);

    const rows: any[] = [];

    sheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return;

      const values = row.values.slice(1);

      const obj = headers.reduce((acc: any, key: any, index: number) => {
        acc[key] = values[index] ?? null;
        return acc;
      }, {});

      obj.__rowNumber = rowNumber; // ✅ important

      rows.push(obj);
    });

    return rows;
  };

  const products = parseSheet(productSheet);
  const options = parseSheet(optionSheet);
  const choices = parseSheet(choiceSheet);

  const productMap: Record<string, any> = {};
  const optionMap: Record<string, any> = {};

  products.forEach((p) => {
    productMap[p.product_key] = { ...p, options: [] };
  });

  options.forEach((o) => {
    const product = productMap[o.product_key];
    if (!product) return;

    const optionObj = { ...o, choices: [] };
    product.options.push(optionObj);
    optionMap[o.option_key] = optionObj;
  });

  choices.forEach((c) => {
    const option = optionMap[c.option_key];
    if (!option) return;

    option.choices.push({ ...c });
  });

  return { data: Object.values(productMap), workbook };
}

const run = async () => {
  try {
    const { data, workbook } = await mapExcelFile(filePath);

    if (!data.length) return;

    console.log('running...............');

    const productSheet = workbook.getWorksheet(1);
    const headerRow = productSheet.getRow(1);

    let productIdColIndex = -1;

    headerRow.eachCell((cell: any, colNumber: number) => {
      if (cell.value === 'product_id') {
        productIdColIndex = colNumber;
      }
    });

    if (productIdColIndex === -1) {
      throw new Error('product_id column not found in Excel');
    }

    const whatsappData = await WhatSappSettingsModel.findOne({
      where: { organizationId: PIZA_NANI },
    });

    if (!whatsappData) throw new Error('no whatsapp settings record for this user');

    for (const product of data) {
      // ✅ skip already processed
      if (product.product_id) {
        console.log('skipping:', product.name);
        continue;
      }

      const transaction: Transaction = await sequelize.transaction();

      try {
        // ✅ create product
        const createdProduct = await ProductModel.create(
          {
            name: product.name,
            description: product.description,
            price: product.price,
            currency: 'LBP',
            imageUrl: '',
            organizationId: PIZA_NANI,
            metaProductId: 'pending',
          },
          { transaction }
        );

        // ✅ options + choices
        for (const option of product.options) {
          if (!option.name) throw new Error('option name is required');

          const realOption = productOptionsTaxonomy.restaurant.find((p) => p.name == option.name);

          const createdOption = await ProductOptionModel.create(
            {
              productId: createdProduct.id,
              name: realOption?.label || option.name,
              description: realOption?.description,
              type: option.type || 'single',
              preselected_options: [],
            },
            { transaction }
          );

          const choices = option.choices.map((ch: any) => ({
            productOptionId: createdOption.id,
            label: ch.label,
            priceAdjustment: ch?.priceAjustment || 0,
          }));

          await ProductOptionChoiceModel.bulkCreate(choices, {
            transaction,
          });
        }

        // ✅ upload image
        const { uploadedPath, imgUrl } = await uploadImage(product.image_name, createdProduct.id);

        // ✅ external API
        await WhatsappCatalogHelper.createMetaCatalogItem(
          {
            itemId: createdProduct.id,
            name: createdProduct.name,
            description: createdProduct.description,
            price: createdProduct.price,
            currency: 'LBP',
            imageUrl: imgUrl,
          },
          whatsappData
        );

        // ✅ update product
        await createdProduct.update(
          {
            imageUrl: imgUrl,
            filePath: uploadedPath,
            metaProductId: createdProduct.id,
          },
          { transaction }
        );

        // ✅ commit DB
        await transaction.commit();

        // ✅ write back to Excel
        const row = productSheet.getRow(product.__rowNumber);
        row.getCell(productIdColIndex).value = createdProduct.id;
        row.commit();

        console.log('done:', createdProduct.id);
      } catch (err) {
        await transaction.rollback();
        console.log('failed:', product.name, err);
      }
    }

    // ✅ save Excel once
    await workbook.xlsx.writeFile(filePath);

    console.log('Excel updated ✅');
  } catch (error: any) {
    console.log('====================================');
    console.log('run error:', error);
    console.log('====================================');
  }
};

run();
