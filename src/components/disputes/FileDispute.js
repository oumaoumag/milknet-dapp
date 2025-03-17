import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { formatBlockchainError } from '../../utils/errorUtils';

export default function FileDispute() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const { contract, account } = useWeb3();
  const { user } = useAuth();
  
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch order details
  useEffect(() => {
    async function fetchOrderDetails() {
      if (!contract || !account || !orderId) {
        setLoadingOrder(false);
        return;
      }
      
      try {
        setLoadingOrder(true);
        
        // Import the fetch order details function
        const { fetchBuyerOrders } = await import('../../utils/contractCalls');
        const orders = await fetchBuyerOrders(contract, account);
        
        // Find the specific order
        const order = orders.find(o => o.orderId.toString() === orderId);
        
        if (order) {
          setOrderDetails({
            orderId: order.orderId.toString(),
            batchId: order.batchId.toString(),
            quantity: order.quantity.toString(),
            totalPrice: parseFloat(ethers.formatEther(order.totalPrice)).toFixed(4),
            status: getOrderStatus(order.status),
            orderDate: new Date(order.timestamp * 1000).toISOString(),
            buyerAddress: order.buyer,
            farmerAddress: order.farmer
          });
        } else {
          setErrorMsg('Order not found or you are not authorized to view it');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setErrorMsg('Failed to load order details');
      } finally {
        setLoadingOrder(false);
      }
    }
    
    fetchOrderDetails();
  }, [contract, account, orderId]);

  // Helper to convert numeric status to text
  const getOrderStatus = (statusCode) => {
    const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled', 'Disputed'];
    if (typeof statusCode === 'number' && statusCode >= 0 && statusCode < statuses.length) {
      return statuses[statusCode];
    }
    if (typeof statusCode === 'string') {
      return statusCode;
    }
    return 'Unknown';
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!reason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    
    if (!contract || !account) {
      toast.error('Wallet not connected');
      return;
    }
    
    if (!orderDetails) {
      toast.error('Order details not available');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMsg('');
      
      // Create evidence hash - in a real app this could be an IPFS hash of evidence files
      const evidenceHash = evidence.trim() 
        ? ethers.keccak256(ethers.toUtf8Bytes(evidence)) 
        : ethers.ZeroHash;
      
      toast.info('Submitting dispute...');
      const tx = await contract.fileDispute(
        orderDetails.orderId,
        orderDetails.farmerAddress,
        reason,
        evidenceHash
      );
      
      toast.info('Waiting for transaction confirmation...');
      await tx.wait();
      
      toast.success('Dispute filed successfully');
      navigate('/dashboard'); // Navigate back to dashboard after successful submission
    } catch (error) {
      console.error('Error filing dispute:', error);
      const formattedError = formatBlockchainError(error);
      setErrorMsg(formattedError);
      toast.error('Failed to file dispute: ' + formattedError);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You need to be logged in as a buyer to file disputes.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              to="/"
              className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-8 mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">File a Dispute</h1>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {loadingOrder ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Loading order details...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
        </div>
      ) : orderDetails ? (
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about the order being disputed.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{orderDetails.orderId}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Batch ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{orderDetails.batchId}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{orderDetails.quantity} Liters</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">Ξ{orderDetails.totalPrice}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(orderDetails.orderDate)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
${orderDetails.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {orderDetails.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Dispute Form</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Please provide details about your complaint.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Dispute <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="4"
                  className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe the issue with your order in detail..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Evidence (optional)
                </label>
                <textarea
                  id="evidence"
                  name="evidence"
                  rows="3"
                  className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Provide any additional details, evidence, or context..."
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  In a production version, this would support file uploads for photographic evidence.
                </p>
              </div>
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errorMsg}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-4 flex justify-end">
                <Link
                  to="/dashboard"
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${loading ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Submit Dispute'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No order details available.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Return to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}