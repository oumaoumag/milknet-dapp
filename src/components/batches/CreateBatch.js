import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { kesToEth, ethToKes, formatDisplayPrice } from '../../utils/currencyUtils';
import { toast } from 'react-toastify';

export default function CreateBatch({ onClose }) {
  const { contract } = useWeb3();
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currencyType, setCurrencyType] = useState('ETH');

  const handlePriceChange = (e) => {
    const value = e.target.value;
    
    // Validate input - only allow numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!quantity || !price || !expiry) {
      alert('Please fill all fields');
      return;
    }

    // Check for reasonable values
    const numericPrice = parseFloat(price);
    const numericQuantity = parseFloat(quantity);

    if (numericPrice <= 0 || numericQuantity <= 0) {
      alert('All values must be greater than zero');
      return;
    }

    // Warn if values seem unreasonable
    if (currencyType === 'ETH' && numericPrice > 10) {
      if (!window.confirm(`The price per liter is ${numericPrice} ETH, which is quite high. Are you sure this is correct?`)) {
        return;
      }
    } else if (currencyType === 'KSH' && numericPrice < 10) {
      if (!window.confirm(`The price per liter is ${numericPrice} KSH, which is quite low. Are you sure this is correct?`)) {
        return;
      }
    }

    try {
      if (!contract) {
        alert('Please connect your wallet first');
        return;
      }

      // Calculate days until expiry
      const expiryDate = new Date(expiry);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const expiryDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
      if (expiryDays <= 0) {
        alert('Expiry date must be in the future');
        return;
      }
      
      if (expiryDays > 365) {
        alert('Maximum expiry duration is 1 year (365 days)');
        return;
      }

      setIsLoading(true);
      // Convert to ETH if price is in KSH
      let finalPrice;
      
      try {
        if (currencyType === 'KSH') {
          const ethValue = kesToEth(price);
          console.log(`Converting KSH ${price} to ETH: ${ethValue}`);
          
          // Handle small values that could cause precision errors
          finalPrice = ethValue.toFixed(18);
          // Remove trailing zeros
          finalPrice = finalPrice.replace(/\.?0+$/, "");
          if (finalPrice.endsWith('.')) finalPrice += '0';
          
          console.log(`Formatted ETH price: ${finalPrice}`);
        } else {
          // Make sure we have a proper format for ETH values
          finalPrice = parseFloat(price).toFixed(18);
          // Remove trailing zeros
          finalPrice = finalPrice.replace(/\.?0+$/, "");
          if (finalPrice.endsWith('.')) finalPrice += '0';
        }

        // Log what we're about to submit
        console.log(`Submitting batch: quantity=${quantity}, price=${finalPrice} ETH, expiryDays=${expiryDays}`);
        
        // Convert to wei for the contract - use a safer way to parse ether
        const priceInWei = ethers.parseUnits(finalPrice, "ether");
        console.log(`Price in wei: ${priceInWei.toString()}`);
        
        await contract.registerMilkBatch(
          quantity,
          priceInWei,
          expiryDays
        );
        
        toast.success("Milk batch registered successfully!");
        onClose();
      } catch (error) {
        console.error('Price conversion error:', error);
        toast.error(`Failed to convert price: ${error.message}`);
      }
    } catch (error) {
      console.error('Batch registration failed:', error);
      toast.error(`Registration failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Register New Milk Batch</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Liters):</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter quantity in liters"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Liter:</label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={`Enter price in ${currencyType}`}
                required
              />
            </div>
            <div className="w-24">
              <select
                value={currencyType}
                onChange={(e) => {
                  const newCurrency = e.target.value;
                  // Convert price value when switching currency type
                  if (price && price !== '') {
                    try {
                      if (newCurrency === 'KSH' && currencyType === 'ETH') {
                        const kesValue = ethToKes(price);
                        console.log(`Converting ETH ${price} to KES: ${kesValue}`);
                        setPrice(Math.round(kesValue).toString());
                      } else if (newCurrency === 'ETH' && currencyType === 'KSH') {
                        const ethValue = kesToEth(price);
                        console.log(`Converting KES ${price} to ETH: ${ethValue}`);
                        
                        // Format to avoid too many decimals
                        const formattedEth = ethValue.toFixed(6);
                        setPrice(formattedEth);
                      }
                    } catch (error) {
                      console.error('Currency conversion error:', error);
                      // Keep the price but reset it to empty if there's an error
                      setPrice('');
                    }
                  }
                  setCurrencyType(newCurrency);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="ETH">ETH</option>
                <option value="KSH">KSH</option>
              </select>
            </div>
          </div>
          {currencyType === 'KSH' && price && (
            <p className="text-xs text-gray-500 mt-1">
              Equivalent: ~{formatDisplayPrice(kesToEth(price))} ETH
            </p>
          )}
          {currencyType === 'ETH' && price && (
            <p className="text-xs text-gray-500 mt-1">
              Equivalent: ~{new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                maximumFractionDigits: 0
              }).format(ethToKes(price))}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date:</label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300"
          >
            {isLoading ? 'Processing...' : 'Register Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}