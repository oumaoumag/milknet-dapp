// src/utils/contractCalls.js
export const fetchBatches = async (contract) => {
  const batchCount = await contract.batchCounter();
  const batches = [];
  
  for (let i = 1; i <= batchCount; i++) {
    const batch = await contract.getMilkBatch(i);
    batches.push(batch);
  }
  
  return batches;
};