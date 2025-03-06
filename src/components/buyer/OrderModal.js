import { useState } from 'react';
import PropTypes from 'prop-types';

export default function OrderModal({ show, batch, onClose, onSubmit, status }) {
  const [quantity, setQuantity] = useState('');

  const validateInput = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return "Please enter a valid number";
    if (qty <= 0) return "Quantity must be positive";
    if (qty > batch.quantity) return "Exceeds available quantity";
    return null;
  };

  const handleSubmit = () => {
    const error = validateInput();
    if (error) {
      return alert(error);
    }
    onSubmit(quantity);
  };

  if (!show || !batch) return null;

  const totalPrice = quantity && !isNaN(parseFloat(quantity)) 
    ? (parseFloat(quantity) * parseFloat(batch.pricePerLiter)).toFixed(4) 
    : '0.0000';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Order Milk Batch #{batch.batchId}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-gray-700">
            <span>Price per Liter:</span>
            <span className="text-yellow-600 font-bold">
              Ξ{batch.pricePerLiter}
            </span>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-700">Quantity (Liters):</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-gray-700">
            <span className="font-medium">Total:</span>
            <span className="text-yellow-600 font-bold">
              Ξ{totalPrice}
            </span>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          {status.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-4 shadow-sm border border-red-200">
              <p className="font-medium">{status.error}</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 mr-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={status.loading}
              className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 disabled:opacity-50"
            >
              {status.loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PropTypes to OrderModal
OrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  batch: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  status: PropTypes.object.isRequired
};