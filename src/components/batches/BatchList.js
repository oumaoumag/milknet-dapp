import { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { fetchBatches } from '../../utils/contractCalls';

export default function BatchList({ batches }) {
  const { contract } = useWeb3();
  const [batchData, setBatchData] = useState([]);

  // Format wei values to ether and convert timestamps
  const formatBatchData = (rawBatches) => {
    return rawBatches.map(batch => ({
      ...batch,
      quantity: ethers.formatUnits(batch.quantity, 'wei'),
      pricePerLiter: ethers.formatUnits(batch.pricePerLiter, 'wei'),
      expiryDate: new Date(batch.expiryDate * 1000).toLocaleDateString(),
      status: batch.expiryDate > Math.floor(Date.now() / 1000) ? 'Available' : 'Expired'
    }));
  };

  useEffect(() => {
    const loadBatches = async () => {
      if (contract) {
        const rawBatches = await fetchBatches(contract);
        setBatchData(formatBatchData(rawBatches));
      }
    };
    loadBatches();
  }, [contract]);

  return (
    <div className="batch-list">
      <h3>Your Milk Batches</h3>
      
      {batchData.length === 0 ? (
        <p className="no-batches">No batches available. Create your first batch!</p>
      ) : (
        <div className="batch-grid">
          {batchData.map((batch) => (
            <div key={batch.batchId} className="batch-card">
              <div className="batch-header">
                <span className="batch-id">#{batch.batchId}</span>
                <span className={`status ${batch.status.toLowerCase()}`}>
                  {batch.status}
                </span>
              </div>
              <div className="batch-details">
                <div className="detail-item">
                  <span>Quantity:</span>
                  <span>{batch.quantity} L</span>
                </div>
                <div className="detail-item">
                  <span>Price/Liter:</span>
                  <span>Ξ{batch.pricePerLiter}</span>
                </div>
                <div className="detail-item">
                  <span>Expiry:</span>
                  <span>{batch.expiryDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}