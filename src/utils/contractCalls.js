import { formatBlockchainError } from './errorUtils';

/**
 * Fetch all active milk batches from the contract
 * @param {Object} contract - The ethers.js contract instance
 * @returns {Array} - Array of batch objects
 */
export const fetchBatches = async (contract) => {
  if (!contract) {
    console.error("Contract not initialized");
    return [];
  }
  
  try {
    const activeBatches = await contract.getActiveBatches();
    console.log('Fetched active batches:', activeBatches);
    return activeBatches;
  } catch (error) {
    console.error("Error fetching active batches:", error);
    // You can throw the formatted error if you want to display it to the user
    // throw new Error(formatBlockchainError(error));
    return [];
  }
};

/**
 * Fetch all orders for a buyer from the contract
 * @param {Object} contract - The ethers.js contract instance
 * @param {string} buyerAddress - The buyer's Ethereum address
 * @returns {Array} - Array of order objects
 */
export const fetchBuyerOrders = async (contract, buyerAddress) => {
  if (!contract || !buyerAddress) {
    console.error("Contract or buyer address not provided");
    return [];
  }
  
  try {
    // Get the number of orders for this buyer
    const orderCount = await contract.getBuyerOrderCount(buyerAddress);
    console.log(`Buyer has ${orderCount} orders`);
    
    // Fetch all order IDs for this buyer
    const orderIds = await contract.getBuyerOrders(buyerAddress);
    
    // Fetch details for each order
    const orders = await Promise.all(
      orderIds.map(async (orderId) => {
        const order = await contract.getOrderDetails(orderId);
        return order;
      })
    );
    
    return orders;
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    // You can throw the formatted error if you want to display it to the user
    // throw new Error(formatBlockchainError(error));
    return [];
  }
};

/**
 * Fetch all orders for a farmer from the contract
 * @param {Object} contract - The ethers.js contract instance
 * @param {string} farmerAddress - The farmer's Ethereum address
 * @returns {Array} - Array of order objects
 */
export const fetchFarmerOrders = async (contract, farmerAddress) => {
  if (!contract || !farmerAddress) {
    console.error("Contract or farmer address not provided");
    return [];
  }
  
  try {
    // Fetch all batch IDs for this farmer
    const batchIds = await contract.getFarmerBatches(farmerAddress);
    
    // For each batch, get all orders
    let allOrders = [];
    for (const batchId of batchIds) {
      const orderIds = await contract.getBatchOrders(batchId);
      
      // Fetch details for each order
      const batchOrders = await Promise.all(
        orderIds.map(async (orderId) => {
          const order = await contract.getOrderDetails(orderId);
          return order;
        })
      );
      
      allOrders = [...allOrders, ...batchOrders];
    }
    
    return allOrders;
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    // You can throw the formatted error if you want to display it to the user
    // throw new Error(formatBlockchainError(error));
    return [];
  }
};
