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
  try {
    // Handle case where priceWei might be a number or a string instead of BigInt
    if (typeof priceWei === 'number' || (typeof priceWei === 'string' && priceWei.includes('.'))) {
      // If it's already a number with decimals, just format it
      return parseFloat(priceWei).toFixed(4);
    }
    
    // Otherwise use ethers.formatUnits which expects a BigInt or string representation
    return parseFloat(ethers.formatUnits(priceWei, 'ether')).toFixed(4);
  } catch (error) {
    console.error('Error formatting price:', error, priceWei, typeof priceWei);
    // Return a fallback value
    return '0.0000';
  }
}