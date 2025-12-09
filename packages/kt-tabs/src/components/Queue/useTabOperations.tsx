import { useState, useCallback, useEffect } from 'react';
import { useDataProvider, useRefresh, useNotify } from 'react-admin';
import { OperationQueue } from './OperationQueue';


/**
 * Custom hook for managing tab operations with a queue
 * @param delayMs Delay between operations in milliseconds
 */
export const useTabOperations = (delayMs = 1000) => {
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();
  const [queueSize, setQueueSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create queue with callback to update queue size state
  const operationQueue = new OperationQueue(delayMs, (size) => {
    setQueueSize(size);
    setIsProcessing(size > 0);
  });

  // Show toast message
  const showMessage = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    notify(message, { type });
  }, [notify]);

  // Update tab status with queuing
  const updateTabStatus = useCallback((id: number, status: string) => {
    showMessage(`Tab #${id} queued for status update to ${status}`, 'info');
    
    return operationQueue.add(() => 
      dataProvider.update(`tab/tab`, {
        id: id,
        data: { status },
        previousData: undefined
      }).then(() => {
        showMessage(`Tab #${id} updated to ${status}`, 'success');
        refresh();
        return Promise.resolve();
      }).catch((error: any) => {
        showMessage(`Error updating Tab #${id}: ${error?.message || 'Unknown error'}`, 'error');
        return Promise.reject(error);
      })
    );
  }, [dataProvider, refresh, operationQueue, showMessage]);

  // Close tab (specific operation for closing)
  const closeTab = useCallback((id: number) => {
    return updateTabStatus(id, "CLOSED");
  }, [updateTabStatus]);

  return {
    updateTabStatus,
    closeTab,
    queueSize,
    isProcessing
  };
};