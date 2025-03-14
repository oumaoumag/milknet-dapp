import { useEffect, useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { ethers } from 'ethers';
import CreateBatch from '../batches/CreateBatch';
import OrderList from '../orders/OrderList';
import { useOrders } from '../../hooks/useOrders';
import { fetchBatches } from '../../utils/contractCalls';
import { motion } from 'framer-motion';
import Header from '../Header.jsx';

export default function FarmerDashboard() {
  const { contract, account, userRole } = useWeb3();
  const [farmerData, setFarmerData] = useState(null);
  const [batches, setBatches] = useState([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const orders = useOrders(account);
  const [loadedOrders, setLoadedOrders] = useState([]);

  useEffect(() => {
    const loadFarmerData = async () => {
      setIsLoading(true);
      if (contract && account) {
        try {
          // Load farmer profile data
          const data = await contract.farmers(account);
          
          // Fetch batches using both methods for compatibility
          const allBatches = await fetchBatches(contract);
          const farmerBatches = allBatches.filter(b => b.farmerAddress === account);
          
          // Format batches with additional information
          const formattedBatches = farmerBatches.map(batch => ({
            ...batch,
            batchId: Number(batch.batchId),
            quantity: Number(batch.quantity),
            pricePerLiter: ethers.formatUnits(batch.pricePerLiter || batch.pricePerLiterWei, 'ether'),
            expiryDate: new Date(Number(batch.expiryDate) * 1000),
            isAvailable: (batch.flags & 0x1) !== 0 && (batch.flags & 0x2) === 0
          }));
          
          setBatches(formattedBatches);
          setFarmerData({ ...data, batches: formattedBatches });

          // Fetch orders if not using the hook
          if (!orders.length) {
            const orderIds = await contract.getFarmerOrders(account);
            const orderData = await Promise.all(
              orderIds.map(async (id) => {
                const order = await contract.orders(id);
                return {
                  orderId: Number(order.orderId),
                  buyer: order.buyer,
                  quantity: Number(order.quantity),
                  totalPrice: ethers.formatUnits(order.totalPrice, 'ether'),
                  isDelivered: order.isDelivered,
                };
              })
            );
            setLoadedOrders(orderData);
          }
        } catch (error) {
          console.error("Error loading farmer data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadFarmerData();
  }, [contract, account, orders.length]);

  const toggleAvailability = async (batchId) => {
    try {
      const tx = await contract.toggleBatchAvailability(batchId);
      await tx.wait();
      setBatches(batches.map(b => 
        b.batchId === batchId ? { ...b, isAvailable: !b.isAvailable } : b
      ));
      
      // Update in farmerData as well
      setFarmerData(prev => ({
        ...prev,
        batches: prev.batches.map(b => 
          b.batchId === batchId ? { ...b, isAvailable: !b.isAvailable } : b
        )
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (userRole !== 'farmer') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8 text-red-500 font-medium">
          Access Denied. This page is for farmers only.
        </div>
      </div>
    );
  }

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
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // Use orders from hook or fallback to loaded orders
  const displayOrders = orders.length > 0 ? orders : loadedOrders;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Header />
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {farmerData.name || 'Farmer'}</h1>
        <p className="opacity-90">Manage your dairy business with real-time insights and secure transactions</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {['overview', 'orders', 'batches'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Stats Cards */}
            <StatsCard
              title="Total Batches"
              value={batches.length}
              description="Registered milk batches"
              icon="batch"
              color="green"
            />
            <StatsCard
              title="Active Orders"
              value={displayOrders.length}
              description="Orders in progress"
              icon="order"
              color="blue"
            />
            <StatsCard
              title="Revenue"
              value={`${farmerData.revenue || '0'} ETH`}
              description="Total earnings"
              icon="revenue"
              color="yellow"
            />
            <StatsCard
              title="Rating"
              value={farmerData.rating || '5.0'}
              description="Buyer satisfaction"
              icon="star"
              color="purple"
              showStars
            />
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {displayOrders.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No orders yet.</p>
            ) : (
              <OrderList orders={displayOrders} />
            )}
          </motion.div>
        )}

        {activeTab === 'batches' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Milk Batches</h2>
              <button
                onClick={() => setShowBatchForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Register New Batch
              </button>
            </div>
            {showBatchForm && (
              <CreateBatch onClose={() => setShowBatchForm(false)} />
            )}
            {batches.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No batches registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map(batch => (
                  <div key={batch.batchId} className="bg-white p-4 rounded-lg shadow">
                    <p>Batch ID: {batch.batchId}</p>
                    <p>Quantity: {batch.quantity} L</p>
                    <p>Price: {batch.pricePerLiter} ETH/L</p>
                    <p>Expiry: {batch.expiryDate.toLocaleDateString()}</p>
                    <p>Status: {batch.isAvailable ? 'Available' : 'Unavailable'}</p>
                    <button
                      onClick={() => toggleAvailability(batch.batchId)}
                      className="mt-2 bg-yellow-400 text-black py-1 px-4 rounded hover:bg-yellow-500"
                    >
                      Toggle Availability
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helper component for stats cards
function StatsCard({ title, value, description, icon, color, showStars }) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow`}>
      <div className={`flex items-center mb-4`}>
        <div className={`bg-${color}-100 p-3 rounded-lg mr-4`}>
          <IconComponent name={icon} color={color} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-800">
        {value}
        {showStars && <span className="text-sm text-yellow-500 ml-2">★★★★★</span>}
      </p>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}

function IconComponent({ name, color }) {
  const iconClasses = `w-6 h-6 text-${color}-600`;
  
  const icons = {
    batch: (
      <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    order: (
      <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    revenue: (
      <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    star: (
      <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  };

  return icons[name] || null;
}