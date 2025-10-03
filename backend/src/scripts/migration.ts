import { mockProductOptions, mockProductOptionsChoices, mockProducts } from '../data/mock-data';
import { OrganizationsModel } from '../models/organizations.model';
import { ProductOptionChoiceModel } from '../models/product-option-choice.model';
import { ProductOptionModel } from '../models/product-option.model';
import { ProductModel } from '../models/products.model';


const populateProducts = async () => {
  const Products = mockProducts;
  for (const product of Products) {
    const p = await ProductModel.create({
      ...product,
      organizationId: '834e202a-b622-40d1-a350-529bf084a4ed',
      metaProductId: 'fadsfw',
    });
    const op = mockProductOptions.find((item) => item.productId === product.id);
    const opr = await ProductOptionModel.create({ ...op, type: 'single', productId: p.id } as any);
    const ch = mockProductOptionsChoices.find((item) => item.productOptionId === op?.id);
    await ProductOptionChoiceModel.create({ ...ch, productOptionId: opr.id } as any);
    console.log('🥱 added' + product.id);
  }
};

export const run = async () => {
  try {
    await populateProducts();
  } catch (error: any) {
    console.log('==============product error======================');
    console.log(error);
    console.log('====================================');
  }
};
