import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import MilkNetABI from '../utils/MilkNetABI.json';
import { toast } from 'react-toastify';

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
      toast.success(`Successfully switched to ${NETWORK_CONFIG[targetNetworkId]?.name || 'new network'}`);
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Network not available, add it to MetaMask
        try {
          if (targetNetworkId === 4202) { // Lisk testnet
            await addLiskNetwork();
            return true;
          }
        } catch (addError) {
          console.error('Failed to add network:', addError);
          toast.error('Failed to add network to wallet');
        }
      }
      console.error('Failed to switch network:', error);
      toast.error(`Failed to switch network: ${error.message}`);
      return false;
    }
  };
  
  // Function to add Lisk network to MetaMask
  const addLiskNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x106a', // 4202 in hex
          chainName: 'LISK Testnet',
          nativeCurrency: {
            name: 'LISK',
            symbol: 'LSK',
            decimals: 18
          },
          rpcUrls: ['https://rpc.testnet.lisk.com'],
          blockExplorerUrls: ['https://explorer.testnet.lisk.com']
        }]
      });
      toast.success('LISK Testnet added to your wallet');
      return true;
    } catch (error) {
      console.error('Failed to add LISK network:', error);
      toast.error(`Failed to add LISK network: ${error.message}`);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not installed! Please install MetaMask to use this application.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await initWeb3(provider);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('User rejected connection:', error);
      toast.error(`Connection failed: ${error.message}`);
      throw error;
    }
  };
  
  // Account switching function - allows user to select a different account in MetaMask
  const switchToAccount = async (accountIndex = 0) => {
    if (!window.ethereum) {
      toast.error('MetaMask not installed!');
      return;
    }
    
    try {
      // Get all accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found in wallet');
        return;
      }
      
      if (accountIndex >= accounts.length) {
        toast.error(`Cannot switch to account ${accountIndex+1}. Only ${accounts.length} accounts available.`);
        return;
      }
      
      // Check if we're already on this account
      if (account?.toLowerCase() === accounts[accountIndex].toLowerCase()) {
        toast.info('Already connected to this account');
        return;
      }
      
      try {
        // First approach: Try wallet_switchEthereumChain to the same chain to trigger account selection
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (err) {
        // If the above approach fails, try the permissions approach
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{
            eth_accounts: {}
          }]
        });
      }
      
      // Force MetaMask to show the account selection modal
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      // The accountsChanged event will handle the actual account switch
      toast.success('Please select the desired account in your wallet');
      
      return true;
    } catch (error) {
      console.error('Failed to switch account:', error);
      if (error.code === 4001) {
        toast.error('Account switch was rejected in your wallet');
      } else {
        toast.error(`Failed to switch account: ${error.message}`);
      }
      return false;
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
        toast.error('Network not supported - please switch to Sepolia or Lisk Testnet');
      } else {
        toast.info(`Network changed to ${chainIdHex === '0xaa36a7' ? 'Sepolia' : 'LISK Testnet'}`);
        // Reload only if we had an account before
        if (account) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          initWeb3(provider).catch(error => {
            console.error('Web3 reinitialization error on chain change:', error);
          });
        }
      }
    };

    const handleAccountsChanged = (accounts) => {
      console.log('Accounts changed: ', accounts);
      const newAccount = accounts[0] || '';
      
      // Only update if the account actually changed
      if (newAccount.toLowerCase() !== account?.toLowerCase()) {
        console.log('Setting new account:', newAccount);
        setAccount(newAccount);
        if (newAccount) {
          toast.info(`Account changed to ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`);
          const provider = new ethers.BrowserProvider(window.ethereum);
          initWeb3(provider).catch(error => {
            console.error('Web3 reinitialization error on account change:', error);
            toast.error(`Error connecting to new account: ${error.message}`);
          });
        } else {
          toast.info('Wallet disconnected');
          disconnectWallet();
        }
      }
    };

    if (window.ethereum) {
      // Listen for accounts changing
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Listen for chain changing
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Initial account check
      if (!account) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then(accounts => {
            if (accounts && accounts.length > 0) {
              handleAccountsChanged(accounts);
            }
          })
          .catch(err => console.error('Error checking initial accounts:', err));
      }
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account, initWeb3]);

  return (
    <Web3Context.Provider value={{
      account,
      contract,
      networkName,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      switchToAccount,
      addLiskNetwork
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}