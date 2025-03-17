// Currency conversion utilities
const ETH_TO_KES_RATE = 155000; // Example rate: 1 ETH = 155,000 KES

/**
 * Converts ETH amount to KES
 * @param {number|string} ethAmount - Amount in ETH
 * @returns {number} Amount in KES
 */
export function ethToKes(ethAmount) {
  return parseFloat(ethAmount) * ETH_TO_KES_RATE;
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
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Safely formats an Ethereum value with appropriate decimal precision for blockchain transactions
 * Ensures the resulting string will not cause "too many decimals" errors
 * 
 * @param {number|string} value - The Ethereum value to format
 * @param {number} decimals - Maximum number of decimal places (default: 18 for Ethereum)
 * @returns {string} - Ethereum amount formatted with appropriate precision
 */
export function safeEthFormat(value, decimals = 18) {
  // If the value is already a string with a decimal point, ensure it doesn't exceed max decimals
  if (typeof value === 'string' && value.includes('.')) {
    return parseFloat(value).toFixed(decimals);
  }
  
  // If it's a number, format it with fixed decimals
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  
  // For BigInt or other formats, try to convert to a string first
  try {
    return parseFloat(value.toString()).toFixed(decimals);
  } catch (error) {
    console.error('Error formatting ETH value:', error);
    return '0';
  }
}
