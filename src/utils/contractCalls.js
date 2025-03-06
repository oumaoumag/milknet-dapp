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
    return [];
  }
};
