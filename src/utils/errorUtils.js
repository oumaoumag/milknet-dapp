import { ethers } from 'ethers';

/**
 * Formats blockchain error messages into user-friendly messages
 * @param {Error} error - The error object from a blockchain transaction
 * @returns {string} - A user-friendly error message
 */
export const formatBlockchainError = (error) => {
  // Default error message
  let userFriendlyMessage = 'An error occurred while processing your transaction. Please try again.';
  
  // Check if error message exists
  if (!error || !error.message) return userFriendlyMessage;
  
  const errorMessage = error.message.toLowerCase();
  const errorInfo = error.info || {};
  
  // Handle insufficient funds errors
  if (errorMessage.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
    try {
      // Try to extract the current balance and required amount if available
      const match = errorMessage.match(/have\s+(\d+)\s+want\s+(\d+)/);
      if (match && match.length >= 3) {
        const haveWei = match[1];
        const wantWei = match[2];
        
        // Convert wei to ETH for more readable values
        const haveEth = parseFloat(ethers.formatEther(haveWei)).toFixed(4);
        const wantEth = parseFloat(ethers.formatEther(wantWei)).toFixed(4);
        
        return `You don't have enough ETH to complete this transaction. You have ${haveEth} ETH but need ${wantEth} ETH. Please add funds to your wallet and try again.`;
      }
      
      return 'Your wallet doesn\'t have enough ETH to complete this transaction. Please add funds and try again.';
    } catch (parseError) {
      // If we can't parse the values, use a generic message
      return 'Your wallet doesn\'t have enough ETH to complete this transaction. Please add funds and try again.';
    }
  }
  
  // Handle user rejected transaction errors
  if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    return 'Transaction was cancelled.';
  }
  
  // Handle gas estimation failures
  if (errorMessage.includes('gas required exceeds') || errorMessage.includes('gas limit')) {
    return 'This transaction would require too much gas to execute. It might be failing due to an error in the contract.';
  }
  
  // Handle transaction underpriced
  if (errorMessage.includes('underpriced') || errorMessage.includes('replacement fee too low')) {
    return 'Transaction fee is too low. Please increase the gas price and try again.';
  }
  
  // Handle nonce errors
  if (errorMessage.includes('nonce')) {
    return 'There is a transaction queue issue with your wallet. Try refreshing the page or resetting your wallet\'s transaction history.';
  }
  
  // Handle network or connection issues
  if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('disconnected')) {
    return 'Network connection issue detected. Please check your internet connection and try again.';
  }
  
  // Handle contract execution errors
  if (errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
    // Try to extract the revert reason if available
    const revertReasonMatch = errorMessage.match(/reverted with reason string ['"](.+?)['"]/);
    if (revertReasonMatch && revertReasonMatch[1]) {
      return `Transaction failed: ${revertReasonMatch[1]}`;
    }
    return 'The transaction was rejected by the smart contract. This might be due to failing a condition check.';
  }
  
  // Fallback for unknown errors
  return userFriendlyMessage;
};
