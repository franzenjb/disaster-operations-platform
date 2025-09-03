/**
 * Service Line Entry Component
 * Complete Form 5266 Data Entry with Rich Accordions
 */

import React from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { FeedingServiceLine } from './servicelines/FeedingServiceLine';
import { ShelteringServiceLine } from './servicelines/ShelteringServiceLine';

export function ServiceLineEntry() {
  const operation = useOperationStore(state => state.currentOperation);
  
  if (!operation) {
    return <div>No active operation</div>;
  }
  
  // Calculate summary statistics
  const totalMeals = operation.serviceLines.feeding.totalMealsToDate || 0;
  const sheltersOpen = operation.serviceLines.sheltering.sheltersOpen || 0;
  const clientsSheltered = operation.serviceLines.sheltering.totalClientsServed || 0;
  const totalStaff = (operation.serviceLines.feeding.feedingStaff || 0) + 
                    (operation.serviceLines.sheltering.shelterStaff || 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 5266 Service Line Data Entry
        </h2>
        <p className="text-gray-600">
          Enter daily operational data for all service lines. Data auto-saves as you type.
          All line items match the official Red Cross Form 5266.
        </p>
      </div>
      
      {/* Quick Stats Dashboard */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Operation Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold">{totalMeals.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Meals (Line 9)</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{sheltersOpen}</div>
            <div className="text-sm opacity-90">Shelters Open (Line 38)</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{clientsSheltered.toLocaleString()}</div>
            <div className="text-sm opacity-90">Clients Sheltered (Line 44)</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{totalStaff}</div>
            <div className="text-sm opacity-90">Total Staff</div>
          </div>
        </div>
      </div>
      
      {/* Service Line Accordions */}
      <div className="space-y-4">
        <FeedingServiceLine />
        <ShelteringServiceLine />
        
        {/* Placeholder for additional service lines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📦 Mass Care & Distribution (Lines 16-25)
          </h3>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🏥 Health Services (Lines 49-56)
          </h3>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            👥 Staffing & Volunteers (Lines 57-65)
          </h3>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🏛️ Government Liaison (Lines 26-30)
          </h3>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
      
      {/* Export/Print Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            📄 Export to PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            📊 Export to Excel
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
}