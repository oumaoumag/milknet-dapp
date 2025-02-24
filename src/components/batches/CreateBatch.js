import { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../../utils/blockchain';

export default function CreateBatch() {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSubmit = async () => {
    const contract = await getContract();
    await contract.registerMilkBatch(
      ethers.parseUnits(quantity, 'wei'),
      ethers.parseUnits(price, 'wei'),
      Math.floor(new Date(expiry).getTime() / 1000)
    );
  };

  return (
    <div>
      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      <button onClick={handleSubmit}>Add Batch</button>
    </div>
  );
}