import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { contract, account } = useWeb3();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!contract || !account) return;
      
      try {
        setLoading(true);
        
        try {
          // Import the fetchBuyerOrders function
          const { fetchBuyerOrders } = await import('../../utils/contractCalls');
          
          // Fetch actual orders from the contract
          const buyerOrders = await fetchBuyerOrders(contract, account);
          
          if (buyerOrders && buyerOrders.length > 0) {
            // Format the orders for display
            const formattedOrders = buyerOrders.map(order => ({
              orderId: order.orderId.toString(),
              batchId: order.batchId.toString(),
              quantity: order.quantity.toString(),
              totalPrice: parseFloat(ethers.formatEther(order.totalPrice)).toFixed(4),
              status: getOrderStatus(order.status),
              orderDate: new Date(order.timestamp * 1000).toISOString(),
              buyerAddress: order.buyer,
              farmerAddress: order.farmer
            }));
            
            setOrders(formattedOrders);
          } else {
            // If no orders found or contract doesn't support it, use placeholder
            // TODO: Remove placeholder data in production
            console.log('No orders found or contract function not available, using placeholders');
            const placeholderOrders = [
              {
                orderId: '1',
                batchId: '101',
                quantity: '25',
                totalPrice: 0.05,
                status: 'Pending',
                orderDate: new Date(Date.now() - 86400000).toISOString() // 1 day ago
              },
              {
                orderId: '2',
                batchId: '102',
                quantity: '50',
                totalPrice: 0.1,
                status: 'Completed',
                orderDate: new Date(Date.now() - 172800000).toISOString() // 2 days ago
              }
            ];
            
            setOrders(placeholderOrders);
          }
        } catch (contractError) {
          console.error('Error with contract call:', contractError);
          
          // Fallback to placeholder data if contract call fails
          const placeholderOrders = [
            {
              orderId: '1',
              batchId: '101',
              quantity: '25',
              totalPrice: 0.05,
              status: 'Pending',
              orderDate: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
              orderId: '2',
              batchId: '102',
              quantity: '50',
              totalPrice: 0.1,
              status: 'Completed',
              orderDate: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            }
          ];
          
          setOrders(placeholderOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [contract, account]);

  // Helper to convert numeric status to text
  const getOrderStatus = (statusCode) => {
    const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled', 'Disputed'];
    // If statusCode is a number and in range, return the status text
    if (typeof statusCode === 'number' && statusCode >= 0 && statusCode < statuses.length) {
      return statuses[statusCode];
    }
    // If statusCode is already a string, return it
    if (typeof statusCode === 'string') {
      return statusCode;
    }
    // Default fallback
    return 'Unknown';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!contract || !account) {
      toast.error('Wallet not connected');
      return;
    }
    
    try {
      toast.info('Sending cancellation request...');
      const tx = await contract.cancelOrder(orderId);
      toast.info('Waiting for transaction confirmation...');
      await tx.wait();
      toast.success('Order cancelled successfully');
      
      // Refresh the orders list
      const { fetchBuyerOrders } = await import('../../utils/contractCalls');
      const buyerOrders = await fetchBuyerOrders(contract, account);
      const formattedOrders = buyerOrders.map(order => ({
        orderId: order.orderId.toString(),
        batchId: order.batchId.toString(),
        quantity: order.quantity.toString(),
        totalPrice: parseFloat(ethers.formatEther(order.totalPrice)).toFixed(4),
        status: getOrderStatus(order.status),
        orderDate: new Date(order.timestamp * 1000).toISOString(),
        buyerAddress: order.buyer,
        farmerAddress: order.farmer
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order: ' + error.message);
    }
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            View Marketplace
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Buyer Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and preferences.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.name || 'Not available'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Wallet address</dt>
              <dd className="mt-1 text-sm text-gray-900 truncate">{account || 'Not connected'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Registered on</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.registeredAt ? formatDate(user.registeredAt) : 'Not available'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">Buyer</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Orders</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">History of your milk batch orders.</p>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">You haven't placed any orders yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/marketplace" className="font-medium text-yellow-600 hover:text-yellow-500">
                  Browse the marketplace
                </Link>{' '}
                to find milk batches.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Batch #{order.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.quantity} Liters
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Ξ{order.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : order.status === 'Processing' 
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Disputed' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <Link 
                            to={`/marketplace?batchId=${order.batchId}`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            View Batch
                          </Link>
                          {order.status === 'Pending' && (
                            <button 
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                          {order.status === 'Completed' && (
                            <Link 
                              to={`/dispute/${order.orderId}`}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Dispute
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
