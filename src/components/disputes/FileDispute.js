import { useState } from 'react';
import { getContract } from '../../utils/blockchain';

export default function FileDispute({ batchId, farmer }) {
  const [reason, setReason] = useState('');

  const handleDispute = async () => {
    const contract = await getContract();
    await contract.fileDispute(batchId, farmer, reason);
  };

  return (
    <div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      <button onClick={handleDispute}>File Dispute</button>
    </div>
  );
}