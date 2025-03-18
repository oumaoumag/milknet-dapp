/* global BigInt */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ethToKes, kesToEth, formatKesAmount, formatDisplayPrice, safeEthFormat } from '../../utils/currencyUtils';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';
import { ethers } from 'ethers';

export default function OrderModal({ show, batch, onClose, onSubmit, status = { loading: false, error: null } }) {
  const [quantity, setQuantity] = useState('');
  const [currencyMode, setCurrencyMode] = useState('ETH'); // 'ETH' or 'KES'
  const [totalPrice, setTotalPrice] = useState('');
  const [estimatedEth, setEstimatedEth] = useState('');

  const validateInput = () => {
    // Validate input is a number
    if (quantity === '') return "Please enter a quantity";
    
    // Check that input is a valid integer
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty.toString() !== quantity.trim()) {
      return "Please enter a whole number (no decimals)";
    }
    
    // Check for positive value
    if (qty <= 0) return "Please enter a positive number";
    
    // Check for availability
    if (qty > batch.quantity) return `Only ${batch.quantity} liters available`;
    
    return null;
  };

  const handleSubmit = async () => {
    const error = validateInput();
    if (error) {
      return alert(error);
    }
    
    try {
      status.loading = true;
      status.error = '';
      
      // Use the simplified version - just pass the quantity to the parent component
      // The BatchList component will handle the full calculation
      await onSubmit(quantity);
      
      // Reset form after successful submission
      setQuantity("");
      
    } catch (error) {
      console.error("Error placing order:", error);
      status.loading = false;
      status.error = formatBlockchainError(error) || 'Failed to place order';
      
      toast.error(formatBlockchainError(error) || 'Failed to place order');
    }
  };
  
  const handleQuantityChange = (e) => {
    // Only allow positive integers
    const value = e.target.value;
    // Using regex to validate only digits
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  // Calculate total price based on quantity and price per liter
  useEffect(() => {
    if (!batch || !quantity || quantity <= 0) {
      setTotalPrice("0");
      setEstimatedEth("0");
      return;
    }

    let displayTotal = '0';

    if (quantity) {
      const pricePerLiterWei = ethers.getBigInt(batch.pricePerLiterWei);
      
      // Calculate total in wei
      const totalWei = pricePerLiterWei * BigInt(quantity);
      
      // Format to ETH for display
      const totalEth = ethers.formatEther(totalWei);
      displayTotal = totalEth;
      
      if (currencyMode === 'ETH') {
        // Format ETH price with limited decimals
        const safePrice = safeEthFormat(displayTotal, 4);
        setTotalPrice(safePrice);
        setEstimatedEth(safePrice);
      } else {
        // For KES, convert ETH to KES first
        const priceInKes = ethToKes(displayTotal);
        const totalKes = priceInKes * parseInt(quantity);
        setTotalPrice(formatKesAmount(totalKes));
        
        // Also calculate the ETH equivalent for reference
        const ethTotal = kesToEth(totalKes);
        setEstimatedEth(safeEthFormat(ethTotal, 4));
      }
    }

  }, [quantity, batch, currencyMode]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Place Your Order</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={status.loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {batch && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-500 mb-1">Batch Details</div>
              <div className="flex justify-between mb-2">
                <span>Farmer:</span>
                <span className="font-medium">{batch.farmerName || 'Farm Fresh'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Price per liter:</span>
                <span className="font-medium text-yellow-500">
                  Ξ{formatDisplayPrice(batch.pricePerLiter)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-medium">{batch.quantity} Liters</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Liters)
              </label>
              <input
                type="text"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                disabled={status.loading}
              />
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCurrencyMode('ETH')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  currencyMode === 'ETH' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                ETH
              </button>
              <button
                onClick={() => setCurrencyMode('KES')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  currencyMode === 'KES' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                KES
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Price:</span>
                <span className="font-bold text-xl">
                  {currencyMode === 'ETH' ? `Ξ${totalPrice}` : totalPrice}
                </span>
              </div>
              
              {currencyMode === 'KES' && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Estimated ETH:</span>
                  <span>Ξ{estimatedEth}</span>
                </div>
              )}
            </div>
            
            {status.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {status.error}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                disabled={status.loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-400"
                disabled={status.loading || !quantity}
              >
                {status.loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Confirm Order'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

OrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  batch: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  status: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.string
  })
};