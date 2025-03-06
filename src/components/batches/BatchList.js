import { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';
import OrderModal from './../buyer/OrderModal';
import FormatBatchData, { formatDisplayPrice } from './FormatBatchData';

export default function Marketplace() {
  const { contract } = useWeb3();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [txStatus, setTxStatus] = useState({ loading: false, error: null });

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
      const rawBatches = await fetchBatches(contract);
      setBatches(FormatBatchData(rawBatches));
      
    } catch (error) {
      setTxStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Available Milk Batches</h2>
      
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading marketplace...</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No available batches found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {batches.map((batch) => (
            <div 
              key={batch.batchId} 
              className="bg-white rounded-xl p-6 border border-gray-300 transform transition hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {batch.farmerName || 'Farm Fresh Dairy'}
                </h3>
                <span 
                  className={`px-2 py-1 rounded-lg text-sm ${
                    batch.daysRemaining > 3 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {batch.daysRemaining}d remaining
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="text-yellow-500 font-bold">
                    Ξ{formatDisplayPrice(batch.pricePerLiter)}/L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{batch.quantity} Liters</span>
                </div>
                <button 
                  className="w-full py-3 mt-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
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