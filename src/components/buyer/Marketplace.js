import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';
import { formatBlockchainError } from '../../utils/errorUtils';
import { toast } from 'react-toastify';
import FormatBatchData, { formatDisplayPrice } from '../batches/FormatBatchData';
import OrderModal from './OrderModal';
import { ethToKes, formatKesAmount, safeEthFormat, CURRENT_ETH_TO_KES_RATE } from '../../utils/currencyUtils';
import { motion } from 'framer-motion';

// Helper function to format KES with commas
const formatKesPrice = (kesAmount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(kesAmount);
};

export default function Marketplace() {
  const { contract, account } = useWeb3();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [txStatus, setTxStatus] = useState({ loading: false, error: null });
  const [displayCurrency, setDisplayCurrency] = useState('ETH');
  const [deletingBatchId, setDeletingBatchId] = useState(null);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setIsLoading(true);
        if (contract) {
          const rawBatches = await fetchBatches(contract);
          const formattedBatches = FormatBatchData(rawBatches);
          setBatches(formattedBatches);
          console.log('Loaded batches data:', formattedBatches);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load batches. Please try refreshing the page.');
        console.error('Batch loading error:', err);
        console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      } finally {
        setIsLoading(false);
      }
    };

    loadBatches();
    
    const refreshInterval = setInterval(() => {
      if (contract) {
        console.log('Refreshing batches data...');
        loadBatches();
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
    
  }, [contract]);

  const handleOrder = (batch) => {
    const formattedBatch = {
      ...batch,
      pricePerLiter: safeEthFormat(batch.pricePerLiterWei)
    };
    
    setSelectedBatch(formattedBatch);
    setShowOrderModal(true);
  };

  const handleDeleteBatch = async (batchId) => {
    if (!contract) return;
    
    try {
      setDeletingBatchId(batchId);
      const tx = await contract.deleteBatch(batchId);
      toast.info('Deleting batch... Please wait for confirmation');
      await tx.wait();
      
      // Refresh the list
      const rawBatches = await fetchBatches(contract);
      const updatedBatches = FormatBatchData(rawBatches);
      setBatches(updatedBatches);
      
      toast.success('Batch successfully deleted');
    } catch (err) {
      console.error('Error deleting batch:', err);
      toast.error('Failed to delete batch: ' + formatBlockchainError(err));
    } finally {
      setDeletingBatchId(null);
    }
  };

  const placeOrder = async (quantity) => {
    try {
      setTxStatus({
        loading: true,
        error: null
      });
      
      // Convert quantity to BigNumber
      const qtyInt = parseInt(quantity);
      const quantityBN = ethers.parseUnits(qtyInt.toString(), 'wei');
      
      // Calculate total price as price per liter * quantity
      // Use safeEthFormat to ensure no "too many decimals" error
      const pricePerLiter = safeEthFormat(selectedBatch.pricePerLiter);
      const totalPrice = parseFloat(pricePerLiter) * qtyInt;
      
      // Convert to wei safely
      let totalPriceWei;
      try {
        totalPriceWei = ethers.parseEther(totalPrice.toFixed(6));
      } catch (err) {
        console.error("Error parsing total price:", err);
        // Fallback with even fewer decimals
        totalPriceWei = ethers.parseEther(totalPrice.toFixed(4));
      }
      
      const tx = await contract.placeOrder(
        selectedBatch.batchId,
        quantityBN,
        { value: totalPriceWei }
      );

      await tx.wait();
      
      // Update order status and show success message
      setTxStatus({
        loading: false,
        error: null
      });
      toast.success("Order placed successfully!");
      
      // Refresh batches after successful order
      const rawBatches = await fetchBatches(contract);
      const formattedBatches = FormatBatchData(rawBatches);
      setBatches(formattedBatches);
      
      return tx;
    } catch (error) {
      console.error("Error placing order:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to place order";
      
      if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds in your wallet to complete this transaction";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected in wallet";
      } else if (error.message.includes("execution reverted")) {
        // Extract the revert reason if available
        errorMessage = error.message.includes(":")
          ? `Contract error: ${error.message.split(":").pop().trim()}`
          : "Contract rejected the transaction";
      }
      
      setTxStatus({
        loading: false,
        error: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <div className="marketplace-container bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 py-10 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Milk Marketplace</h1>
            <p className="text-xl mb-8">Browse available milk batches from verified farmers</p>
            <div className="flex justify-center gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 px-5 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>{batches.length} Active Batches</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 px-5 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span>Choose Your Currency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Currency Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Available Batches</h2>
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            <button
              onClick={() => setDisplayCurrency('ETH')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                displayCurrency === 'ETH' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ETH
            </button>
            <button
              onClick={() => setDisplayCurrency('KES')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                displayCurrency === 'KES' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              KES
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No batches available</h3>
            <p className="mt-2 text-gray-500">Check back later for fresh milk batches from our farmers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <motion.div
                key={batch.batchId}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200"
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {batch.farmerName || 'Farm Fresh Dairy'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        batch.daysRemaining > 3
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {batch.daysRemaining}d remaining
                    </span>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="text-sm">Price per Liter:</span>
                    <span className="font-semibold text-green-600">
                      {displayCurrency === 'ETH' 
                        ? `Ξ${formatDisplayPrice(batch.pricePerLiter)}` 
                        : formatKesPrice(ethToKes(batch.pricePerLiter))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="text-sm">Available Quantity:</span>
                    <span className="font-semibold">
                      {batch.quantity} Liters
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="text-sm">Expiry Date:</span>
                    <span className="font-semibold">
                      {batch.expiryDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleOrder(batch)}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Place Order
                    </button>
                    
                    {account && account.toLowerCase() === batch.farmerAddress.toLowerCase() && (
                      <button
                        onClick={() => handleDeleteBatch(batch.batchId)}
                        disabled={deletingBatchId === batch.batchId}
                        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
                      >
                        {deletingBatchId === batch.batchId ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          'Delete Batch'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal - Preserve all original functionality */}
      {showOrderModal && selectedBatch && (
        <OrderModal
          show={showOrderModal}
          batch={selectedBatch}
          onClose={() => setShowOrderModal(false)}
          onSubmit={placeOrder}
          status={txStatus}
        />
      )}
    </div>
  );
}