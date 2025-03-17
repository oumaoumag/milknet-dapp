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
