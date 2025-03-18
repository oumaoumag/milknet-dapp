gi/**
 * Format a Unix timestamp to a readable date string
 * @param {number|string} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculate days left until expiry based on a Unix timestamp
 * @param {number|string} expiryTimestamp - Unix timestamp in seconds
 * @returns {number} Number of days left (can be negative if expired)
 */
export const calculateDaysLeft = (expiryTimestamp) => {
  if (!expiryTimestamp) return 0;
  
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const expiryTime = parseInt(expiryTimestamp);
  const secondsLeft = expiryTime - now;
  
  // Convert seconds to days, rounded down
  return Math.floor(secondsLeft / (60 * 60 * 24));
};

// Constants for conversion
const ETH_TO_KES_RATE = 155000; // 1 ETH ≈ 155,000 KES
const WEI_TO_ETH = 1e18; // 1 ETH = 10^18 wei

// Convert wei to ETH with proper decimal handling
export const convertToEth = (weiAmount) => {
  if (!weiAmount) return '0';
  
  // Convert from wei to ETH with 6 decimal places precision
  const ethValue = parseFloat(weiAmount) / WEI_TO_ETH;
  return ethValue.toFixed(6);
};

// Convert wei to KES with proper decimal handling
export const convertToKES = (weiAmount) => {
  if (!weiAmount) return '0';
  
  // Convert from wei to ETH first, then to KES
  const ethValue = parseFloat(weiAmount) / WEI_TO_ETH;
  const kesValue = ethValue * ETH_TO_KES_RATE;
  
  // Format as whole number for KES
  return Math.round(kesValue).toLocaleString();
};

// Convert KES to ETH (for display purposes)
export const convertKEStoETH = (kesAmount) => {
  if (!kesAmount) return '0';
  
  const ethValue = parseFloat(kesAmount) / ETH_TO_KES_RATE;
  return ethValue.toFixed(6);
};

// Convert ETH to wei for blockchain transactions
export const convertEthToWei = (ethAmount) => {
  if (!ethAmount) return '0';
  
  // Use a library like ethers.js parseEther in actual implementation
  const weiValue = parseFloat(ethAmount) * WEI_TO_ETH;
  return weiValue.toString();
};

// Format ETH display with symbol
export const formatETH = (ethAmount) => {
  if (!ethAmount) return 'Ξ0.000000';
  return `Ξ${parseFloat(ethAmount).toFixed(6)}`;
};

// Format KES display with symbol
export const formatKES = (kesAmount) => {
  if (!kesAmount) return 'Ksh 0';
  return `Ksh ${parseFloat(kesAmount).toLocaleString()}`;
};

/**
 * Format blockchain error messages to be more user-friendly
 * @param {Error} error - Error object from Web3 or contract interaction
 * @returns {string} Formatted error message
 */
export const formatBlockchainError = (error) => {
  if (!error) return 'Unknown error occurred';
  
  // Check if the error has a message property
  if (error.message) {
    // Check for common error messages and provide more user-friendly versions
    if (error.message.includes('User denied transaction signature')) {
      return 'Transaction was rejected in your wallet';
    }
    
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds in your wallet to complete this transaction';
    }
    
    if (error.message.includes('execution reverted')) {
      // Extract the revert reason if available
      const revertReason = error.message.match(/reverted: (.*?)(?:,|$)/);
      if (revertReason && revertReason[1]) {
        return `Transaction failed: ${revertReason[1]}`;
      }
      return 'Transaction failed on the blockchain';
    }
    
    // Return the original message if no specific pattern was matched
    return error.message;
  }
  
  // If the error is just a string
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return 'Error occurred during blockchain transaction';
};

/**
 * Truncate an Ethereum address for display
 * @param {string} address - Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Convert a price from one currency to another
 * @param {number|string} price - Price to convert
 * @param {string} fromCurrency - Source currency ('ETH' or 'KES')
 * @param {string} toCurrency - Target currency ('ETH' or 'KES')
 * @param {number} rate - Exchange rate (KES per ETH)
 * @returns {string} Converted price
 */
export const convertCurrency = (price, fromCurrency, toCurrency, rate = 45000) => {
  if (!price) return '0';
  
  const numericPrice = parseFloat(price);
  
  if (fromCurrency === toCurrency) return numericPrice.toString();
  
  if (fromCurrency === 'ETH' && toCurrency === 'KES') {
    return (numericPrice * rate).toFixed(0);
  }
  
  if (fromCurrency === 'KES' && toCurrency === 'ETH') {
    return (numericPrice / rate).toFixed(6);
  }
  
  return numericPrice.toString();
};

/**
 * Format a number as currency
 * @param {number|string} value - Value to format
 * @param {string} currency - Currency type ('ETH' or 'KES')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'ETH') => {
  if (!value) return currency === 'ETH' ? '0 ETH' : 'KES 0';
  
  const numericValue = parseFloat(value);
  
  if (currency === 'ETH') {
    return `${numericValue.toFixed(6)} ETH`;
  } else {
    return `KES ${new Intl.NumberFormat('en-US').format(Math.round(numericValue))}`;
  }
}; 