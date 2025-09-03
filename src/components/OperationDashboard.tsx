/**
 * Operation Dashboard
 * 
 * This is the main operational view once an operation is started.
 * Notice how everything is reactive - no manual updates needed!
 */

import React, { useState } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { USCountyMap } from './USCountyMap';
import { UnifiedIAP } from './iap/UnifiedIAP';
import { EventLog } from './EventLog';

type TabType = 'overview' | 'iap' | 'events';

export function OperationDashboard() {
  const operation = useOperationStore(state => state.currentOperation);
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  if (!operation) return null;
  
  return (
    <>
      {/* Tab Navigation - Fixed at top below main header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8 px-4 sm:px-6 lg:px-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'iap', label: 'Live IAP', icon: '📋' },
            { id: 'events', label: 'Event Log', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-red-cross-red text-red-cross-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          </nav>
        </div>
      </div>

      {/* Main Content Container - with padding for fixed nav */}
      <div className="pt-16 space-y-6">
        {/* Operation Header */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {operation.operationName}
              </h1>
              <p className="text-gray-600">{operation.id}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(operation.metadata.created).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-red-cross-red">
                {selectedCounties.length}
              </div>
              <div className="text-sm text-gray-600">Counties Affected</div>
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Operation Area</h2>
              <USCountyMap />
            </div>
            
            {/* Statistics */}
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Current Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Stat 
                    label="Meals Served (Line 9)" 
                    value={operation.serviceLines.feeding.totalMealsToDate} 
                  />
                  <Stat 
                    label="Shelters Open (Line 38)" 
                    value={operation.serviceLines.sheltering.sheltersOpen} 
                  />
                  <Stat 
                    label="Clients Served (Line 44)" 
                    value={operation.serviceLines.sheltering.totalClientsServed} 
                  />
                  <Stat 
                    label="IAP Version" 
                    value={`#${operation.iap.meta.iapNumber}`} 
                  />
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Operation Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Operational Period</span>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Total Personnel</span>
                    <span className="text-sm font-medium">--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'iap' && (
          <UnifiedIAP operationId={operation.id} />
        )}
        
        {activeTab === 'events' && <EventLog />}
        </div>
      </div>
      
      {/* Real-time Indicator */}
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">
            All changes auto-saved
          </span>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-gray-900">{value || 0}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}