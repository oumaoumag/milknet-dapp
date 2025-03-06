import { ethers } from 'ethers';

export default function FormatBatchData(rawBatches) {
  console.log('Raw batches:', rawBatches);
  return rawBatches.map(batch => {
    const expiryTimestamp = Number(batch.expiryDate);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const daysRemaining = Math.max(0, Math.floor((expiryTimestamp - currentTimestamp) / 86400));
    
    return {
      batchId: Number(batch.batchId),
      farmerAddress: batch.farmerAddress,
      quantity: Number(batch.quantity),
      pricePerLiterWei: batch.pricePerLiter,
      pricePerLiter: Number(ethers.formatUnits(batch.pricePerLiter, 'ether')),
      expiryDate: new Date(expiryTimestamp * 1000),
      daysRemaining: daysRemaining,
      isExpired: expiryTimestamp < currentTimestamp
    };
  });
}

// New helper function for price display
export function formatDisplayPrice(priceWei) {
  return parseFloat(ethers.formatUnits(priceWei, 'ether')).toFixed(4);
}