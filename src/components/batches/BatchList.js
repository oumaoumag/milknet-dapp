import { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';
import OrderModal from './../buyer/OrderModal';
import FormatBatchData, { formatDisplayPrice } from './FormatBatchData';
import { toast } from 'react-toastify';
import { safeEthFormat } from '../../utils/currencyUtils';
import { formatBlockchainError } from '../../utils/errorUtils';

export default function BatchList({ batches: propBatches, userRole }) {
  const { contract } = useWeb3();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(propBatches ? false : true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [txStatus, setTxStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    const loadMarketData = async () => {
      if (propBatches) {
        setBatches(propBatches);
        setIsLoading(false);
      } else if (contract) {
        const rawBatches = await fetchBatches(contract);
        setBatches(FormatBatchData(rawBatches));
        setIsLoading(false);
      }
    };
    loadMarketData();
  }, [contract, propBatches]);

  const handleOrder = (batch) => {
    setSelectedBatch(batch);
    setShowOrderModal(true);
  };

  const placeOrder = async (quantity) => {
    try {
      setTxStatus({ loading: true, error: null });
      
      // Convert quantity to a normal integer
      const qtyInt = parseInt(quantity);
      
      // First, verify we have the data we need
      if (!selectedBatch || !selectedBatch.batchId || isNaN(qtyInt) || qtyInt <= 0) {
        throw new Error("Invalid batch or quantity data");
      }
      
      console.log("Selected batch:", selectedBatch);
      console.log("Placing order for batch ID:", selectedBatch.batchId, "quantity:", qtyInt);
      
      // Per the contract: placeOrder(uint256 _batchId, uint64 _quantity)
      // Convert quantity to BigNumber - use parseUnits with 0 decimals since it's a whole number
      const quantityBN = ethers.parseUnits(qtyInt.toString(), 0);
      
      // Get price per liter directly from the selected batch's original wei value
      const pricePerLiterWei = selectedBatch.pricePerLiterWei;
      console.log("Price per liter (wei):", pricePerLiterWei);
      
      // Calculate total price in wei by multiplying quantity by price in wei
      const totalWei = ethers.getBigInt(pricePerLiterWei) * ethers.getBigInt(qtyInt);
      console.log("Total price (wei):", totalWei.toString());
      
      // The contract expects minimum value to cover the total price
      const tx = await contract.placeOrder(
        selectedBatch.batchId,  // batchId (as a number)
        quantityBN,             // quantity (as a BigNumber)
        { 
          value: totalWei       // msg.value in wei
        }
      );

      await tx.wait();
      
      setTxStatus({ loading: false, error: null });
      setShowOrderModal(false);
      
      // Refresh batches data after placing an order
      if (propBatches) {
        // If batches were provided as props, we need to let parent component refresh
        toast.success("Order placed successfully!");
      } else {
        // Otherwise we can refresh batches ourselves
        const rawBatches = await fetchBatches(contract);
        setBatches(FormatBatchData(rawBatches));
        toast.success("Order placed successfully!");
      }
      
    } catch (error) {
      console.error("Order Error:", error);
      const errorMessage = formatBlockchainError(error) || error.message || "Failed to place order";
      setTxStatus({ loading: false, error: errorMessage });
      toast.error("Failed to place order: " + errorMessage);
      
      // If it's an insufficient funds error, show a more helpful message
      if (errorMessage.includes("insufficient funds")) {
        toast.error("You don't have enough ETH in your wallet to complete this transaction");
      }
    }
  };

  return (
    <div className="p-0 max-w-7xl mx-auto">
      {!userRole && <h2 className="text-2xl font-bold mb-8">Available Milk Batches</h2>}
      
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
                  {batch.daysRemaining > 0 ? `${batch.daysRemaining}d remaining` : 'Expired'}
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
                  className="w-full py-3 mt-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  onClick={() => handleOrder(batch)}
                  disabled={batch.daysRemaining <= 0}
                >
                  {batch.daysRemaining > 0 ? 'Place Order' : 'Expired'}
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