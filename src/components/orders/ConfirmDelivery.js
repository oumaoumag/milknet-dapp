import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';
import { ethers } from 'ethers';

/**
 * Component for farmers to confirm delivery of orders
 * @param {Object} props - Component props
 * @param {string} props.orderId - Order ID to confirm
 * @param {string} props.buyerAddress - Address of buyer who placed the order
 * @param {Function} props.onComplete - Callback function after successful confirmation
 */
export default function ConfirmDelivery({ orderId, buyerAddress, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const { contract } = useWeb3();

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    if (!contract) {
      toast.error('Contract not initialized. Please check your wallet connection.');
      return;
    }
    
    if (!orderId || !buyerAddress) {
      toast.error('Missing order information.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the smart contract function to confirm delivery
      // In the Solidity contract, the function signature is: function confirmDelivery(uint256 _orderId)
      // No need to convert orderId to a specific format since it's already a number
      const tx = await contract.confirmDelivery(orderId);
      
      toast.info('Confirming delivery...');
      
      await tx.wait();
      
      toast.success('Order delivery confirmed successfully!');
      
      // Call the onComplete callback to refresh the UI
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error(formatBlockchainError(error) || 'Failed to confirm delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Confirm Order Delivery</h3>
      
      <form onSubmit={handleConfirm}>
        <div className="mb-4">
          <label htmlFor="deliveryNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Notes (Optional)
          </label>
          <textarea
            id="deliveryNotes"
            rows="3"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Add any notes about the delivery..."
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Confirm Delivery'}
          </button>
        </div>
      </form>
    </div>
  );
}
