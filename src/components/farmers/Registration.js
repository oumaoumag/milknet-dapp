import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { form } from 'framer-motion/client';

export default function FarmerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    certification: null
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');
  const { account, contract } = useWeb3();
  const navigate = useNavigate();

  // Check existing registration status
  useEffect(() => {
    const checkRegistration = async () => {
      if (account && contract) {
        try {
          const farmerData = await contract.farmers(account);
          if ((BigInt(farmerData.flags) & BigInt(1)) !== BigInt(0)) {
            setRegistrationStatus('already-registered');
          } else {
            setRegistrationStatus('unregistered');
          }
        } catch (error) {     
            setRegistrationStatus('unregistered');
            console.error('Registration check error:', error);
          }
      }
    };
    checkRegistration();
  }, [account, contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      setError('Contract not initialized - check network connection');
      return;
    }
    
    setIsLoading(true);
    try {
      if (formData.name.length < 2 || formData.name.length > 64) {
        setError('Name must be between 2 and 64 characters');
        return;
      }
      if (formData.location.length === 0 || formData.location.length > 32) {
        setError('LOcation must be between 1 and 32 characters');
        return;
      }
      if (!formData.certification) {
        setError('Please upload a certification document');
        return;
      }
      const tx = await contract.registerFarmer(
        formData.name,
        formData.location,
        formData.certification,
        { gasLimit: 500000 }
      );
      await tx.wait();
      navigate('/farmer');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationStatus === 'already-registered') {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <h3 className="text-xl mb-4">Already Registered</h3>
        <button 
          onClick={() => navigate('/farmer')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl mb-6 text-center">Farmer Registration</h2>
      
      {registrationStatus === 'success' ? (
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-700">Registration successful! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Farm Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Certification (PDF or Image) *</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const bytes = new Uint8Array(reader.result);
                  const hash = ethers.keccak256(bytes)
                  setFormData({...formData, certification: hash});
                };
                reader.readAsArrayBuffer(file);
              }
              }}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              accept=".pdf,image/*"
              required
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded text-white ${
              isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Complete Registration'}
          </button>
        </form>
      )}
    </div>
  );
}g