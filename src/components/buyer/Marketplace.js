import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';
import OrderModal from './OrderModal';
import FormatBatchData from '../batches/FormatBatchData';
import SkeletonLoader from '../SkeletonLoader';

export default function Marketplace() {
  const { contract } = useWeb3();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [txStatus, setTxStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setIsLoading(true);
        if (contract) {
          const rawBatches = await fetchBatches(contract);
          const formattedBatches = FormatBatchData(rawBatches);
          setBatches(formattedBatches);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load batches. Please try refreshing the page.');
        console.error('Batch loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBatches();
  }, [contract]);

  const handleOrder = (batch) => {
    setSelectedBatch(batch);
    setShowOrderModal(true);
  };

  const placeOrder = async (quantity) => {
    try {
      setTxStatus({ loading: true, error: null });
      
      const pricePerLiter = Number(selectedBatch.pricePerLiter);
      const totalPrice = ethers.parseUnits(
        (quantity * pricePerLiter).toString(),
        'wei'
      );

      const tx = await contract.placeOrder(
        selectedBatch.batchId,
        ethers.parseUnits(quantity.toString(), 'wei'),
        ethers.parseUnits(pricePerLiter.toString(), 'wei'),
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
      
      {error ? (
        <div className="error-message p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      ) : isLoading ? (
        <SkeletonLoader />
      ) : batches.length === 0 ? (
        <div className="empty-state p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500 text-lg">No available milk batches found</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Refresh Marketplace
          </button>
        </div>
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
                  onClick={() => handleOrder(batch)}
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Marketplace Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message p-4 bg-red-100 text-red-700 rounded-lg">
          Failed to load marketplace. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}