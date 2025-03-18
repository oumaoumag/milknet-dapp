// Currency conversion utilities
const ETH_TO_KES_RATE = 242915.22; // Current rate as of latest data from Google Finance

/**
 * Formats a price value for display with appropriate decimal places
 * @param {number|string} value - The price value to format
 * @returns {string} - Formatted price with appropriate decimal places
 */
export function formatDisplayPrice(value) {
  if (!value) return '0.00';
  
  // Convert to a number and ensure it's not too large
  let numValue;
  
  try {
    // If the value is a very large string (like Wei value), format it properly
    if (typeof value === 'string' && value.length > 10 && !value.includes('.')) {
      // This is a wei value, use ethers to format
      try {
        const ethers = require('ethers');
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

/**
 * Converts ETH amount to KES
 * @param {number|string} ethAmount - Amount in ETH
 * @returns {number} Amount in KES
 */
export function ethToKes(ethAmount) {
  // Handle large values that might be in wei
  if (typeof ethAmount === 'string' && ethAmount.length > 10 && !ethAmount.includes('.')) {
    // If it's a wei value, convert to ETH first
    try {
      const ethers = require('ethers');
      ethAmount = ethers.formatEther(ethAmount);
    } catch (error) {
      console.error('Error converting large value to ETH:', error);
      // Fallback: Normalize very large numbers by dividing by 1e18
      ethAmount = parseFloat(ethAmount) / 1e18;
    }
  }
  
  // Ensure the value is reasonable
  const parsedAmount = parseFloat(ethAmount);
  
  // If value is unreasonably large, it might still be in wei
  if (parsedAmount > 10000) {
    console.warn('Unusually large ETH value detected:', parsedAmount);
    return (parsedAmount / 1e18) * ETH_TO_KES_RATE;
  }
  
  return parsedAmount * ETH_TO_KES_RATE;
}

/**
 * Converts KES amount to ETH
 * @param {number|string} kesAmount - Amount in KES
 * @returns {number} Amount in ETH
 */
export function kesToEth(kesAmount) {
  return parseFloat(kesAmount) / ETH_TO_KES_RATE;
}

/**
 * Format KES amount for display
 * @param {number|string} amount - Amount in KES
 * @returns {string} Formatted KES amount
 */
export function formatKesAmount(amount) {
  // Handle unreasonably large values
  let parsedAmount = parseFloat(amount);
  if (parsedAmount > 1e12) {
    console.warn('Unusually large KES value detected, normalizing:', parsedAmount);
    parsedAmount = parsedAmount / 1e18;
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(parsedAmount);
}

// Export the rate constant so it can be imported elsewhere
export const CURRENT_ETH_TO_KES_RATE = ETH_TO_KES_RATE;

/**
 * Safely formats an Ethereum value with appropriate decimal precision for blockchain transactions
 * Ensures the resulting string will not cause "too many decimals" errors
 * 
 * @param {number|string} value - The Ethereum value to format
 * @param {number} decimals - Maximum number of decimal places (default: 6 for Ethereum)
 * @returns {string} - Ethereum amount formatted with appropriate precision
 */
export function safeEthFormat(value, decimals = 6) {
  try {
    // If the value is null, undefined or empty string
    if (value === null || value === undefined || value === '') {
      return '0';
    }
    
    // Handle ethers BigNumber objects if needed
    if (value && typeof value === 'object' && value._isBigNumber) {
      try {
        const ethers = require('ethers');
        return ethers.formatUnits(value, decimals);
      } catch (error) {
        console.error('Error formatting BigNumber:', error);
      }
    }
    
    // Convert string values that might be large wei values
    if (typeof value === 'string' && value.length > 10 && !value.includes('.')) {
      try {
        const ethers = require('ethers');
        return ethers.formatUnits(value, 18);
      } catch (error) {
        console.error('Error formatting large value:', error);
        // Fallback for very large strings
        value = parseFloat(value) / 1e18;
      }
    }
    
    // For very small values, we need to ensure they don't have too many decimals
    const floatValue = parseFloat(value);
    if (isNaN(floatValue)) {
      return '0';
    }
    
    // Keep at most 6 decimal places for any value for safety
    // This prevents "too many decimals" errors in ethers
    const formattedValue = floatValue.toFixed(decimals);
    
    // Remove trailing zeros and decimal point if needed
    return formattedValue.replace(/\.?0+$/, "") || '0';
  } catch (error) {
    console.error('Error in safeEthFormat:', error, value);
    return '0';
  }
}
