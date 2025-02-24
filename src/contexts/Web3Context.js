import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';
import { getContract } from '../utils/blockchain';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState('');

  useEffect(() => {
    const allowedNetworks = {
      '0x14a33': 'BASE',        // Base Goerli Testnet
      '0xaa36a7': 'SEPOLIA',      // Sepolia Testnet
      '0x6a': 'LISK_SEPOLIA',     // Lisk Sepolia Testnet (replace with actual chain ID)
      '0x7a69': 'LOCAL'           // Local Hardhat (31337)
    };

    const initWeb3 = async () => {
      if (!window.ethereum) {
        console.error('MetaMask not installed!');
        return;
      }

      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkKey = allowedNetworks[chainId];

        if (!networkKey) {
          alert(`Please connect to one of: ${Object.values(allowedNetworks).join(', ')}`);
          return;
        }

        // Get contract address from environment variables
        const envVarName = `REACT_APP_${networkKey}_CONTRACT_ADDRESS`;
        const contractAddress = process.env[envVarName];

        if (!contractAddress) {
          throw new Error(`Contract address not found for ${networkKey} network`);
        }

        // Use ethers v6 BrowserProvider and await getSigner()
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Initialize contract using the updated getContract helper
        const contractInstance = await getContract(contractAddress, signer);
        
        // Request user accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Update state
        setNetworkName(networkKey);
        setAccount(accounts[0]);
        setContract(contractInstance);
      } catch (error) {
        console.error('Web3 initialization error:', error);
        alert(`Error connecting to network: ${error.message}`);
      }
    };

    const handleChainChanged = () => {
      initWeb3();
    };

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || '');
    };

    // Initial setup
    initWeb3();

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
    <Web3Context.Provider value={{ account, contract, networkName }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
