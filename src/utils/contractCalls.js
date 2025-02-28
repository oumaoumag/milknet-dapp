export const fetchBatches = async (contract) => {
  if (!contract) {
    console.error("Contract not initialized");
    return [];
  }
  
  try {
    const batchCount = await contract.batchCounter();
    const batches = [];
    
    for (let i = 1; i <= batchCount; i++) {
      const batch = await contract.milkBatches(i);
      batches.push(batch);
    }
    
    return batches;
  } catch (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
};