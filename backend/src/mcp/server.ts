import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getProductWithAvailability, searchProducts } from './tools/product_discovery';
import { checkRealTimeAvailability, findBranchesWithProduct } from './tools/location_and_inventory';
import { calculateDelivery, getDeliveryOptions } from './tools/delivery_and_service';
import { getRecommendations, suggestAlternatives } from './tools/smart_recommendation';
import { createOrder, getBranchInfo } from './tools/order_and_service';
import { createCustomerProfile, getCustomerProfile } from './tools/customer';

export const server = new McpServer({
  name: 'Credobyte-MCP-Server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
});

// product discovery tools
searchProducts(server);
getProductWithAvailability(server);

// location and inventory tools
findBranchesWithProduct(server);
checkRealTimeAvailability(server);

// delivery and services
getDeliveryOptions(server);
calculateDelivery(server);

// smart recommendation
getRecommendations(server);
suggestAlternatives(server);

// order and service
createOrder(server);
getBranchInfo(server);

// customer
getCustomerProfile(server);
createCustomerProfile(server);

const main = async () => {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error('error', error);
  }
};

main();
