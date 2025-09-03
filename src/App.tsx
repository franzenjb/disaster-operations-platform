/**
 * Main Application Component
 * 
 * This demonstrates the power of the event-driven architecture.
 * Notice how clean this is compared to the old system!
 */

import React, { useState, useEffect } from 'react';
import { useOperationStore } from './stores/useOperationStore';
import { StartOperation } from './components/StartOperation';
import { OperationDashboard } from './components/OperationDashboard';
import { eventBus, EventType } from './core/EventBus';

export function App() {
  const currentOperation = useOperationStore(state => state.currentOperation);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    navigator.onLine ? 'online' : 'offline'
  );
  
  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    eventBus.on(EventType.ONLINE_MODE, handleOnline);
    eventBus.on(EventType.OFFLINE_MODE, handleOffline);
    
    return () => {
      // Cleanup would go here
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-red-cross-red">Red Cross</span> Disaster Operations
              </h1>
              {currentOperation && (
                <span className="ml-4 text-sm text-gray-600">
                  {currentOperation.id} - {currentOperation.operationName}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Network Status Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  networkStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600">
                  {networkStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentOperation ? (
          <StartOperation />
        ) : (
          <OperationDashboard />
        )}
      </main>
    </div>
  );
}