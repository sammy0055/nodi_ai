import { WhatsappFlowLabel } from '../../types/whatsapp-settings';

const prebuiltFlowJson = {
  version: '7.2',
  data_api_version: '3.0',
  screens: [
    {
      id: 'ADDRESS_SELECTION',
      title: 'Address Selection',
      terminal: true,
      data: {
        zones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
            },
          },
          __example__: [],
        },
        areas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
            },
          },
          __example__: [],
        },
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'address_form',
            children: [
              {
                type: 'Dropdown',
                name: 'zone_id',
                label: 'Zone',
                required: true,
                'data-source': '${data.zones}',
                'on-select-action': {
                  name: 'data_exchange',
                  payload: {
                    zone_id: '${form.zone_id}',
                  },
                },
              },
              {
                type: 'Dropdown',
                name: 'area_id',
                label: 'Area',
                required: true,
                'data-source': '${data.areas}',
              },
              {
                type: 'TextInput',
                name: 'note',
                label: 'Street, building ...',
                'input-type': 'text',
                required: true,
                'max-chars': 600,
                'helper-text': 'Up to 600 chars',
              },
              {
                type: 'Footer',
                label: 'Complete',
                'on-click-action': {
                  name: 'complete',
                  payload: {
                    zone_id: '${form.zone_id}',
                    area_id: '${form.area_id}',
                    note: '${form.note}',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
  routing_model: {
    ADDRESS_SELECTION: [],
  },
};

const prebuiltBranchesFlowJson = {
  version: '7.2',
  screens: [
    {
      id: 'BRANCH_SELECTION',
      title: 'Branch Selection',
      terminal: true,
      success: true,
      data: {
        branches: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
            },
          },
          __example__: [
            { id: '1', title: 'branche a' },
            { id: '2', title: 'branche b' },
          ],
        },
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'address_form',
            children: [
              {
                type: 'Dropdown',
                name: 'branch_id',
                label: 'Branch',
                required: true,
                'data-source': '${data.branches}',
              },
              {
                type: 'Footer',
                label: 'Complete',
                'on-click-action': {
                  name: 'complete',
                  payload: {
                    branch_id: '${form.branch_id}',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

const prebuiltOptionsFlowJson = {
  version: '7.3',
  screens: [
    {
      id: 'PRODUCT_OPTIONS_SELECTIONS',
      title: 'Product Options Selection',
      terminal: true,
      success: true,
      data: {
        flowLabel: { type: 'string', __example__: '' },
        // add ingredent 1
        Add_Ingredient: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Add Ingredient',
            description: 'Add an extra ingredient to the product. Example: add cheese, add bacon, add olives.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Remove Ingredient 2
        Remove_Ingredient: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Remove Ingredient',
            description: 'Remove an existing ingredient from the product. Example: no onions, no pickles.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Add Side 3
        Add_Side: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Add Side',
            description: 'Add a side item to the order. Example: add imported fries, add coleslaw.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Add Drink 4
        Add_Drink: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Add Drink',
            description: 'Add a beverage to the order. Example: add Pepsi, add Coke, add water.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Spice Level 5
        Spice_Level: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Spice Level',
            description: 'Adjust how spicy the food should be. Example: mild, medium, extra spicy.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Cooking Preference 6
        Cooking_Preference: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Cooking Preference',
            description: 'Specify how the food should be cooked. Example: well done, medium rare.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Size 7
        Size: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Size',
            description: 'Select size. Example: regular, large, family size.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Add Sauce 8
        Add_Sauce: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Add Sauce',
            description: 'Add extra sauce. Example: extra garlic sauce, extra ketchup.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Remove Sauce 9
        Remove_Sauce: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Remove Sauce',
            description: 'Remove a sauce from the product. Example: no mayo, no BBQ sauce.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Extra_Protein 10
        Extra_Protein: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Extra Protein',
            description: 'Increase protein quantity. Example: double chicken, extra beef.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
        // Special_Instructions 11
        Special_Instructions: {
          type: 'object',
          properties: {
            visible: { type: 'boolean' },
            required: { type: 'boolean' },
            label: { type: 'string' },
            description: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
          __example__: {
            visible: false,
            required: false,
            label: 'Special Instructions',
            description: 'Free-text instructions from customer. Example: cut in half, pack separately.',
            // options: [
            //   { id: '12', title: 'add ingredent one' },
            //   { id: '123', title: '3 add ingredent one' },
            // ],
          },
        },
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'TextHeading',
            text: 'Select Your Preferences',
          },
          // option_1 : Add_Ingredient
          {
            type: 'CheckboxGroup',
            name: 'Add_Ingredient',
            label: '${data.Add_Ingredient.label}',
            description: '${data.Add_Ingredient.description}',
            visible: '${data.Add_Ingredient.visible}',
            required: '${data.Add_Ingredient.required}',
            'data-source': '${data.Add_Ingredient.options}',
          },
          // option_2: Remove_Ingredient
          {
            type: 'CheckboxGroup',
            name: 'Remove_Ingredient',
            label: '${data.Remove_Ingredient.label}',
            description: '${data.Remove_Ingredient.description}',
            visible: '${data.Remove_Ingredient.visible}',
            required: '${data.Remove_Ingredient.required}',
            'data-source': '${data.Remove_Ingredient.options}',
          },
          // option_3: Add_Side
          {
            type: 'CheckboxGroup',
            name: 'Add_Side',
            label: '${data.Add_Side.label}',
            description: '${data.Add_Side.description}',
            visible: '${data.Add_Side.visible}',
            required: '${data.Add_Side.required}',
            'data-source': '${data.Add_Side.options}',
          },
          // option_4: Add_Drink
          {
            type: 'CheckboxGroup',
            name: 'Add_Drink',
            label: '${data.Add_Drink.label}',
            description: '${data.Add_Drink.description}',
            visible: '${data.Add_Drink.visible}',
            required: '${data.Add_Drink.required}',
            'data-source': '${data.Add_Drink.options}',
          },
          // option_5: Spice_Level
          {
            type: 'RadioButtonsGroup',
            name: 'Spice_Level',
            label: '${data.Spice_Level.label}',
            visible: '${data.Spice_Level.visible}',
            required: '${data.Spice_Level.required}',
            'data-source': '${data.Spice_Level.options}',
          },
          // option_6: Cooking_Preference
          {
            type: 'RadioButtonsGroup',
            name: 'Cooking_Preference',
            label: '${data.Cooking_Preference.label}',
            description: '${data.Cooking_Preference.description}',
            visible: '${data.Cooking_Preference.visible}',
            required: '${data.Cooking_Preference.required}',
            'data-source': '${data.Cooking_Preference.options}',
          },
          // option_7: Size
          {
            type: 'RadioButtonsGroup',
            name: 'Size',
            label: '${data.Size.label}',
            description: '${data.Size.description}',
            visible: '${data.Size.visible}',
            required: '${data.Size.required}',
            'data-source': '${data.Size.options}',
          },
          // option_8: Add_Sauce
          {
            type: 'CheckboxGroup',
            name: 'Add_Sauce',
            label: '${data.Add_Sauce.label}',
            description: '${data.Add_Sauce.description}',
            visible: '${data.Add_Sauce.visible}',
            required: '${data.Add_Sauce.required}',
            'data-source': '${data.Add_Sauce.options}',
          },
          // option_9: Remove_Sauce
          {
            type: 'CheckboxGroup',
            name: 'Remove_Sauce',
            label: '${data.Remove_Sauce.label}',
            description: '${data.Remove_Sauce.description}',
            visible: '${data.Remove_Sauce.visible}',
            required: '${data.Remove_Sauce.required}',
            'data-source': '${data.Remove_Sauce.options}',
          },
          // option_10: Extra_Protein
          {
            type: 'CheckboxGroup',
            name: 'Extra_Protein',
            label: '${data.Extra_Protein.label}',
            description: '${data.Extra_Protein.description}',
            visible: '${data.Extra_Protein.visible}',
            required: '${data.Extra_Protein.required}',
            'data-source': '${data.Extra_Protein.options}',
          },
          // option_11: Special_Instructions
          {
            type: 'CheckboxGroup',
            name: 'Special_Instructions',
            label: '${data.Special_Instructions.label}',
            description: '${data.Special_Instructions.description}',
            visible: '${data.Special_Instructions.visible}',
            required: '${data.Special_Instructions.required}',
            'data-source': '${data.Special_Instructions.options}',
          },
          {
            type: 'Footer',
            label: 'Submit',
            'on-click-action': {
              name: 'complete',
              payload: {
                flowLabel: '${data.flowLabel}',
                Add_Ingredient: '${form.Add_Ingredient}',
                Remove_Ingredient: '${form.Remove_Ingredient}',
                Add_Side: '${form.Add_Side}',
                Add_Drink: '${form.Add_Drink}',
                Spice_Level: '${form.Spice_Level}',
                Cooking_Preference: '${form.Cooking_Preference}',
                Size: '${form.Size}',
                Add_Sauce: '${form.Add_Sauce}',
                Remove_Sauce: '${form.Remove_Sauce}',
                Extra_Protein: '${form.Extra_Protein}',
                Special_Instructions: '${form.Special_Instructions}',
              },
            },
          },
        ],
      },
    },
  ],
};

export const templates = Object.freeze({
  whatsappFlow: {
    zoneAndAreaFlow: prebuiltFlowJson,
    branchesFlow: prebuiltBranchesFlowJson,
  },
});

// {
//   "version": "7.3",
//   "screens": [
//     {
//       "id": "PRODUCT_OPTIONS_SELECTIONS",
//       "title": "Product Options Selection",
//       "terminal": true,
//       "success": true,
//       "data": {
//         "Add_Ingredient": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Add Ingredient",
//             "description": "Add an extra ingredient to the product. Example: add cheese, add bacon, add olives."
//           }
//         },
//         "Remove_Ingredient": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Remove Ingredient",
//             "description": "Remove an existing ingredient from the product. Example: no onions, no pickles."
//           }
//         },
//         "Add_Side": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Add Side",
//             "description": "Add a side item to the order. Example: add imported fries, add coleslaw."
//           }
//         },
//         "Add_Drink": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Add Drink",
//             "description": "Add a beverage to the order. Example: add Pepsi, add Coke, add water."
//           }
//         },
//         "Spice_Level": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Spice Level",
//             "description": "Adjust how spicy the food should be. Example: mild, medium, extra spicy."
//           }
//         },
//         "Cooking_Preference": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Cooking Preference",
//             "description": "Specify how the food should be cooked. Example: well done, medium rare."
//           }
//         },
//         "Size": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Size",
//             "description": "Select size. Example: regular, large, family size."
//           }
//         },
//         "Add_Sauce": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Add Sauce",
//             "description": "Add extra sauce. Example: extra garlic sauce, extra ketchup."
//           }
//         },
//         "Remove_Sauce": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Remove Sauce",
//             "description": "Remove a sauce from the product. Example: no mayo, no BBQ sauce."
//           }
//         },
//         "Extra_Protein": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Extra Protein",
//             "description": "Increase protein quantity. Example: double chicken, extra beef."
//           }
//         },
//         "Special_Instructions": {
//           "type": "object",
//           "properties": {
//             "visible": {
//               "type": "boolean"
//             },
//             "required": {
//               "type": "boolean"
//             },
//             "label": {
//               "type": "string"
//             },
//             "description": {
//               "type": "string"
//             },
//             "options": {
//               "type": "array",
//               "items": {
//                 "type": "object",
//                 "properties": {
//                   "id": {
//                     "type": "string"
//                   },
//                   "title": {
//                     "type": "string"
//                   }
//                 }
//               }
//             }
//           },
//           "__example__": {
//             "visible": false,
//             "required": false,
//             "label": "Special Instructions",
//             "description": "Free-text instructions from customer. Example: cut in half, pack separately."
//           }
//         }
//       },
//       "layout": {
//         "type": "SingleColumnLayout",
//         "children": [
//           {
//             "type": "TextHeading",
//             "text": "Select Your Preferences"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_1",
//             "label": "${data.Add_Ingredient.label}",
//             "description": "${data.Add_Ingredient.description}",
//             "visible": "${data.Add_Ingredient.visible}",
//             "required": "${data.Add_Ingredient.required}",
//             "data-source": "${data.Add_Ingredient.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_2",
//             "label": "${data.Remove_Ingredient.label}",
//             "description": "${data.Remove_Ingredient.description}",
//             "visible": "${data.Remove_Ingredient.visible}",
//             "required": "${data.Remove_Ingredient.required}",
//             "data-source": "${data.Remove_Ingredient.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_3",
//             "label": "${data.Add_Side.label}",
//             "description": "${data.Add_Side.description}",
//             "visible": "${data.Add_Side.visible}",
//             "required": "${data.Add_Side.required}",
//             "data-source": "${data.Add_Side.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_4",
//             "label": "${data.Add_Drink.label}",
//             "description": "${data.Add_Drink.description}",
//             "visible": "${data.Add_Drink.visible}",
//             "required": "${data.Add_Drink.required}",
//             "data-source": "${data.Add_Drink.options}"
//           },
//           {
//             "type": "RadioButtonsGroup",
//             "name": "option_5",
//             "label": "${data.Spice_Level.label}",
//             "visible": "${data.Spice_Level.visible}",
//             "required": "${data.Spice_Level.required}",
//             "data-source": "${data.Spice_Level.options}"
//           },
//           {
//             "type": "RadioButtonsGroup",
//             "name": "option_6",
//             "label": "${data.Cooking_Preference.label}",
//             "description": "${data.Cooking_Preference.description}",
//             "visible": "${data.Cooking_Preference.visible}",
//             "required": "${data.Cooking_Preference.required}",
//             "data-source": "${data.Cooking_Preference.options}"
//           },
//           {
//             "type": "RadioButtonsGroup",
//             "name": "option_7",
//             "label": "${data.Size.label}",
//             "description": "${data.Size.description}",
//             "visible": "${data.Size.visible}",
//             "required": "${data.Size.required}",
//             "data-source": "${data.Size.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_8",
//             "label": "${data.Add_Sauce.label}",
//             "description": "${data.Add_Sauce.description}",
//             "visible": "${data.Add_Sauce.visible}",
//             "required": "${data.Add_Sauce.required}",
//             "data-source": "${data.Add_Sauce.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_9",
//             "label": "${data.Remove_Sauce.label}",
//             "description": "${data.Remove_Sauce.description}",
//             "visible": "${data.Remove_Sauce.visible}",
//             "required": "${data.Remove_Sauce.required}",
//             "data-source": "${data.Remove_Sauce.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_10",
//             "label": "${data.Extra_Protein.label}",
//             "description": "${data.Extra_Protein.description}",
//             "visible": "${data.Extra_Protein.visible}",
//             "required": "${data.Extra_Protein.required}",
//             "data-source": "${data.Extra_Protein.options}"
//           },
//           {
//             "type": "CheckboxGroup",
//             "name": "option_11",
//             "label": "${data.Special_Instructions.label}",
//             "description": "${data.Special_Instructions.description}",
//             "visible": "${data.Special_Instructions.visible}",
//             "required": "${data.Special_Instructions.required}",
//             "data-source": "${data.Special_Instructions.options}"
//           },
//           {
//             "type": "Footer",
//             "label": "Submit",
//             "on-click-action": {
//               "name": "complete",
//               "payload": {}
//             }
//           }
//         ]
//       }
//     }
//   ]
// }
