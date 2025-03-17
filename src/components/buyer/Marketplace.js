import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';
import OrderModal from './OrderModal';
import FormatBatchData, { formatDisplayPrice } from '../batches/FormatBatchData';
import { kesToEth, ethToKes, formatKesAmount } from '../../utils/currencyUtils';

export default function Marketplace() {
  const { contract } = useWeb3();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [txStatus, setTxStatus] = useState({ loading: false, error: null });
  const [displayCurrency, setDisplayCurrency] = useState('ETH'); // Default display currency

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

  const placeOrder = async (quantity, currencyMode) => {
    try {
      setTxStatus({ loading: true, error: null });
      
      // Convert KES to ETH if necessary
      let finalQuantity = quantity;
      if (currencyMode === 'KES') {
        finalQuantity = quantity; // The quantity is still in liters, only the display price changes
      }

      const quantityBN = ethers.toBigInt(finalQuantity);
      const totalPriceWei = quantityBN.mul(selectedBatch.pricePerLiterWei);
      const tx = await contract.placeOrder(
        selectedBatch.batchId,
        quantityBN,
        { value: totalPriceWei }
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
    <div className="container px-4 sm:px-6 lg:px-8 py-8 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center sm:text-left">Available Milk Batches</h2>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setDisplayCurrency('ETH')}
            className={`px-3 py-2 text-sm font-medium rounded-l-lg ${displayCurrency === 'ETH' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            ETH
          </button>
          <button
            type="button"
            onClick={() => setDisplayCurrency('KES')}
            className={`px-3 py-2 text-sm font-medium rounded-r-lg ${displayCurrency === 'KES' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            KES
          </button>
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center my-8 shadow-sm border border-red-200">
          <p className="font-medium">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
            <p className="text-gray-500">Loading marketplace...</p>
          </div>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center my-12 border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p className="text-gray-600 text-lg font-medium">No available batches found</p>
          <p className="text-gray-500 mt-2">Check back later for fresh milk batches</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {batches.map((batch) => (
            <div 
              key={batch.batchId} 
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate">
                  {batch.farmerName || 'Farm Fresh Dairy'}
                </h3>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    batch.daysRemaining > 3 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {batch.daysRemaining} days remaining
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-gray-700">
                  <span>Price:</span>
                  <div className="text-right">
                    <span className="text-yellow-600 font-bold block">
                      {displayCurrency === 'ETH' ? 
                        `Ξ${formatDisplayPrice(batch.pricePerLiterWei)}/L` : 
                        `${formatKesAmount(ethToKes(batch.pricePerLiter))}/L`}
                    </span>
                    <span className="text-gray-500 text-xs block">
                      {displayCurrency === 'ETH' ? 
                        `${formatKesAmount(ethToKes(batch.pricePerLiter))}/L` : 
                        `Ξ${formatDisplayPrice(batch.pricePerLiterWei)}/L`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Available:</span>
                  <span className="font-medium">{batch.quantity} Liters</span>
                </div>
                <button 
                  className="w-full py-3 mt-4 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
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