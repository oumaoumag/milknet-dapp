import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';

export default function Login() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState({isFarmer: false, isBuyer: false});
  const [checkingRoles, setCheckingRoles] = useState(false);
  const { login, isAuthenticated, checkUserRoles } = useAuth();
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } else if (account) {
      // If wallet is connected but user isn't authenticated, redirect to role selector
      navigate('/select-role', { replace: true });
    }
  }, [isAuthenticated, account, navigate, location]);
  
  // Check available roles when wallet is connected
  useEffect(() => {
    const checkRoles = async () => {
      if (!account) return;
      
      try {
        setCheckingRoles(true);
        const userRoles = await checkUserRoles();
        setAvailableRoles(userRoles);
        
        // Auto-select role if user only has one role
        if (userRoles.isFarmer && !userRoles.isBuyer) {
          setRole(ROLES.FARMER);
        } else if (!userRoles.isFarmer && userRoles.isBuyer) {
          setRole(ROLES.BUYER);
        }
      } catch (error) {
        console.error('Error checking roles:', error);
      } finally {
        setCheckingRoles(false);
      }
    };
    
    checkRoles();
  }, [account, checkUserRoles]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast.error('Failed to connect wallet: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    
    try {
      setLoading(true);
      await login(role);
      
      // Redirect based on role
      if (role === ROLES.FARMER) {
        navigate('/farmer');
      } else if (role === ROLES.BUYER) {
        navigate('/buyer-dashboard');
      }
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(formatBlockchainError(error) || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="font-medium text-yellow-600 hover:text-yellow-500">
              register a new account
            </a>
          </p>
        </div>
        
        <div className="mt-8">
          {!account ? (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-gray-700 text-center">Connect your wallet to continue</p>
              <button
                onClick={handleConnectWallet}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Connected Wallet</label>
                <div className="mt-1 flex items-center bg-gray-100 rounded-md px-3 py-2 text-gray-600">
                  <span className="truncate">{account}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Login as</label>
                {checkingRoles ? (
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center py-4">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking available roles...</span>
                  </div>
                ) : (
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <div 
                      className={`border rounded-md px-3 py-2 text-center ${
                        !availableRoles.isFarmer 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : role === ROLES.FARMER 
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-700 cursor-pointer' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => availableRoles.isFarmer && setRole(ROLES.FARMER)}
                    >
                      Farmer
                      {!availableRoles.isFarmer && <div className="text-xs mt-1">(Not Registered)</div>}
                    </div>
                    <div 
                      className={`border rounded-md px-3 py-2 text-center ${
                        !availableRoles.isBuyer 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : role === ROLES.BUYER 
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-700 cursor-pointer' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => availableRoles.isBuyer && setRole(ROLES.BUYER)}
                    >
                      Buyer
                      {!availableRoles.isBuyer && <div className="text-xs mt-1">(Not Registered)</div>}
                    </div>
                  </div>
                )}
                {!availableRoles.isFarmer && !availableRoles.isBuyer && !checkingRoles && (
                  <div className="mt-2 text-sm text-red-600">
                    You haven't registered for any roles yet. <a href="/register" className="font-semibold text-yellow-600 hover:underline">Register now</a>.
                  </div>
                )}
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !account || !role}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : 'Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
