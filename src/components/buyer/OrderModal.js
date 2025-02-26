import { useState } from 'react';

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
    if (error) return alert(error);
    onSubmit(quantity);
  };

  if (!show || !batch) return null;

  return (
    <div className="modal-overlay">
      <div className="order-modal">
        <div className="modal-header">
          <h3>Order Milk Batch #{batch.batchId}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="price-display">
            <span>Price per Liter:</span>
            <span>Ξ{batch.pricePerLiter}</span>
          </div>
          
          <div className="quantity-input">
            <label>Quantity (Liters):</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.1"
              step="0.1"
            />
          </div>
          
          <div className="total-price">
            Total: Ξ{(quantity * batch.pricePerLiter).toFixed(4) || '0.0000'}
          </div>
        </div>

        <div className="modal-footer">
          {status.error && (
            <div className="error-message">{status.error}</div>
          )}
          <button 
            onClick={handleSubmit}
            disabled={status.loading}
            className="confirm-button"
          >
            {status.loading ? 'Processing...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
}