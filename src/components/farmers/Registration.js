import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { getContract } from '../../utils/blockchain';
import { useNavigate } from 'react-router-dom';

export default function FarmerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    certification: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');
  const { account, networkName } = useWeb3();
  const navigate = useNavigate();

  // Check existing registration status
  useEffect(() => {
    const checkRegistration = async () => {
      if (account) {
        try {
          const contract = await getContract();
          const farmerData = await contract.farmers(account);
          if (farmerData.isRegistered) {
            setRegistrationStatus('already-registered');
          }
        } catch (error) {
          console.error('Registration check error:', error);
        }
      }
    };
    checkRegistration();
  }, [account]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!account) {
        throw new Error('No connected wallet account');
      }

      if (!formData.name.trim()) {
        throw new Error('Farm name is required');
      }

      const contract = await getContract();
      
      // Validate farmer registration status
      const farmerData = await contract.farmers(account);
      if (farmerData.isRegistered) {
        throw new Error('This account is already registered as a farmer');
      }

      // Execute registration transaction
      const tx = await contract.registerFarmer(formData.name);
      await tx.wait(); // Wait for transaction confirmation

      // Post-registration actions
      setRegistrationStatus('success');
      console.log('Farmer registered successfully on', networkName);
      
      // Redirect to dashboard after short delay
      setTimeout(() => navigate('/farmer/dashboard'), 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.reason || error.message || 'Registration failed');
      setRegistrationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationStatus === 'already-registered') {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <h3 className="text-xl mb-4">Already Registered</h3>
        <button 
          onClick={() => navigate('/farmer/dashboard')}
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
        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-2">Certifications</label>
            <textarea
              value={formData.certification}
              onChange={(e) => setFormData({...formData, certification: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              rows="3"
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
}