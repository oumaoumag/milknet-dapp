import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import MilkNetABI from '../utils/MilkNetABI.json';

const Web3Context = createContext();

const NETWORK_CONFIG = {
  11155111: { // Sepolia network ID
    name: "Sepolia",
    contractAddress: process.env.REACT_APP_SEPOLIA_CONTRACT_ADDRESS
  },
  4202: { // Lisk Testnet
    name: "LISK Testnet",
    contractAddress: process.env.REACT_APP_LISK_CONTRACT_ADDRESS
  }
};

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState('');
  
  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setNetworkName('');
  };

  // Network switching function
  const switchNetwork = async (targetNetworkId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetNetworkId.toString(16)}`  }],
      });
    } catch (error) {
      if (error.code === 4902) {
        console.log('Network not added to wallet');
      }
      console.error('Failed to switch network:', error);
  }
};

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed!');
      return;
    }


    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await initWeb3(provider);
    } catch (error) {
      console.error('User rejected connection:', error);
      throw error;
    }
  };

  const initWeb3 = useCallback(async (provider) => {
    try {
      const network = await provider.getNetwork();
      const chainId = parseInt(network.chainId, 10);
      const config = NETWORK_CONFIG[chainId];
      
      if (!config) {
        throw new Error(`Unsupported network: ${network.name}`);
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        config.contractAddress,
        MilkNetABI,
        signer
      );

      // Verify contract connection
      const batchCount = await contract.batchCounter();
      console.log('Contract connection verified. Total batches:', batchCount.toString());

      setContract(contract);
      setNetworkName(config.name);
    } catch (error) {
      console.error("Web3 initialization failed:", error);
      setContract(null);
      throw new Error(`Failed to initialize Web3: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    const handleChainChanged = (chainIdHex) => {
      const allowedChainIds = ['0xaa36a7', '0x106a']; // Sepolia (0xaa36a7) and Lisk (0x106a)
      if (!allowedChainIds.includes(chainIdHex)) {
        alert('Network not supported - please switch to Sepolia or Lisk Testnet');
        window.location.reload();
      }
    };

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || '');
      if (accounts[0]) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        initWeb3(provider).catch(error => {
          console.error('Web3 reinitialization error:', error);
        });
      }
    };

    window.ethereum?.on('chainChanged', handleChainChanged);
    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [initWeb3]);

  return (
    <Web3Context.Provider value={{
    account,
    contract,
    networkName,
    connectWallet,
    disconnectWallet,
    switchNetwork
     }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}