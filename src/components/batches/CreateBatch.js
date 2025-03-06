import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';

export default function CreateBatch({ onClose }) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { contract } = useWeb3();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert('Please connect to a supported network');
      return;
    }

    const priceWei = ethers.parseUnits(price, 'ether');
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
      await contract.registerMilkBatch(
        ethers.parseUnits(quantity, 'ether'),
        ethers.parseUnits(price, 'ether'),
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
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Liter (ETH)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter price per liter"
            step="0.0001"
            min="0.0001"
            required
          />
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