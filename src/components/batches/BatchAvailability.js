import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';

/**
 * Component for managing batch availability
 * @param {Object} props - Component props
 * @param {Object} props.batch - Batch data object
 * @param {Function} props.onUpdate - Callback function after successful update
 */
const BatchAvailability = ({ batch, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { contract } = useWeb3();

  // Extract batch availability status from flags
  const isAvailable = batch ? (BigInt(batch.flags) & BigInt(0x1)) !== BigInt(0) : false;
  
  const handleToggleAvailability = async () => {
    if (!contract) {
      toast.error('Contract not initialized. Please check your wallet connection.');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.toggleBatchAvailability(batch.batchId);
      
      toast.info(
        `Transaction submitted. ${isAvailable ? 'Disabling' : 'Enabling'} batch availability...`,
        { autoClose: 5000 }
      );
      
      await tx.wait();
      
      toast.success(`Batch ${isAvailable ? 'disabled' : 'enabled'} successfully!`);
      
      // Call the onUpdate function to refresh the data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling batch availability:', error);
      toast.error(formatBlockchainError(error) || 'Failed to toggle batch availability');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckExpiry = async () => {
    if (!contract) {
      toast.error('Contract not initialized. Please check your wallet connection.');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.checkBatchExpiry(batch.batchId);
      
      toast.info('Checking batch expiry status...');
      
      await tx.wait();
      
      toast.success('Batch expiry check completed!');
      
      // Call the onUpdate function to refresh the data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error checking batch expiry:', error);
      toast.error(formatBlockchainError(error) || 'Failed to check batch expiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleToggleAvailability}
        disabled={loading}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          isAvailable
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50`}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : isAvailable ? 'Disable Batch' : 'Enable Batch'}
      </button>
      
      <button
        onClick={handleCheckExpiry}
        disabled={loading}
        className="px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Expiry'}
      </button>
    </div>
  );
};

export default BatchAvailability;
