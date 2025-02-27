import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';
import { getContract } from '../utils/blockchain';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await initWeb3();
    } catch (error) {
      console.error('User rejected connection:', error);
      throw error;
    }
  };

  const initWeb3 = async () => {
    if (!window.ethereum) {
      console.log('Please install MetaMask!');
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const allowedNetworks = {
        '0xaa36a7': 'Sepolia',    // Sepolia Testnet (11155111)
        '0x106a': 'LISK'          // Lisk Testnet (4202)
      };

      const networkKey = allowedNetworks[chainId];
      if (!networkKey) {
        const message = `Please connect to one of: ${Object.values(allowedNetworks).join(', ')}`;
        alert(message);
        throw new Error(message);
      }

      // Get contract address from environment variables
      const envVarName = `REACT_APP_${networkKey}_CONTRACT_ADDRESS`;
      const contractAddress = process.env[envVarName];

      if (!contractAddress) {
        throw new Error(`Contract address not found for ${networkKey} network`);
      }

      console.log('Loading contract for:', envVarName);
      console.log('Contract address:', contractAddress);

      // Initialize provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize contract
      const contractInstance = await getContract(contractAddress, signer);

      // Update state
      setNetworkName(networkKey);
      setContract(contractInstance);
    } catch (error) {
      console.error('Web3 initialization error:', error);
      setContract(null);
      setNetworkName('');
      throw error; // Propagate the error to prevent further execution
    }
  };

  useEffect(() => {
    const handleChainChanged = (chainId) => {
      const allowedChainIds = ['0xaa36a7', '0x106a'];
      if (!allowedChainIds.includes(chainId)) {
        alert('Network not supported - please switch to Sepolia or Lisk');
        window.location.reload();
      }
    };

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || '');
      if (accounts[0]) {
        initWeb3();
      }
    };

    // Add event listeners
    window.ethereum?.on('chainChanged', handleChainChanged);
    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    // Cleanup
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return (
    <Web3Context.Provider value={{ account, contract, networkName, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
