import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { formatDate, calculateDaysLeft, convertToEth, convertToKES } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { contract, account, currencyMode } = useWeb3();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [displayOrders, setDisplayOrders] = useState([]);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!contract || !account) return;
      
      try {
        setLoading(true);
        
        // Fix: The getBuyerOrders method doesn't exist on the contract
        // Let's try a more generic approach to get orders
        console.log("Fetching orders for buyer:", account);
        
        // First, get how many orders exist in total
        const orderCount = await contract.orderCounter();
        console.log("Total order count:", orderCount.toString());
        
        // Then iterate through all orders and filter for the current buyer
        const orderIds = [];
        for (let i = 1; i <= orderCount; i++) {
          try {
            const order = await contract.getOrderDetails(i);
            if (order && order.buyer && order.buyer.toLowerCase() === account.toLowerCase()) {
              orderIds.push(i);
            }
          } catch (err) {
            console.log(`Could not fetch details for order ${i}:`, err);
            // Continue to next order
          }
        }
        
        console.log("Found order IDs for buyer:", orderIds);
        
        // Fetch details for each order
        const fetchedOrders = await Promise.all(
          orderIds.map(async (orderId) => {
            const order = await contract.getOrderDetails(orderId);
            const batch = await contract.getBatchDetails(order.batchId);
            
            return {
              id: orderId.toString(),
              ...order,
              batch: {
                id: order.batchId.toString(),
                ...batch
              },
              // Ensure these properties exist for calculations
              status: order.status?.toString() || "0",
              totalPrice: order.totalPrice?.toString() || "0",
              orderDate: order.timestamp ? order.timestamp.toString() : Date.now().toString()
            };
          })
        );
        
        console.log('Fetched orders:', fetchedOrders);
        
        // Sort orders by date (newest first)
        fetchedOrders.sort((a, b) => parseInt(b.orderDate) - parseInt(a.orderDate));
        
        setOrders(fetchedOrders);
        setDisplayOrders(fetchedOrders);
        
        // Calculate stats
        const totalOrders = fetchedOrders.length;
        const pendingOrders = fetchedOrders.filter(order => order.status === '0').length;
        const completedOrders = fetchedOrders.filter(order => order.status === '1').length;
        const totalSpent = fetchedOrders.reduce((acc, order) => {
          return order.status === '1' ? acc + parseInt(order.totalPrice) : acc;
        }, 0);
        
        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent
        });
        
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [contract, account]);

  // Filter orders based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setDisplayOrders(orders);
    } else if (activeTab === 'pending') {
      setDisplayOrders(orders.filter(order => order.status === '0'));
    } else if (activeTab === 'completed') {
      setDisplayOrders(orders.filter(order => order.status === '1'));
    }
  }, [activeTab, orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-xl shadow-lg mb-8">
        <div className="px-6 py-8 sm:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Buyer Dashboard</h1>
              <p className="text-green-100">Track your orders and discover new milk batches</p>
            </div>
            <Link 
              to="/marketplace" 
              className="mt-4 md:mt-0 bg-white hover:bg-gray-100 text-green-800 font-semibold py-2 px-6 rounded-lg transition-all flex items-center shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completedOrders}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">
                {currencyMode === 'ETH' 
                  ? `${convertToEth(stats.totalSpent)} ETH` 
                  : `${convertToKES(stats.totalSpent)} KES`}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Orders Section */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-green-900 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Your Orders</h2>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium flex items-center transition-colors ${
                activeTab === 'all'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Orders ({stats.totalOrders})
            </button>
            
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium flex items-center transition-colors ${
                activeTab === 'pending'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending ({stats.pendingOrders})
            </button>
            
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-4 text-sm font-medium flex items-center transition-colors ${
                activeTab === 'completed'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed ({stats.completedOrders})
            </button>
          </nav>
        </div>
        
        {displayOrders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet" 
                : `You don't have any ${activeTab} orders`}
            </p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total ({currencyMode === 'ETH' ? 'ETH' : 'KES'})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.orderDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.quantity} L</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {currencyMode === 'ETH' 
                        ? `${convertToEth(order.totalPrice)} ETH` 
                        : `${convertToKES(order.totalPrice)} KES`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === '0' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.status === '0' ? 'Pending' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/order/${order.id}`} className="text-green-600 hover:text-green-800 transition-colors">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Recommended Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recommended for You</h2>
          <Link 
            to="/marketplace" 
            className="text-green-600 hover:text-green-800 flex items-center transition-colors"
          >
            View All
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This would be filled with actual recommended batches data */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="h-3 bg-gradient-to-r from-green-500 to-green-700"></div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Fresh Milk Batch</h3>
                  <p className="text-sm text-gray-500">Farmer: ABC Farm</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Fresh</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">100 L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires in:</span>
                  <span className="font-medium">7 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per liter:</span>
                  <span className="font-medium text-green-600">
                    {currencyMode === 'ETH' ? '0.01 ETH' : '500 KES'}
                  </span>
                </div>
              </div>
              <button 
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all flex items-center justify-center"
                onClick={() => navigate('/marketplace')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="h-3 bg-gradient-to-r from-green-500 to-green-700"></div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Premium Milk</h3>
                  <p className="text-sm text-gray-500">Farmer: XYZ Dairy</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Fresh</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">75 L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires in:</span>
                  <span className="font-medium">5 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per liter:</span>
                  <span className="font-medium text-green-600">
                    {currencyMode === 'ETH' ? '0.012 ETH' : '550 KES'}
                  </span>
                </div>
              </div>
              <button 
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all flex items-center justify-center"
                onClick={() => navigate('/marketplace')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="h-3 bg-gradient-to-r from-green-500 to-green-700"></div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Organic Milk</h3>
                  <p className="text-sm text-gray-500">Farmer: Green Fields</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Fresh</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">50 L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires in:</span>
                  <span className="font-medium">6 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per liter:</span>
                  <span className="font-medium text-green-600">
                    {currencyMode === 'ETH' ? '0.015 ETH' : '600 KES'}
                  </span>
                </div>
              </div>
              <button 
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all flex items-center justify-center"
                onClick={() => navigate('/marketplace')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-colors cursor-pointer" onClick={() => navigate('/marketplace')}>
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Browse Marketplace</h3>
                <p className="text-sm text-green-100">Discover fresh milk batches</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Manage Profile</h3>
                <p className="text-sm text-green-100">Update your information</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-colors cursor-pointer" onClick={() => window.open('https://etherscan.io', '_blank')}>
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Transaction History</h3>
                <p className="text-sm text-green-100">View blockchain activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
