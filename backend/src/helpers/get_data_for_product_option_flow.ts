import { models } from '../models';
import { ProductModel } from '../models/products.model';
import { WhatsappFlowLabel } from '../types/whatsapp-settings';

const { ProductOptionModel, ProductOptionChoiceModel, WhatSappSettingsModel } = models;

export const getDataForProductOptionFlow = async ({
  productId,
  whatsappBusinessId,
}: {
  productId: string;
  whatsappBusinessId: string;
}) => {
  const product = await ProductModel.findByPk(productId);
  if (!product) throw new Error('wrong product id');
  const options = await ProductOptionModel.findOne({
    where: { productId: productId },
    include: [{ model: ProductOptionChoiceModel, as: 'choices' }],
  });

  const productOptions = options?.get({ plain: true }) as any;

  if (!productOptions) {
    return {
      content: [{ type: 'text', text: 'No options was found for this product' }],
    };
  }

  const whatsappSettings = await WhatSappSettingsModel.findOne({
    where: { whatsappBusinessId: whatsappBusinessId },
  });

  const flow = whatsappSettings?.whatsappTemplates?.find(
    (w) => w.type === 'flow' && w.data?.flowLabel === WhatsappFlowLabel.PRODUCT_OPTIONS_FLOW
  );

  const item = productOptions;
  const result = {
    [item.name.replace(/\s+/g, '_')]: {
      visible: true,
      required: item.isRequired || false,
      label: item.name.replace(/_/g, ' '),
      description: item.description,
      options: item.choices.map((choice: any) => ({
        id: choice.id,
        title: `${choice.label} ${choice.priceAdjustment}`,
      })),
    },
  };

  console.log('product-option-flow-result====================================');
  console.log(result);
  console.log('product-option-flow-result====================================');
  const data = {
    productName: product?.name,
    productOptions: result,
    flowId: flow?.type === 'flow' && flow?.data.flowId,
    flowName: flow?.type === 'flow' && flow?.data.flowName,
  };

  return data;
};
