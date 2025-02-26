import { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';
import OrderModal from './../buyer/OrderModal';
import FormatBatchData  from './FormatBatchData';

export default function Marketplace() {
  const { contract } = useWeb3(); // Removed unused 'account'
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [txStatus, setTxStatus] = useState({ loading: false, error: null });

  // Add missing useEffect implementation
  useEffect(() => {
    const loadMarketData = async () => {
      if (contract) {
        const rawBatches = await fetchBatches(contract);
        setBatches(FormatBatchData(rawBatches));
        setIsLoading(false);
      }
    };
    loadMarketData();
  }, [contract]);

  const handleOrder = (batch) => {
    setSelectedBatch(batch);
    setShowOrderModal(true);
  };

  const placeOrder = async (quantity) => {
    try {
      setTxStatus({ loading: true, error: null });
      
      const totalPrice = ethers.parseUnits(
        (quantity * selectedBatch.pricePerLiter).toString(),
        'wei'
      );

      const tx = await contract.placeOrder(
        selectedBatch.batchId,
        ethers.parseUnits(quantity.toString(), 'wei'),
        ethers.parseUnits(selectedBatch.pricePerLiter, 'wei'),
        { value: totalPrice }
      );

      await tx.wait();
      setTxStatus({ loading: false, error: null });
      setShowOrderModal(false);
      // Refresh batch list
      const rawBatches = await fetchBatches(contract);
      setBatches(FormatBatchData(rawBatches));
      
    } catch (error) {
      setTxStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="marketplace">
      <h2>Available Milk Batches</h2>
      
      {isLoading ? (
        <div className="loading">Loading marketplace...</div>
      ) : batches.length === 0 ? (
        <div className="empty-state">No available batches found</div>
      ) : (
        <div className="market-grid">
          {batches.map((batch) => (
            <div key={batch.batchId} className="market-card">
              <div className="card-header">
                <h3>{batch.farmerName || 'Farm Fresh Dairy'}</h3>
                <span className={`freshness ${batch.daysRemaining > 3 ? 'good' : 'warning'}`}>
                  {batch.daysRemaining}d remaining
                </span>
              </div>
              <div className="card-body">
                <div className="price-row">
                  <span>Price:</span>
                  <span className="price">Ξ{batch.pricePerLiter}/L</span>
                </div>
                <div className="quantity-row">
                  <span>Available:</span>
                  <span>{batch.quantity} Liters</span>
                </div>
                <button 
                  className="order-button"
                  onClick={() => handleOrder(batch)} // Fixed parameter passing
                >
                  Place Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <OrderModal
        show={showOrderModal}
        batch={selectedBatch}
        onClose={() => setShowOrderModal(false)}
        onSubmit={placeOrder}
        status={txStatus}
      />
    </div>
  );
}