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
export const templates = Object.freeze({
  whatsappFlow: {
    zoneAndAreaFlow: prebuiltFlowJson,
  },
});
