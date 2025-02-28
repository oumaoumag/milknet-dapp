import { ethers } from 'ethers';
  
export default function FormatBatchData(rawBatches) {
  return rawBatches
    .filter(batch => batch.isAvailable)
    .map(batch => {
      // Convert BigInt values to strings or numbers before calculations
      const quantityNum = Number(ethers.formatUnits(batch.quantity, 'wei'));
      const priceNum = Number(ethers.formatUnits(batch.pricePerLiter, 'wei'));
      const expiryTimestamp = Number(batch.expiryDate);
      const currentTimestamp = Math.floor(Date.now()/1000);
      
      return {
        ...batch,
        quantity: quantityNum,
        pricePerLiter: priceNum,
        expiryDate: new Date(expiryTimestamp * 1000),
        daysRemaining: Math.floor((expiryTimestamp - currentTimestamp) / 86400)
      };
    });
}

// New helper function for price display
export function formatDisplayPrice(priceWei) {
  return parseFloat(ethers.formatUnits(priceWei, 'ether')).toFixed(4);
}