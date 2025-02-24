import { useState } from 'react';
import { getContract } from '../../utils/blockchain';

export default function FarmerRegistration() {
  const [name, setName] = useState('');

  const handleRegister = async () => {
    const contract = await getContract();
    await contract.registerFarmer(name);
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleRegister}>Register as Farmer</button>
    </div>
  );
}