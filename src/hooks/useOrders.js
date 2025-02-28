import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

export function useOrders(address) {
  const { contract } = useWeb3();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      // Get all orders and filter by farmer address
      const rawOrders = [];
      const orderCount = await contract.orderCounter();
      
      for (let i = 1; i <= orderCount; i++) {
        const order = await contract.orders(i);
        if (order.farmerAddress === address) {
          rawOrders.push(order);
        }
      }
      
      setOrders(rawOrders.map(order => ({
        ...order,
        totalPrice: ethers.formatUnits(order.totalPrice, 'ether'),
        status: order.isDelivered ? 'Delivered' : 'Pending',
        orderDate: new Date(order.orderDate * 1000)
      })));
    };
    
    if (address && contract) load();
  }, [address, contract]);

  return orders;
} 