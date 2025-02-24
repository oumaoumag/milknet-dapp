import { useWeb3 } from '../contexts/Web3Context';

export default function ConnectionChecker() {
  const { account, contract } = useWeb3();

  const verifyConnection = async () => {
    try {
      const farmerCount = await contract.farmerCounter();
      console.log('Connection successful! Farmers count:', farmerCount.toString());
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      <p>Connected account: {account}</p>
      <button onClick={verifyConnection}>Verify Connection</button>
    </div>
  );
}