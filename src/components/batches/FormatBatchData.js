import { ethers } from 'ethers';

// Export a helper function to format display prices with a reasonable number of decimal places
export function formatDisplayPrice(value) {
  if (!value) return '0.00';
  
  // Convert to a number and ensure it's not too large
  let numValue;
  
  try {
    // If the value is a very large string (like Wei value), format it properly
    if (typeof value === 'string' && value.length > 10 && !value.includes('.')) {
      // This is a wei value, use ethers to format
      try {
        return ethers.formatEther(value);
      } catch (error) {
        console.error('Error formatting price with ethers:', error);
        return (parseFloat(value) / 1e18).toFixed(6);
      }
    }
    
    numValue = parseFloat(value);
    
    // If the value is unreasonably large, it is probably a wei value
    if (numValue > 1000) {
      console.warn('Very large price detected, dividing by 1e18:', numValue);
      numValue = numValue / 1e18;
    }
    
    // Format with appropriate decimal places
    if (numValue < 0.000001) return numValue.toFixed(18);
    if (numValue < 0.0001) return numValue.toFixed(8);
    if (numValue < 0.01) return numValue.toFixed(6);
    if (numValue < 1) return numValue.toFixed(4);
    if (numValue < 1000) return numValue.toFixed(2);
    return numValue.toFixed(0);
  } catch (error) {
    console.error('Error formatting display price:', error, value);
    return '0.00';
  }
}

export default function FormatBatchData(rawBatches) {
  console.log('Raw batches:', rawBatches);
  return rawBatches.map(batch => {
    // Ensure the expiry date is treated as a number
    const expiryTimestamp = parseInt(batch.expiryDate.toString());
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Calculate days remaining properly, floor to be more accurate
    let daysRemaining = 0;
    if (expiryTimestamp > currentTimestamp) {
      daysRemaining = Math.floor((expiryTimestamp - currentTimestamp) / 86400);
    }
    
    // Safely handle the price conversion
    let pricePerLiter;
    try {
      // Log raw price to diagnose issues
      console.log('Raw batch price:', batch.pricePerLiter, 'Type:', typeof batch.pricePerLiter);
      
      // Ensure price is not too large - likely needs to be divided by 1e18
      const priceValue = batch.pricePerLiter.toString();
      
      // If the price is very large (likely in wei), use ethers.formatEther
      if (priceValue.length > 10 && !priceValue.includes('.')) {
        try {
          pricePerLiter = ethers.formatEther(priceValue);
          console.log('Converted wei to ETH:', pricePerLiter);
        } catch (error) {
          console.error('Error converting wei to ETH:', error);
          pricePerLiter = (parseFloat(priceValue) / 1e18).toString();
        }
      } else {
        pricePerLiter = priceValue;
      }
    } catch (error) {
      console.error('Error formatting price:', error);
      pricePerLiter = '0';
    }
    
    return {
      batchId: Number(batch.batchId),
      farmerAddress: batch.farmerAddress,
      quantity: Number(batch.quantity),
      pricePerLiterWei: batch.pricePerLiter.toString(), // Store as string to avoid BigInt issues
      pricePerLiter: formatDisplayPrice(pricePerLiter),
      expiryDate: new Date(expiryTimestamp * 1000),
      daysRemaining: daysRemaining,
      isExpired: daysRemaining <= 0
    };
  });
}