import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatBlockchainError } from '../../utils/errorUtils';

export default function RoleSelector() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState({ isFarmer: false, isBuyer: false });
  const [checkingRoles, setCheckingRoles] = useState(true);
  const { login, checkUserRoles } = useAuth();
  const { account } = useWeb3();
  const navigate = useNavigate();
  
  // Check available roles when component mounts
  useEffect(() => {
    const checkRoles = async () => {
      if (!account) {
        navigate('/login');
        return;
      }
      
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
        toast.error('Failed to load your roles. Please try again.');
      } finally {
        setCheckingRoles(false);
      }
    };
    
    checkRoles();
  }, [account, checkUserRoles, navigate]);

  const handleContinue = async () => {
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

  if (!account) {
    return null; // This should not render if there's no account, should navigate to login
  }

  return (
    <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Choose Role</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select which role you want to use
          </p>
        </div>
        
        <div className="mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">Connected Wallet</label>
            <div className="mt-1 flex items-center bg-gray-100 rounded-md px-3 py-2 text-gray-600">
              <span className="truncate">{account}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
            {checkingRoles ? (
              <div className="mt-2 text-sm text-gray-600 flex items-center justify-center py-4">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                        ? 'bg-green-50 border-green-500 text-green-700 cursor-pointer' 
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
                        ? 'bg-green-50 border-green-500 text-green-700 cursor-pointer' 
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
                You haven't registered for any roles yet. <a href="/register" className="font-semibold text-green-600 hover:underline">Register now</a>.
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading || !role}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 