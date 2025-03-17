import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';

export default function ExpiredBatches() {
  const { contract, account } = useWeb3();
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadExpiredBatches = useCallback(async () => {
    if (!contract || !account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all batches for the farmer
      const allBatches = await contract.getActiveBatches();
      
      // Filter expired batches
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expired = allBatches.filter(batch => 
        batch.farmerAddress.toLowerCase() === account.toLowerCase() &&
        Number(batch.expiryDate) <= currentTimestamp &&
        (Number(batch.flags) & 0x2) === 0 // not deleted
      );
      
      setExpiredBatches(expired);
    } catch (err) {
      console.error('Error loading expired batches:', err);
      setError('Failed to load expired batches');
    } finally {
      setIsLoading(false);
    }
  }, [contract, account]);

  const handleDelete = async (batchId) => {
    if (!contract) return;
    
    try {
      // Use the existing deleteBatch function
      const tx = await contract.deleteBatch(batchId);
      await tx.wait();
      
      // Refresh the list
      await loadExpiredBatches();
    } catch (err) {
      console.error('Error deleting batch:', err);
      alert('Failed to delete batch: ' + err.message);
    }
  };

  useEffect(() => {
    loadExpiredBatches();
  }, [contract, account, loadExpiredBatches]);

  if (isLoading) {
    return <div className="text-center py-4">Loading expired batches...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (expiredBatches.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No expired batches found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-red-600">Expired Batches</h3>
      <div className="grid gap-4">
        {expiredBatches.map((batch) => (
          <div 
            key={batch.batchId}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Batch #{batch.batchId.toString()}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {batch.quantity.toString()} Liters
                </p>
                <p className="text-sm text-gray-600">
                  Expired on: {new Date(Number(batch.expiryDate) * 1000).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(batch.batchId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Batch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}