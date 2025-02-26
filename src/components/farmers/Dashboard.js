import { useEffect, useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import CreateBatch from '../batches/CreateBatch';
import BatchList from '../batches/BatchList';

export default function FarmerDashboard() {
  const { contract, account } = useWeb3();
  const [farmerData, setFarmerData] = useState(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFarmerData = async () => {
      setIsLoading(true);
      if (contract && account) {
        try {
          const data = await contract.getFarmer(account);
          const batches = await contract.fetchBatches(); // Not yet implemented
          setFarmerData({ ...data, batches });
        } catch (error) {
          console.error("Error loading farmer data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadFarmerData();
  }, [contract, account]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-green-700 mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!farmerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 w-full max-w-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">Unable to load farmer data. Please check your connection.</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {farmerData.name}</h2>
          <p className="text-gray-600">Manage your milk batches and track your business</p>
        </div>
        <button 
          onClick={() => setShowBatchForm(!showBatchForm)}
          className={`mt-4 md:mt-0 px-6 py-3 rounded-lg font-medium transition-all transform hover:shadow-lg ${
            showBatchForm 
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
              : 'bg-green-700 hover:bg-green-800 text-white'
          }`}
        >
          {showBatchForm ? 'Cancel' : 'Add New Batch'}
        </button>
      </div>

      {showBatchForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <CreateBatch />
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Batches</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{farmerData.batches.length}</p>
          <p className="text-sm text-gray-500 mt-2">Total milk batches registered</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Active Orders</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{farmerData.activeOrders || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Orders in progress</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {farmerData.revenue ? `${farmerData.revenue} ETH` : '0 ETH'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total earnings</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Rating</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {farmerData.rating ? farmerData.rating : '5.0'}
            <span className="text-sm text-yellow-500 ml-2">★★★★★</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Buyer satisfaction</p>
        </div>
      </section>

      <h3 className="text-xl font-bold text-gray-800 mb-6">Your Milk Batches</h3>
      <BatchList batches={farmerData.batches} />
    </div>
  );
}