import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getProductsByIds, getProductWithAvailability, searchProducts } from './tools/product_discovery';
import { checkRealTimeAvailability, findBranchesWithProduct } from './tools/location_and_inventory';
import { calculateDelivery, getAllZonesAndAreas, getDeliveryOptions } from './tools/delivery_and_service';
import { getRecommendations, suggestAlternatives } from './tools/smart_recommendation';
import { cancelOrder, createOrder, getBranchInfo, getOrderDetails } from './tools/order_and_service';
import { createCustomerProfile, getCustomerProfile } from './tools/customer';
import { createReview } from './tools/review';

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
getProductsByIds(server);

// location and inventory tools
findBranchesWithProduct(server);
checkRealTimeAvailability(server);

// delivery and services
getDeliveryOptions(server);
calculateDelivery(server);
getAllZonesAndAreas(server);

// smart recommendation
getRecommendations(server);
suggestAlternatives(server);

// order and service
createOrder(server);
getBranchInfo(server);
getOrderDetails(server);
cancelOrder(server);

// customer
getCustomerProfile(server);
createCustomerProfile(server);

// review
createReview(server);

const main = async () => {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error('error', error);
  }
};

main();
