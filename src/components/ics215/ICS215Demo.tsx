/**
 * ICS Form 215 Demo Component
 * 
 * Demonstrates the complete ICS Form 215 implementation with sample data
 * from Hurricane Ian Response (DR836-23) - October 26, 2022
 */

import React, { useState, useEffect } from 'react';
import { ICS215StandardForm } from './ICS215StandardForm';
import { ICS215GridInterface } from './ICS215GridInterface';
import { ICS215Worksheet, WorkAssignment, RedCrossDivision } from '../../types/ics-215-types';

export function ICS215Demo() {
  const [viewMode, setViewMode] = useState<'grid' | 'standard'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [worksheetData, setWorksheetData] = useState<ICS215Worksheet | null>(null);
  const [workAssignments, setWorkAssignments] = useState<WorkAssignment[]>([]);

  useEffect(() => {
    // Simulate loading sample data from Hurricane Ian Response
    const loadSampleData = async () => {
      setIsLoading(true);
      
      // Sample worksheet data based on actual DR836-23
      const sampleWorksheet: ICS215Worksheet = {
        id: 'worksheet-dr836-23-001',
        worksheetId: 'ICS-215-DR836-23-20221026-001',
        operationId: 'DR836-23',
        worksheetNumber: 1,
        operationalPeriodStart: new Date('2022-10-26T08:00:00'),
        operationalPeriodEnd: new Date('2022-10-26T20:00:00'),
        incidentName: 'Hurricane Ian Response - Southwest Florida',
        incidentNumber: 'DR836-23',
        preparedBy: 'John Smith, Planning Section Chief',
        preparedDate: new Date('2022-10-26T07:30:00'),
        sectionType: 'Operations',
        status: 'approved',
        priorityLevel: 1,
        missionStatement: 'Provide emergency mass care services including feeding, sheltering, and emergency supplies distribution to hurricane-affected populations in Lee, Charlotte, and Collier Counties.',
        situationSummary: 'Hurricane Ian made landfall as Category 4 storm on September 28, 2022. Widespread power outages affecting 2.5M customers, severe flooding in coastal areas, and significant structural damage. Estimated 400,000 residents displaced. State of Emergency declared for all 67 Florida counties.',
        specialInstructions: 'Coordinate with state EOC and local emergency management. All field teams use unified command structure. Priority focus on barrier islands and coastal communities. Maintain 24-hour communications with Incident Command.',
        versionNumber: 1,
        isCurrentVersion: true,
        createdAt: new Date('2022-10-26T06:00:00'),
        updatedAt: new Date('2022-10-26T07:30:00')
      };

      // Sample work assignments representing typical Red Cross disaster response
      const sampleAssignments: WorkAssignment[] = [
        {
          id: 'assignment-001',
          worksheetId: 'worksheet-dr836-23-001',
          assignmentNumber: '1',
          divisionGroup: 'Feeding_Food_Services',
          workAssignmentName: 'Fixed Site Feeding - Fort Myers Convention Center',
          workLocation: '1375 Monroe St, Fort Myers, FL 33901',
          reportTime: new Date('2022-10-26T09:00:00'),
          specialInstructions: 'Target 2,000 meals per operational period. Coordinate with Salvation Army for additional capacity.',
          resourceRequirements: [
            {
              id: 'resource-001-001',
              assignmentId: 'assignment-001',
              resourceKind: 'Personnel',
              resourceType: 'ERV Team Leader',
              numberOfPersons: 1,
              quantityRequested: 1,
              quantityHave: 1,
              quantityNeed: 0,
              leader: 'Maria Garcia',
              contactInfo: 'Radio: TAC-1, Cell: 239-555-0123',
              status: 'available'
            },
            {
              id: 'resource-001-002',
              assignmentId: 'assignment-001',
              resourceKind: 'Personnel',
              resourceType: 'Food Service Volunteers',
              numberOfPersons: 8,
              quantityRequested: 8,
              quantityHave: 6,
              quantityNeed: 2,
              status: 'requested'
            },
            {
              id: 'resource-001-003',
              assignmentId: 'assignment-001',
              resourceKind: 'Vehicles',
              resourceType: 'Emergency Response Vehicles (ERV)',
              numberOfPersons: 2,
              quantityRequested: 2,
              quantityHave: 2,
              quantityNeed: 0,
              status: 'available'
            }
          ],
          status: 'in_progress',
          progressPercentage: 75,
          createdAt: new Date('2022-10-26T06:30:00'),
          updatedAt: new Date('2022-10-26T07:15:00')
        },
        {
          id: 'assignment-002',
          worksheetId: 'worksheet-dr836-23-001',
          assignmentNumber: '2',
          divisionGroup: 'Sheltering_Dormitory_Operations',
          workAssignmentName: 'Emergency Shelter Operations - Hertz Arena',
          workLocation: '11000 Everblades Pkwy, Estero, FL 33928',
          reportTime: new Date('2022-10-26T08:30:00'),
          specialInstructions: 'Congregate care facility. Capacity 500 clients. ADA compliant. Pet-friendly shelter.',
          resourceRequirements: [
            {
              id: 'resource-002-001',
              assignmentId: 'assignment-002',
              resourceKind: 'Personnel',
              resourceType: 'Shelter Manager',
              numberOfPersons: 1,
              quantityRequested: 1,
              quantityHave: 1,
              quantityNeed: 0,
              leader: 'Robert Chen',
              contactInfo: 'Radio: COMMAND, Cell: 239-555-0456',
              status: 'available'
            },
            {
              id: 'resource-002-002',
              assignmentId: 'assignment-002',
              resourceKind: 'Personnel',
              resourceType: 'Shelter Staff',
              numberOfPersons: 12,
              quantityRequested: 12,
              quantityHave: 8,
              quantityNeed: 4,
              status: 'requested'
            },
            {
              id: 'resource-002-003',
              assignmentId: 'assignment-002',
              resourceKind: 'Supplies',
              resourceType: 'Cots and Blankets',
              numberOfPersons: 0,
              quantityRequested: 500,
              quantityHave: 300,
              quantityNeed: 200,
              status: 'requested'
            }
          ],
          status: 'in_progress',
          progressPercentage: 60,
          createdAt: new Date('2022-10-26T06:45:00'),
          updatedAt: new Date('2022-10-26T07:20:00')
        },
        {
          id: 'assignment-003',
          worksheetId: 'worksheet-dr836-23-001',
          assignmentNumber: '3',
          divisionGroup: 'Mass_Care_Distribution_Emergency_Supplies',
          workAssignmentName: 'Bulk Distribution - Sanibel Causeway',
          workLocation: 'Sanibel Causeway Mainland Side, Fort Myers, FL',
          reportTime: new Date('2022-10-26T10:00:00'),
          specialInstructions: 'Bridge access limited. Coordinate with Coast Guard for boat transport to barrier islands.',
          resourceRequirements: [
            {
              id: 'resource-003-001',
              assignmentId: 'assignment-003',
              resourceKind: 'Personnel',
              resourceType: 'Distribution Team Leader',
              numberOfPersons: 1,
              quantityRequested: 1,
              quantityHave: 0,
              quantityNeed: 1,
              status: 'requested'
            },
            {
              id: 'resource-003-002',
              assignmentId: 'assignment-003',
              resourceKind: 'Vehicles',
              resourceType: 'Supply Trucks',
              numberOfPersons: 0,
              quantityRequested: 3,
              quantityHave: 2,
              quantityNeed: 1,
              status: 'enroute'
            },
            {
              id: 'resource-003-003',
              assignmentId: 'assignment-003',
              resourceKind: 'Supplies',
              resourceType: 'Emergency Supply Kits',
              numberOfPersons: 0,
              quantityRequested: 1000,
              quantityHave: 750,
              quantityNeed: 250,
              status: 'requested'
            }
          ],
          status: 'assigned',
          progressPercentage: 25,
          createdAt: new Date('2022-10-26T07:00:00'),
          updatedAt: new Date('2022-10-26T07:30:00')
        },
        {
          id: 'assignment-004',
          worksheetId: 'worksheet-dr836-23-001',
          assignmentNumber: '4',
          divisionGroup: 'Health_Services',
          workAssignmentName: 'Mobile Health Services - Pine Island',
          workLocation: 'Pine Island, FL (Mobile Operations)',
          reportTime: new Date('2022-10-26T11:00:00'),
          specialInstructions: 'Remote area with limited access. Focus on elderly population and those with medical needs.',
          resourceRequirements: [
            {
              id: 'resource-004-001',
              assignmentId: 'assignment-004',
              resourceKind: 'Personnel',
              resourceType: 'Registered Nurse',
              numberOfPersons: 2,
              quantityRequested: 2,
              quantityHave: 1,
              quantityNeed: 1,
              leader: 'Susan Lee, RN',
              contactInfo: 'Radio: MED-1, Cell: 239-555-0789',
              status: 'requested'
            },
            {
              id: 'resource-004-002',
              assignmentId: 'assignment-004',
              resourceKind: 'Vehicles',
              resourceType: 'Mobile Health Unit',
              numberOfPersons: 0,
              quantityRequested: 1,
              quantityHave: 1,
              quantityNeed: 0,
              status: 'available'
            }
          ],
          status: 'assigned',
          progressPercentage: 10,
          createdAt: new Date('2022-10-26T07:15:00'),
          updatedAt: new Date('2022-10-26T07:25:00')
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorksheetData(sampleWorksheet);
      setWorkAssignments(sampleAssignments);
      setIsLoading(false);
    };

    loadSampleData();
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
              Demo: Hurricane Ian Response (DR836-23) - October 26, 2022
            </p>
            <p className="text-sm text-blue-200">
              This form replicates the exact Excel structure used by Red Cross disaster response teams
            </p>
            
            {/* View Mode Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-white rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-800 font-semibold' 
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                📊 Excel Grid View
              </button>
              <button
                onClick={() => setViewMode('standard')}
                className={`px-4 py-2 text-white rounded-r-lg transition-colors ${
                  viewMode === 'standard' 
                    ? 'bg-blue-600 font-semibold' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                📝 Standard Form View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conditionally render the view based on mode */}
      {viewMode === 'grid' ? (
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
          
          {/* Demo Information */}
          <div className="bg-gray-100 border-t border-gray-200 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Demo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Real Disaster Data</h4>
                    <p className="text-sm text-gray-600">
                      This form contains sample data based on the actual Hurricane Ian response in Southwest Florida,
                      demonstrating how Red Cross teams would use ICS Form 215 during major disaster operations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Standard ICS Format</h4>
                    <p className="text-sm text-gray-600">
                      The form follows the exact structure of the standard ICS Form 215, including all required fields,
                      Red Cross operational divisions, and resource requirement calculations.
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Features Demonstrated</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Standard ICS 215 header with incident information and operational period</li>
                    <li>• Red Cross operational divisions (Feeding, Sheltering, Mass Care, Health Services, etc.)</li>
                    <li>• Work assignments with resource requirements and Have/Need calculations</li>
                    <li>• Real-time editing and automatic save functionality</li>
                    <li>• Print-friendly format matching the original Excel worksheet</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}