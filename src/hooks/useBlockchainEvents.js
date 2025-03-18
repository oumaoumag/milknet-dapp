import { useEffect, useState, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

/**
 * Custom hook to listen for blockchain events and trigger callbacks
 * @param {Object} options - Configuration options
 * @param {boolean} options.listenForOrders - Whether to listen for order events
 * @param {boolean} options.listenForBatches - Whether to listen for batch events
 * @param {Function} options.onOrderEvent - Callback when an order event is detected
 * @param {Function} options.onBatchEvent - Callback when a batch event is detected
 */
export function useBlockchainEvents({
  listenForOrders = true,
  listenForBatches = true,
  onOrderEvent = null,
  onBatchEvent = null
}) {
  const { contract } = useWeb3();
  const [isListening, setIsListening] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  
  const handleOrderEvent = useCallback((event) => {
    console.log('Order event detected:', event);
    setLastEvent({
      type: 'order',
      data: event,
      timestamp: Date.now()
    });
    
    if (onOrderEvent && typeof onOrderEvent === 'function') {
      onOrderEvent(event);
    } else {
      // Default behavior
      toast.info('Order update detected! Refreshing data...');
    }
  }, [onOrderEvent]);
  
  const handleBatchEvent = useCallback((event) => {
    console.log('Batch event detected:', event);
    setLastEvent({
      type: 'batch',
      data: event,
      timestamp: Date.now()
    });
    
    if (onBatchEvent && typeof onBatchEvent === 'function') {
      onBatchEvent(event);
    } else {
      // Default behavior
      toast.info('Batch update detected! Refreshing data...');
    }
  }, [onBatchEvent]);
  
  useEffect(() => {
    if (!contract) {
      setIsListening(false);
      return;
    }
    
    // Define the event listeners
    let orderPlacedListener = null;
    let orderCompletedListener = null;
    let orderCancelledListener = null;
    let batchCreatedListener = null;
    let batchDeletedListener = null;
    
    const setupListeners = async () => {
      try {
        if (listenForOrders) {
          // Order events
          orderPlacedListener = contract.on('OrderPlaced', 
            (orderId, buyer, batchId, event) => {
              handleOrderEvent({
                name: 'OrderPlaced',
                orderId: orderId.toString(),
                buyer,
                batchId: batchId.toString(),
                event
              });
            }
          );
          
          orderCompletedListener = contract.on('OrderCompleted', 
            (orderId, event) => {
              handleOrderEvent({
                name: 'OrderCompleted',
                orderId: orderId.toString(),
                event
              });
            }
          );
          
          orderCancelledListener = contract.on('OrderCancelled', 
            (orderId, event) => {
              handleOrderEvent({
                name: 'OrderCancelled',
                orderId: orderId.toString(),
                event
              });
            }
          );
        }
        
        if (listenForBatches) {
          // Batch events
          batchCreatedListener = contract.on('BatchCreated', 
            (batchId, farmer, event) => {
              handleBatchEvent({
                name: 'BatchCreated',
                batchId: batchId.toString(),
                farmer,
                event
              });
            }
          );
          
          batchDeletedListener = contract.on('BatchDeleted', 
            (batchId, event) => {
              handleBatchEvent({
                name: 'BatchDeleted',
                batchId: batchId.toString(),
                event
              });
            }
          );
        }
        
        setIsListening(true);
        console.log('Blockchain event listeners established');
      } catch (error) {
        console.error('Error setting up blockchain event listeners:', error);
        setIsListening(false);
      }
    };
    
    setupListeners();
    
    // Cleanup function to remove listeners
    return () => {
      try {
        if (orderPlacedListener) {
          contract.off('OrderPlaced', orderPlacedListener);
        }
        if (orderCompletedListener) {
          contract.off('OrderCompleted', orderCompletedListener);
        }
        if (orderCancelledListener) {
          contract.off('OrderCancelled', orderCancelledListener);
        }
        if (batchCreatedListener) {
          contract.off('BatchCreated', batchCreatedListener);
        }
        if (batchDeletedListener) {
          contract.off('BatchDeleted', batchDeletedListener);
        }
        
        console.log('Blockchain event listeners removed');
        setIsListening(false);
      } catch (error) {
        console.error('Error removing blockchain event listeners:', error);
      }
    };
  }, [contract, handleOrderEvent, handleBatchEvent, listenForOrders, listenForBatches]);
  
  return {
    isListening,
    lastEvent
  };
} 