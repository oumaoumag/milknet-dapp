import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import ConfirmDelivery from './ConfirmDelivery';
import SubmitReview from './SubmitReview';

export default function OrderList({ orders, onOrderUpdate }) {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);

  // Function to handle order updates
  const handleOrderUpdate = () => {
    setShowReviewForm(false);
    setShowConfirmForm(false);
    setSelectedOrderId(null);
    if (onOrderUpdate) {
      onOrderUpdate();
    }
  };

  // Helper function to get status-based color classes
  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can confirm delivery (farmers for processing orders)
  const canConfirmDelivery = (order) => {
    return user && 
           user.role === ROLES.FARMER && 
           order.status.toLowerCase() === 'processing' &&
           order.farmerAddress.toLowerCase() === user.address.toLowerCase();
  };

  // Check if user can submit review (buyers for completed orders)
  const canSubmitReview = (order) => {
    return user && 
           user.role === ROLES.BUYER && 
           order.status.toLowerCase() === 'completed' &&
           order.buyerAddress.toLowerCase() === user.address.toLowerCase() &&
           !order.hasReview; // Assuming there's a flag to indicate if review exists
  };

  // Check if user can file dispute (buyers for non-disputed orders)
  const canFileDispute = (order) => {
    return user && 
           user.role === ROLES.BUYER && 
           order.status.toLowerCase() !== 'disputed' &&
           order.status.toLowerCase() !== 'cancelled' &&
           order.buyerAddress.toLowerCase() === user.address.toLowerCase();
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.orderId} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Order header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-lg">Order #{order.orderId}</h4>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-semibold">
                  Ξ{order.totalPrice}
                </span>
              </div>
            </div>
            
            {/* Order details */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Batch ID</p>
                  <p className="font-medium">{order.batchId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quantity</p>
                  <p className="font-medium">{order.quantity} liters</p>
                </div>
              </div>
            </div>
            
            {/* Order actions */}
            <div className="bg-gray-50 px-4 py-3 flex flex-wrap gap-2">
              {canConfirmDelivery(order) && (
                <button 
                  onClick={() => {
                    setSelectedOrderId(order.orderId);
                    setShowConfirmForm(true);
                    setShowReviewForm(false);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Confirm Delivery
                </button>
              )}
              
              {canSubmitReview(order) && (
                <button 
                  onClick={() => {
                    setSelectedOrderId(order.orderId);
                    setShowReviewForm(true);
                    setShowConfirmForm(false);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Review
                </button>
              )}
              
              {canFileDispute(order) && (
                <Link 
                  to={`/file-dispute/${order.orderId}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  File Dispute
                </Link>
              )}
            </div>
            
            {/* Conditionally render confirm delivery form */}
            {showConfirmForm && selectedOrderId === order.orderId && (
              <div className="border-t border-gray-200 p-4">
                <ConfirmDelivery 
                  orderId={order.orderId}
                  buyerAddress={order.buyerAddress}
                  onComplete={handleOrderUpdate}
                />
              </div>
            )}
            
            {/* Conditionally render review form */}
            {showReviewForm && selectedOrderId === order.orderId && (
              <div className="border-t border-gray-200 p-4">
                <SubmitReview 
                  orderId={order.orderId}
                  onClose={handleOrderUpdate}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
} 