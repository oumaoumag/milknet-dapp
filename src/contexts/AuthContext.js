import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// User roles
export const ROLES = {
  GUEST: 'guest',
  FARMER: 'farmer',
  BUYER: 'buyer'
};

export function AuthProvider({ children }) {
  const { account, contract } = useWeb3();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage for user data on initialization
  useEffect(() => {
    const checkLocalStorage = () => {
      const storedUser = localStorage.getItem('milknet_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Only restore if the account matches the stored user
          if (account && parsedUser.walletAddress.toLowerCase() === account.toLowerCase()) {
            setUser(parsedUser);
          } else {
            // Clear stored user if wallet address doesn't match
            localStorage.removeItem('milknet_user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('milknet_user');
        }
      }
      setLoading(false);
    };

    checkLocalStorage();
  }, [account]);

  // Check if user is a registered farmer
  const checkFarmerRegistration = async () => {
    if (!account || !contract) return false;
    
    try {
      // Get farmer data from the farmers mapping - 0x1 flag indicates registration status
      const farmer = await contract.farmers(account);
      // Use BigInt for bit operation to avoid the "can't convert BigInt to number" error
      return farmer && (farmer.flags & BigInt(0x1)) === BigInt(0x1);
    } catch (error) {
      console.error('Error checking farmer registration:', error);
      return false;
    }
  };
  
  // Helper function to get user's available roles
  const checkUserRoles = async () => {
    if (!account) return { isFarmer: false, isBuyer: false };
    
    try {
      // First, check if user is registered as farmer on the blockchain
      const isFarmer = await checkFarmerRegistration();
      
      // Check if user is registered as buyer (stored in localStorage)
      const userRolesData = localStorage.getItem('milknet_user_roles');
      let isBuyer = false;
      let buyerName = '';
      
      if (userRolesData) {
        try {
          const userRoles = JSON.parse(userRolesData);
          const accountRoles = userRoles[account.toLowerCase()];
          
          isBuyer = accountRoles && accountRoles.roles && accountRoles.roles.includes(ROLES.BUYER);
          buyerName = accountRoles?.buyerName || '';
        } catch (e) {
          console.error('Error parsing user roles:', e);
        }
      }
      
      return { isFarmer, isBuyer, buyerName };
    } catch (error) {
      console.error('Error checking user roles:', error);
      return { isFarmer: false, isBuyer: false, buyerName: '' };
    }
  };

  // Helper function to save user role data
  const saveUserRoleData = (role, roleData = {}) => {
    if (!account) return;
    
    const accountLower = account.toLowerCase();
    const userRolesData = localStorage.getItem('milknet_user_roles');
    let userRoles = {};
    
    if (userRolesData) {
      try {
        userRoles = JSON.parse(userRolesData);
      } catch (e) {
        console.error('Error parsing user roles:', e);
      }
    }
    
    // Initialize user roles if they don't exist
    if (!userRoles[accountLower]) {
      userRoles[accountLower] = {
        roles: []
      };
    }
    
    // Add role if not already present
    if (!userRoles[accountLower].roles.includes(role)) {
      userRoles[accountLower].roles.push(role);
    }
    
    // Add role-specific data
    Object.assign(userRoles[accountLower], roleData);
    
    localStorage.setItem('milknet_user_roles', JSON.stringify(userRoles));
  };

  // Register as farmer
  const registerAsFarmer = async (farmerName, location) => {
    if (!account || !contract) throw new Error('Wallet not connected');
    
    try {
      // Create a placeholder certification hash (bytes32 value)
      const defaultCertificationHash = ethers.zeroPadValue(ethers.toUtf8Bytes("PENDING"), 32);
      
      const tx = await contract.registerFarmer(farmerName, location, defaultCertificationHash);
      await tx.wait();
      
      // Save farmer role data
      saveUserRoleData(ROLES.FARMER, { farmerName, location });
      
      const userData = {
        walletAddress: account,
        role: ROLES.FARMER,
        name: farmerName,
        location: location
      };
      
      setUser(userData);
      localStorage.setItem('milknet_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Farmer registration error:', error);
      
      // Provide more helpful error message
      if (error.message.includes('no matching fragment')) {
        throw new Error('Registration failed: Contract function signature mismatch');
      } else if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected in your wallet');
      } else {
        throw error;
      }
    }
  };

  // Register as buyer
  const registerAsBuyer = async (buyerName) => {
    if (!account || !contract) throw new Error('Wallet not connected');
    
    try {
      // Save buyer role data
      saveUserRoleData(ROLES.BUYER, { buyerName, registeredAt: new Date().toISOString() });
      
      const userData = {
        walletAddress: account,
        role: ROLES.BUYER,
        name: buyerName,
        registeredAt: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('milknet_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Buyer registration error:', error);
      throw error;
    }
  };

  // Login function
  const login = async (role) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      // Check what roles the user has
      const { isFarmer, isBuyer, buyerName } = await checkUserRoles();
      
      if (role === ROLES.FARMER) {
        if (!isFarmer) {
          throw new Error('This wallet is not registered as a farmer');
        }
        
        const farmer = await contract.farmers(account);
        const userData = {
          walletAddress: account,
          role: ROLES.FARMER,
          name: farmer.name,
          location: farmer.location
        };
        
        setUser(userData);
        localStorage.setItem('milknet_user', JSON.stringify(userData));
      } else if (role === ROLES.BUYER) {
        if (!isBuyer) {
          throw new Error('This wallet is not registered as a buyer');
        }
        
        // Get buyer name from storage
        const userRolesData = localStorage.getItem('milknet_user_roles');
        let name = 'Buyer'; // Default name
        
        if (userRolesData) {
          try {
            const userRoles = JSON.parse(userRolesData);
            name = userRoles[account.toLowerCase()]?.buyerName || name;
          } catch (e) {
            console.error('Error parsing user roles:', e);
          }
        }
        
        const userData = {
          walletAddress: account,
          role: ROLES.BUYER,
          name,
          registeredAt: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('milknet_user', JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('milknet_user');
    setUser(null);
  };

  // Reset auth when wallet changes
  useEffect(() => {
    if (!account) {
      logout();
    } else if (user && user.walletAddress.toLowerCase() !== account.toLowerCase()) {
      // Clear user data if wallet address changed
      logout();
    }
  }, [account, user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAuthenticated: !!user,
      isFarmer: user?.role === ROLES.FARMER,
      isBuyer: user?.role === ROLES.BUYER,
      registerAsFarmer,
      registerAsBuyer,
      login,
      logout,
      checkUserRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
