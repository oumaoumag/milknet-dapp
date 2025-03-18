import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';
import { motion } from 'framer-motion';

export default function Login() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState({isFarmer: false, isBuyer: false});
  const [checkingRoles, setCheckingRoles] = useState(false);
  // User is indirectly used via isAuthenticated, which depends on user state
  // eslint-disable-next-line no-unused-vars
  const { login, isAuthenticated, user, checkUserRoles } = useAuth();
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
        const roles = await checkUserRoles();
        setAvailableRoles(roles);
        
        // If only one role is available, auto-select it
        if (roles.isFarmer && !roles.isBuyer) {
          setRole(ROLES.FARMER);
        } else if (!roles.isFarmer && roles.isBuyer) {
          setRole(ROLES.BUYER);
        }
      } catch (error) {
        console.error('Error checking roles:', error);
      } finally {
        setCheckingRoles(false);
      }
    };
    
    if (account) {
      checkRoles();
    }
  }, [account, checkUserRoles]);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(formatBlockchainError(error) || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!role) {
      toast.error('Please select a role to continue');
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
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-900 to-green-700 p-8 text-white text-center">
            <h2 className="text-3xl font-bold">Welcome to MilkNet</h2>
            <p className="mt-2 text-green-100">Connect your wallet to continue</p>
          </div>
          
          <div className="p-8">
            {!account ? (
              <div className="text-center">
                <div className="mb-6">
                  <svg 
                    className="w-16 h-16 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  Please connect your MetaMask wallet to access the application
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : 'Connect Wallet'}
                </button>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => navigate('/register')}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="bg-gray-100 p-3 rounded-lg flex items-center mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-800 text-sm font-mono">
                      {account.substring(0, 8)}...{account.substring(account.length - 6)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Choose Your Role</h3>
                  <p className="text-gray-600 mb-4">
                    Select which role you want to use for this session
                  </p>
                </div>
                
                {checkingRoles ? (
                  <div className="flex justify-center items-center py-8">
                    <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div 
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          !availableRoles.isFarmer 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : role === ROLES.FARMER 
                              ? 'bg-green-50 border-green-500 text-green-700' 
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => availableRoles.isFarmer && setRole(ROLES.FARMER)}
                      >
                        <svg className="w-10 h-10 mx-auto mb-2 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <div className="font-medium">Farmer</div>
                        
                        {!availableRoles.isFarmer && (
                          <div className="text-xs mt-1">(Not Registered)</div>
                        )}
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          !availableRoles.isBuyer 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : role === ROLES.BUYER 
                              ? 'bg-green-50 border-green-500 text-green-700' 
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => availableRoles.isBuyer && setRole(ROLES.BUYER)}
                      >
                        <svg className="w-10 h-10 mx-auto mb-2 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <div className="font-medium">Buyer</div>
                        
                        {!availableRoles.isBuyer && (
                          <div className="text-xs mt-1">(Not Registered)</div>
                        )}
                      </div>
                    </div>
                    
                    {!availableRoles.isFarmer && !availableRoles.isBuyer ? (
                      <div className="mb-6">
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
                          You haven't registered for any roles yet. 
                          <button 
                            type="button"
                            onClick={() => navigate('/register')}
                            className="ml-1 font-medium text-yellow-800 underline"
                          >
                            Register now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading || !role}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex justify-center items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : 'Continue'}
                      </button>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
