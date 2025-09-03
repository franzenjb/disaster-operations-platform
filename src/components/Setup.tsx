/**
 * Setup Component
 * Initial configuration and "Start Here" section for disaster operations
 */

import React, { useState, useEffect } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { eventBus, EventType } from '../core/EventBus';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export function Setup() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateOperation = useOperationStore(state => state.updateOperation);
  
  const [disasterStartDate, setDisasterStartDate] = useState<string>(
    operation?.startDate || new Date().toISOString().split('T')[0]
  );
  
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'start-date',
      title: 'Set Disaster Start Date',
      description: 'Define when the disaster event began',
      completed: !!operation?.startDate,
      required: true
    },
    {
      id: 'command-structure',
      title: 'Establish Command Structure',
      description: 'Identify DRO Director and key leadership',
      completed: false,
      required: true
    },
    {
      id: 'operational-period',
      title: 'Define Operational Period',
      description: 'Set the current operational period for IAP',
      completed: !!operation?.iap?.meta?.operationalPeriod?.start,
      required: true
    },
    {
      id: 'affected-counties',
      title: 'Select Affected Counties',
      description: 'Mark all counties in the disaster area',
      completed: operation?.geography?.counties?.length > 0,
      required: true
    },
    {
      id: 'initial-assessment',
      title: 'Complete Initial Assessment',
      description: 'Document initial disaster impacts and needs',
      completed: false,
      required: false
    },
    {
      id: 'resource-request',
      title: 'Submit Resource Requests',
      description: 'Request ERKs, shelters, and personnel',
      completed: false,
      required: false
    },
    {
      id: 'partner-coordination',
      title: 'Coordinate with Partners',
      description: 'Establish contact with FEMA, state, and local EOCs',
      completed: false,
      required: false
    },
    {
      id: 'reporting-schedule',
      title: 'Set Reporting Schedule',
      description: 'Define daily briefing and reporting times',
      completed: false,
      required: false
    }
  ]);
  
  const [commandStructure, setCommandStructure] = useState({
    droDirector: operation?.command?.droDirector?.name || '',
    deputyDirector: operation?.command?.deputyDirector?.name || '',
    chiefOfStaff: operation?.command?.chiefOfStaff?.name || '',
    adOperations: operation?.command?.sectionChiefs?.operations?.name || '',
    adPlanning: operation?.command?.sectionChiefs?.planning?.name || '',
    adLogistics: operation?.command?.sectionChiefs?.logistics?.name || '',
    adFinance: operation?.command?.sectionChiefs?.finance?.name || '',
  });
  
  const [operationalPeriod, setOperationalPeriod] = useState({
    start: operation?.iap?.meta?.operationalPeriod?.start || new Date().toISOString(),
    end: operation?.iap?.meta?.operationalPeriod?.end || 
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  
  const handleStartDateChange = (date: string) => {
    setDisasterStartDate(date);
    if (operation) {
      updateOperation({ ...operation, startDate: date });
      eventBus.emit(EventType.DATA_ENTRY, {
        operationId: operation.id,
        field: 'startDate',
        value: date,
        timestamp: new Date()
      });
      
      // Update step completion
      setSetupSteps(prev => prev.map(step => 
        step.id === 'start-date' ? { ...step, completed: true } : step
      ));
    }
  };
  
  const handleCommandStructureUpdate = (field: string, value: string) => {
    const updated = { ...commandStructure, [field]: value };
    setCommandStructure(updated);
    
    if (operation) {
      const commandUpdate = {
        ...operation.command,
        droDirector: { ...operation.command.droDirector, name: updated.droDirector },
        deputyDirector: { ...operation.command.deputyDirector, name: updated.deputyDirector },
        chiefOfStaff: { ...operation.command.chiefOfStaff, name: updated.chiefOfStaff },
        sectionChiefs: {
          ...operation.command.sectionChiefs,
          operations: { name: updated.adOperations },
          planning: { name: updated.adPlanning },
          logistics: { name: updated.adLogistics },
          finance: { name: updated.adFinance },
        }
      };
      
      updateOperation({ ...operation, command: commandUpdate });
      
      // Check if command structure is complete
      const isComplete = updated.droDirector && updated.deputyDirector;
      setSetupSteps(prev => prev.map(step => 
        step.id === 'command-structure' ? { ...step, completed: isComplete } : step
      ));
    }
  };
  
  const handleOperationalPeriodUpdate = (field: 'start' | 'end', value: string) => {
    const updated = { ...operationalPeriod, [field]: value };
    setOperationalPeriod(updated);
    
    if (operation && operation.iap) {
      const iapUpdate = {
        ...operation.iap,
        meta: {
          ...operation.iap.meta,
          operationalPeriod: updated
        }
      };
      
      updateOperation({ ...operation, iap: iapUpdate });
      
      setSetupSteps(prev => prev.map(step => 
        step.id === 'operational-period' ? { ...step, completed: true } : step
      ));
    }
  };
  
  const completedSteps = setupSteps.filter(s => s.completed).length;
  const requiredSteps = setupSteps.filter(s => s.required).length;
  const requiredCompleted = setupSteps.filter(s => s.required && s.completed).length;
  const progressPercent = (completedSteps / setupSteps.length) * 100;
  
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Setup Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-medium">
                {completedSteps} of {setupSteps.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-cross-red h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${requiredCompleted === requiredSteps ? 'text-green-600' : 'text-orange-600'}`}>
              {requiredCompleted === requiredSteps ? '✓' : '!'} Required Steps: {requiredCompleted}/{requiredSteps}
            </span>
          </div>
        </div>
      </div>
      
      {/* Step 1: Disaster Start Date */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Step 1: Disaster Start Date</h3>
            <p className="text-sm text-gray-600 mt-1">
              This date marks the beginning of the disaster event
            </p>
          </div>
          {setupSteps[0].completed && (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disaster Start Date *
            </label>
            <input
              type="date"
              value={disasterStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          {disasterStartDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                Days since disaster: <strong>{Math.floor((Date.now() - new Date(disasterStartDate).getTime()) / (1000 * 60 * 60 * 24))}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Step 2: Command Structure */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Step 2: Command Structure</h3>
            <p className="text-sm text-gray-600 mt-1">
              Identify key leadership positions
            </p>
          </div>
          {setupSteps[1].completed && (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DRO Director *
            </label>
            <input
              type="text"
              value={commandStructure.droDirector}
              onChange={(e) => handleCommandStructureUpdate('droDirector', e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deputy Director *
            </label>
            <input
              type="text"
              value={commandStructure.deputyDirector}
              onChange={(e) => handleCommandStructureUpdate('deputyDirector', e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chief of Staff
            </label>
            <input
              type="text"
              value={commandStructure.chiefOfStaff}
              onChange={(e) => handleCommandStructureUpdate('chiefOfStaff', e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AD Operations
            </label>
            <input
              type="text"
              value={commandStructure.adOperations}
              onChange={(e) => handleCommandStructureUpdate('adOperations', e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AD Planning
            </label>
            <input
              type="text"
              value={commandStructure.adPlanning}
              onChange={(e) => handleCommandStructureUpdate('adPlanning', e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AD Logistics
            </label>
            <input
              type="text"
              value={commandStructure.adLogistics}
              onChange={(e) => handleCommandStructureUpdate('adLogistics', e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>
      
      {/* Step 3: Operational Period */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Step 3: Operational Period</h3>
            <p className="text-sm text-gray-600 mt-1">
              Define the current IAP operational period
            </p>
          </div>
          {setupSteps[2].completed && (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Start *
            </label>
            <input
              type="datetime-local"
              value={operationalPeriod.start.slice(0, 16)}
              onChange={(e) => handleOperationalPeriodUpdate('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period End *
            </label>
            <input
              type="datetime-local"
              value={operationalPeriod.end.slice(0, 16)}
              onChange={(e) => handleOperationalPeriodUpdate('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>
      
      {/* Setup Checklist */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Setup Checklist</h3>
        <div className="space-y-2">
          {setupSteps.map(step => (
            <div 
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                step.completed ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    step.required ? 'border-red-500' : 'border-gray-300'
                  }`} />
                )}
                <div>
                  <div className="font-medium text-sm">
                    {step.title}
                    {step.required && (
                      <span className="ml-2 text-xs text-red-600">Required</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{step.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Reference */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold mb-3">Quick Reference</h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <strong>DR Number:</strong> {operation?.id}
          </div>
          <div className="flex gap-2">
            <strong>Operation Name:</strong> {operation?.operationName}
          </div>
          <div className="flex gap-2">
            <strong>Region:</strong> {operation?.region}
          </div>
          <div className="flex gap-2">
            <strong>Type:</strong> {operation?.type}
          </div>
        </div>
      </div>
    </div>
  );
}