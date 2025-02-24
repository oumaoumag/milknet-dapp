import { createContext, useContext, useEffect, useState } from 'react';
import { getContract } from '../utils/blockchain';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setContract(await getContract());
      }
    };
    init();
  }, []);

  return (
    <Web3Context.Provider value={{ account, contract }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}