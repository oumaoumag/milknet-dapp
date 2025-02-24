export const fetchBatches = async (contract) => {
    const batchCount = await contract.batchCounter();
    const batches = [];
    
    for (let i = 1; i <= batchCount; i++) {
      batches.push(await contract.getMilkBatch(i));
    }
    
    return batches;
  };
  
  export const fetchFarmers = async (contract) => {
    const farmerCount = await contract.farmerCounter();
  };