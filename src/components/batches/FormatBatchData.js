import { ethers } from 'ethers';
  
  export default function FormatBatchData(rawBatches) {
    return rawBatches
      .filter(batch => batch.isAvailable)
      .map(batch => ({
        ...batch,
        quantity: ethers.formatUnits(batch.quantity, 'wei'),
        pricePerLiter: ethers.formatUnits(batch.pricePerLiter, 'wei'),
        expiryDate: new Date(batch.expiryDate * 1000).toLocaleDateString(),
        daysRemaining: Math.floor((batch.expiryDate - Math.floor(Date.now()/1000)) / 86400)
      }));
  };