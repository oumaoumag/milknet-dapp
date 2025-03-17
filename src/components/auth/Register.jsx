import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';

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
      await connectWallet();
    } catch (error) {
      toast.error('Failed to connect wallet: ' + error.message);
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
    
    const isFarmerSelected = selectedRoles.includes(ROLES.FARMER);
    const isBuyerSelected = selectedRoles.includes(ROLES.BUYER);
    
    // Validate farmer information
    if (isFarmerSelected && (!farmerName.trim() || !location.trim())) {
      toast.error('Please enter your name and location for farmer registration');
      return;
    }
    
    // Validate buyer information
    if (isBuyerSelected && !buyerName.trim()) {
      toast.error('Please enter your name for buyer registration');
      return;
    }
    
    try {
      setLoading(true);
      let registeredAsFarmer = false;
      let registeredAsBuyer = false;
      
      // Register as farmer if selected
      if (isFarmerSelected) {
        try {
          await registerAsFarmer(farmerName, location);
          registeredAsFarmer = true;
        } catch (error) {
          console.error('Farmer registration error:', error);
          // Check if this is an "Already registered" error
          if (error.message && (error.message.includes('Already registered') || 
              (error.reason && error.reason.includes('Already registered')))) {
            toast.info('You are already registered as a farmer. You can proceed to login.');
            // Set as registered so user can proceed
            registeredAsFarmer = true;
          } else {
            toast.error(formatBlockchainError(error) || 'Failed to register as farmer');
          }
        }
      }
      
      // Register as buyer if selected
      if (isBuyerSelected) {
        try {
          await registerAsBuyer(buyerName);
          registeredAsBuyer = true;
        } catch (error) {
          console.error('Buyer registration error:', error);
          // Check if this is an "Already registered" error
          if (error.message && (error.message.includes('Already registered') || 
              (error.reason && error.reason.includes('Already registered')))) {
            toast.info('You are already registered as a buyer. You can proceed to login.');
            // Set as registered so user can proceed
            registeredAsBuyer = true;
          } else {
            toast.error(formatBlockchainError(error) || 'Failed to register as buyer');
          }
        }
      }
      
      // Navigate based on registration results
      if (registeredAsFarmer && registeredAsBuyer) {
        toast.success('Successfully registered as both farmer and buyer!');
        // Redirect to a screen to choose which role to use now
        navigate('/login');
      } else if (registeredAsFarmer) {
        toast.success('Successfully registered as farmer!');
        navigate('/farmer');
      } else if (registeredAsBuyer) {
        toast.success('Successfully registered as buyer!');
        navigate('/buyer-dashboard');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(formatBlockchainError(error) || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
              sign in to your existing account
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
                <label className="block text-sm font-medium text-gray-700">Register as (select all that apply)</label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div 
                    className={`border rounded-md px-3 py-2 cursor-pointer text-center ${
                      selectedRoles.includes(ROLES.FARMER) 
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRole(ROLES.FARMER)}
                  >
                    Farmer
                  </div>
                  <div 
                    className={`border rounded-md px-3 py-2 cursor-pointer text-center ${
                      selectedRoles.includes(ROLES.BUYER) 
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRole(ROLES.BUYER)}
                  >
                    Buyer
                  </div>
                </div>
              </div>
              
              {selectedRoles.includes(ROLES.FARMER) && (
                <div className="space-y-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                  <h3 className="text-md font-medium text-yellow-700">Farmer Information</h3>
                  <div>
                    <label htmlFor="farmerName" className="block text-sm font-medium text-gray-700">
                      Farmer Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="farmerName"
                        name="farmerName"
                        type="text"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Farm Location
                    </label>
                    <div className="mt-1">
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedRoles.includes(ROLES.BUYER) && (
                <div className="space-y-4 p-4 border border-blue-200 bg-blue-50 rounded-md">
                  <h3 className="text-md font-medium text-blue-700">Buyer Information</h3>
                  <div>
                    <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700">
                      Buyer Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="buyerName"
                        name="buyerName"
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !account || selectedRoles.length === 0 || 
                    (selectedRoles.includes(ROLES.FARMER) && (!farmerName.trim() || !location.trim())) || 
                    (selectedRoles.includes(ROLES.BUYER) && !buyerName.trim())}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </div>
                  ) : 'Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
