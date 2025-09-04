/**
 * ICS Form 215 Demo Component
 * 
 * Demonstrates the complete ICS Form 215 implementation with sample data
 * from Hurricane Ian Response (DR836-23) - October 26, 2022
 */

import React, { useState, useEffect } from 'react';
import { ICS215StandardForm } from './ICS215StandardForm';
import { ICS215GridInterface } from './ICS215GridInterface';
import { ICS215GuidedEntry } from './ICS215GuidedEntry';
import { ICS215Worksheet, WorkAssignment, RedCrossDivision } from '../../types/ics-215-types';
import { clearICS215Data } from '../../utils/clearICS215Data';
import { useICS215GridStore } from '../../stores/useICS215GridStore';

export function ICS215Demo() {
  const [viewMode, setViewMode] = useState<'guided' | 'grid' | 'standard'>('guided');
  const [isLoading, setIsLoading] = useState(false);
  const [worksheetData, setWorksheetData] = useState<ICS215Worksheet | null>(null);
  const [workAssignments, setWorkAssignments] = useState<WorkAssignment[]>([]);

  // Get summary from grid store for display
  const getIAPSummary = useICS215GridStore(state => state.getIAPSummary);

  useEffect(() => {
    // Start with clean data - no demo data
    const initializeCleanWorksheet = () => {
      // Create empty worksheet with basic info only
      const emptyWorksheet: ICS215Worksheet = {
        id: `worksheet-${Date.now()}`,
        worksheetId: `ICS-215-${new Date().toISOString().split('T')[0]}`,
        operationId: 'current',
        worksheetNumber: 1,
        operationalPeriodStart: new Date(),
        operationalPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
        incidentName: '',
        incidentNumber: '',
        preparedBy: '',
        preparedDate: new Date(),
        sectionType: 'Operations',
        status: 'draft',
        priorityLevel: 1,
        missionStatement: '',
        situationSummary: '',
        specialInstructions: '',
        versionNumber: 1,
        isCurrentVersion: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Start with NO assignments - completely empty
      const emptyAssignments: WorkAssignment[] = [];
      
      setWorksheetData(emptyWorksheet);
      setWorkAssignments(emptyAssignments);
      setIsLoading(false);
    };

    initializeCleanWorksheet();
  }, []);

  const handleSave = async (data: { worksheet: ICS215Worksheet; assignments: WorkAssignment[] }) => {
    console.log('Saving ICS 215 Data:', data);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setWorksheetData(data.worksheet);
    setWorkAssignments(data.assignments);
    
    alert('ICS Form 215 saved successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-cross-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Hurricane Ian Response data...</p>
          <p className="text-sm text-gray-500">DR836-23 - October 26, 2022</p>
        </div>
      </div>
    );
  }

  if (!worksheetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load worksheet data</p>
        </div>
      </div>
    );
  }

  // Always show the header with view toggle, then conditionally show the content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header with View Toggle - Always visible */}
      <div className="bg-blue-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">ICS Form 215 - Operational Planning Worksheet</h1>
            <p className="mt-1 text-blue-100">
              Operational Period: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-200">
              Enter resources using Guided Entry, then view in Excel Grid or Full Form
            </p>
            
            {/* View Mode Toggle */}
            <div className="mt-4 flex justify-center">
              <div className="inline-flex rounded-lg shadow-sm" role="group">
                <button
                  onClick={() => setViewMode('guided')}
                  className={`px-6 py-3 text-white rounded-l-lg transition-all ${
                    viewMode === 'guided' 
                      ? 'bg-green-600 font-semibold shadow-inner' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    ✨ <span>Guided Entry</span>
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-6 py-3 text-white transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-700 font-semibold shadow-inner' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    📊 <span>Excel Grid</span>
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('standard')}
                  className={`px-6 py-3 text-white rounded-r-lg transition-all ${
                    viewMode === 'standard' 
                      ? 'bg-gray-600 font-semibold shadow-inner' 
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    📝 <span>Full Form</span>
                  </span>
                </button>
              </div>
            </div>
            
            {/* Mode descriptions */}
            <div className="mt-3 text-sm text-blue-100">
              {viewMode === 'guided' && "Step-by-step entry for one resource at a time - perfect for field workers"}
              {viewMode === 'grid' && "Excel-like interface for bulk data entry and review"}
              {viewMode === 'standard' && "Complete ICS Form 215 with all sections"}
            </div>
          </div>
        </div>
      </div>

      {/* Conditionally render the view based on mode */}
      {viewMode === 'guided' ? (
        <ICS215GuidedEntry 
          onSave={(resource) => {
            console.log('Resource saved:', resource);
            // In production, this would save to the database
          }}
        />
      ) : viewMode === 'grid' ? (
        <ICS215GridInterface />
      ) : (
        <>
          {/* Form Component */}
          <ICS215StandardForm
            worksheetData={worksheetData}
            workAssignments={workAssignments}
            onSave={handleSave}
            printMode={false}
            readonly={false}
          />
        </>
      )}
    </div>
  );
}