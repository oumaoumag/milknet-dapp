import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { kesToEth, ethToKes, safeEthFormat } from '../../utils/currencyUtils';

export default function CreateBatch({ onClose }) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currencyType, setCurrencyType] = useState('ETH'); // Default to ETH

  const { contract } = useWeb3();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert('Please connect to a supported network');
      return;
    }
    // validating quantity: must be a positive whole number
    if (!/^\d+$/.test(quantity) || quantity === '') {
      alert('Quantity must be a positive whole number');
      return;
    }

    // Convert price to ETH if needed, then to Wei
    let priceInEth = price;
    if (currencyType === 'KSH') {
      // Use the safe ETH formatter to avoid decimal precision errors
      priceInEth = safeEthFormat(kesToEth(price), 18);
    }
    
    const priceWei = ethers.parseUnits(priceInEth, 'ether');
    const MAX_UINT64 = (1n << 64n) - 1n;
    if (priceWei > MAX_UINT64) {
      alert("Price per liter is too high")
      return;
    }

    try {
      // Calculate days until expiry
      const expiryDate = new Date(expiry);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const expiryDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

     
      if (expiryDays > 365) {
        alert(`Maximum expiry duration is 1 year (365 days)`);
        return;
      }

      setIsLoading(true);
      // Convert to ETH if price is in KSH
      let finalPrice = price;
      if (currencyType === 'KSH') {
        // Use the safe ETH formatter to avoid decimal precision errors
        finalPrice = safeEthFormat(kesToEth(price), 18);
      }

      await contract.registerMilkBatch(
        quantity,
        ethers.parseUnits(finalPrice, 'ether'),
        expiryDays
      );
      onClose();
    } catch (error) {
      console.error('Batch registration failed:', error);
      alert(`Registration failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Register New Milk Batch</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity (Liters)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter quantity in liters"
            min="1"
            step="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Liter
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={`Enter price per liter in ${currencyType}`}
                step={currencyType === 'ETH' ? "0.0001" : "1"}
                min={currencyType === 'ETH' ? "0.0001" : "1"}
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
                    if (newCurrency === 'KSH' && currencyType === 'ETH') {
                      setPrice(Math.round(ethToKes(price)).toString());
                    } else if (newCurrency === 'ETH' && currencyType === 'KSH') {
                      setPrice(kesToEth(price).toFixed(4));
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
              Equivalent: ~{kesToEth(price).toFixed(6)} ETH
            </p>
          )}
          {currencyType === 'ETH' && price && (
            <p className="text-xs text-gray-500 mt-1">
              Equivalent: ~{Math.round(ethToKes(price)).toLocaleString()} KSH
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Registering...
              </>
            ) : 'Register Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}