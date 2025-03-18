import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';
import { motion } from 'framer-motion';

export default function Register() {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [farmerName, setFarmerName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { registerAsFarmer, registerAsBuyer, isAuthenticated } = useAuth();
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await connectWallet();
    } catch (error) {
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }
    
    try {
      setLoading(true);
      
      const registrationPromises = [];
      
      if (selectedRoles.includes(ROLES.FARMER)) {
        if (!farmerName || !location) {
          toast.error('Please provide farm name and location for Farmer registration');
          setLoading(false);
          return;
        }
        registrationPromises.push(registerAsFarmer(farmerName, location));
      }
      
      if (selectedRoles.includes(ROLES.BUYER)) {
        if (!buyerName) {
          toast.error('Please provide your name for Buyer registration');
          setLoading(false);
          return;
        }
        registrationPromises.push(registerAsBuyer(buyerName));
      }
      
      await Promise.all(registrationPromises);
      
      toast.success('Registration successful!');
      
      // Redirect to role selection
      navigate('/select-role');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(formatBlockchainError(error) || 'Registration failed');
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
            <h2 className="text-3xl font-bold">Register for MilkNet</h2>
            <p className="mt-2 text-green-100">Join our blockchain-powered milk supply chain</p>
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
                  Please connect your MetaMask wallet to begin registration
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
                    Already registered?{' '}
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="bg-gray-100 p-3 rounded-lg flex items-center mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-800 text-sm font-mono">
                      {account.substring(0, 8)}...{account.substring(account.length - 6)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Select Roles</h3>
                  <p className="text-gray-600 mb-4">
                    Choose which roles you would like to register for
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      selectedRoles.includes(ROLES.FARMER)
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRole(ROLES.FARMER)}
                  >
                    <svg className="w-10 h-10 mx-auto mb-2 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <div className="font-medium">Farmer</div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      selectedRoles.includes(ROLES.BUYER)
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRole(ROLES.BUYER)}
                  >
                    <svg className="w-10 h-10 mx-auto mb-2 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div className="font-medium">Buyer</div>
                  </div>
                </div>
                
                {/* Dynamic form fields based on selected roles */}
                {selectedRoles.includes(ROLES.FARMER) && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-800 mb-3">Farmer Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Name *
                        </label>
                        <input
                          type="text"
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required={selectedRoles.includes(ROLES.FARMER)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required={selectedRoles.includes(ROLES.FARMER)}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedRoles.includes(ROLES.BUYER) && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-3">Buyer Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={selectedRoles.includes(ROLES.BUYER)}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || selectedRoles.length === 0}
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
                  ) : 'Complete Registration'}
                </button>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already registered?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
