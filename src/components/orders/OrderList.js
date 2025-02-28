import React from 'react';

export default function OrderList({ orders }) {
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.orderId} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Order #{order.orderId}</h4>
              <p className="text-sm text-gray-500">
                {order.status} • {order.orderDate.toLocaleDateString()}
              </p>
            </div>
            <span className="text-lg font-semibold">
              Ξ{order.totalPrice}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 