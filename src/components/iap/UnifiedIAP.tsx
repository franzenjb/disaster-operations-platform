/**
 * Unified IAP Component - Always Live, Always Editable
 * 
 * No more separate builder and viewer. This is THE IAP.
 * Edit in place, auto-saves, version controlled.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IAPDocument, RichTextSection } from '../../core/DisasterOperation';
import { eventBus, EventType } from '../../core/EventBus';
import { useOperationStore } from '../../stores/useOperationStore';

interface UnifiedIAPProps {
  operationId: string;
  readOnly?: boolean; // For viewing historical versions
}

export const UnifiedIAP: React.FC<UnifiedIAPProps> = ({ operationId, readOnly = false }) => {
  const operation = useOperationStore(state => state.currentOperation);
  const [iap, setIap] = useState<IAPDocument | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Load IAP data
  useEffect(() => {
    if (operation?.iap) {
      setIap(operation.iap);
    }
  }, [operation]);

  // Auto-save on changes
  const handleSectionChange = useCallback((sectionId: string, content: any) => {
    if (readOnly) return;
    
    setAutoSaveStatus('saving');
    
    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    // Debounce saves by 500ms
    autoSaveTimer.current = setTimeout(() => {
      eventBus.emit(EventType.IAP_SECTION_EDITED, {
        sectionId,
        content,
        timestamp: Date.now()
      });
      
      setAutoSaveStatus('saved');
    }, 500);
  }, [readOnly]);

  // Handle section locking for collaboration
  const handleStartEditing = (sectionId: string) => {
    if (readOnly) return;
    
    setEditingSection(sectionId);
    eventBus.emit(EventType.IAP_SECTION_LOCKED, { sectionId });
  };

  const handleStopEditing = (sectionId: string) => {
    setEditingSection(null);
    eventBus.emit(EventType.IAP_SECTION_UNLOCKED, { sectionId });
  };

  // Print/Export function
  const handlePrint = () => {
    window.print(); // CSS will handle print styling
  };

  const handleExportPDF = async () => {
    // Will implement with jsPDF or similar
    console.log('Exporting to PDF...');
  };

  if (!iap) {
    return <div>Loading IAP...</div>;
  }

  return (
    <div className="unified-iap">
      {/* Header Bar - Always visible */}
      <div className="iap-header sticky top-0 bg-white shadow-md p-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            IAP #{iap.meta.iapNumber} - {operation?.operationName}
          </h1>
          <span className="text-sm text-gray-500">
            {autoSaveStatus === 'saving' && '⏳ Saving...'}
            {autoSaveStatus === 'saved' && '✅ Saved'}
            {autoSaveStatus === 'error' && '❌ Save failed'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🖨️ Print
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* IAP Content - The 16 Pages */}
      <div className="iap-content max-w-6xl mx-auto p-8">
        
        {/* Page 1: Cover Page */}
        <IAPPage pageNumber={1}>
          <IAPCover 
            iap={iap}
            operation={operation}
            onEdit={!readOnly ? handleSectionChange : undefined}
          />
        </IAPPage>

        {/* Page 2: Director's Intent */}
        <IAPPage pageNumber={2}>
          <EditableSection
            id="directorsIntent"
            title="Director's Intent/Message"
            content={iap.sections.directorsIntent}
            onEdit={handleSectionChange}
            onStartEdit={() => handleStartEditing('directorsIntent')}
            onStopEdit={() => handleStopEditing('directorsIntent')}
            isEditing={editingSection === 'directorsIntent'}
            readOnly={readOnly}
          />
        </IAPPage>

        {/* Page 3: Priorities and Objectives */}
        <IAPPage pageNumber={3}>
          <PrioritiesObjectives
            priorities={iap.sections.priorities}
            objectives={iap.sections.objectives}
            onEdit={handleSectionChange}
            readOnly={readOnly}
          />
        </IAPPage>

        {/* Continue for all 16 pages... */}
        
      </div>

      {/* Collaboration Indicators */}
      {!readOnly && iap.currentEditors.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 print:hidden">
          <h3 className="font-semibold mb-2">Currently Editing:</h3>
          {iap.currentEditors.map(editor => (
            <div key={editor.userId} className="text-sm">
              {editor.userId} - {editor.section}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable page wrapper
const IAPPage: React.FC<{ pageNumber: number; children: React.ReactNode }> = ({ 
  pageNumber, 
  children 
}) => (
  <div className="iap-page bg-white shadow-lg mb-8 print:shadow-none print:mb-0 print:page-break-after">
    <div className="p-8">
      {children}
    </div>
    <div className="text-center text-sm text-gray-500 mt-8 print:mt-4">
      Page {pageNumber} of 16
    </div>
  </div>
);

// Editable rich text section
const EditableSection: React.FC<{
  id: string;
  title: string;
  content: RichTextSection;
  onEdit: (id: string, content: any) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  isEditing: boolean;
  readOnly?: boolean;
}> = ({ id, title, content, onEdit, onStartEdit, onStopEdit, isEditing, readOnly }) => {
  const [localContent, setLocalContent] = useState(content.content);
  
  useEffect(() => {
    setLocalContent(content.content);
  }, [content.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onEdit(id, { ...content, content: newContent, lastModified: new Date() });
  };

  if (readOnly) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {isEditing ? (
        <div>
          <textarea
            value={localContent}
            onChange={handleChange}
            onBlur={onStopEdit}
            className="w-full h-64 p-4 border rounded"
            placeholder={`Enter ${title}...`}
            autoFocus
          />
          <div className="text-sm text-gray-500 mt-2">
            Last modified: {new Date(content.lastModified).toLocaleString()}
            {content.modifiedBy && ` by ${content.modifiedBy}`}
          </div>
        </div>
      ) : (
        <div 
          onClick={onStartEdit}
          className="prose max-w-none cursor-pointer hover:bg-gray-50 p-4 rounded transition-colors"
        >
          {content.content || <span className="text-gray-400">Click to add {title}</span>}
        </div>
      )}
    </div>
  );
};

// Priorities and Objectives component
const PrioritiesObjectives: React.FC<{
  priorities: any;
  objectives: any;
  onEdit: (id: string, content: any) => void;
  readOnly?: boolean;
}> = ({ priorities, objectives, onEdit, readOnly }) => {
  // Implementation for structured priorities/objectives editing
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Incident Priorities and Objectives</h2>
      {/* Priority and objective editing UI */}
    </div>
  );
};

// Cover page component
const IAPCover: React.FC<{
  iap: IAPDocument;
  operation: any;
  onEdit?: (id: string, content: any) => void;
}> = ({ iap, operation, onEdit }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Incident Action Plan</h1>
      <div className="mb-8">
        <div className="text-xl">{operation?.operationName}</div>
        <div>DR {operation?.id}</div>
        <div>IAP #{iap.meta.iapNumber}</div>
        <div>
          Operational Period: {new Date(iap.meta.operationalPeriod.start).toLocaleString()} 
          {' to '}
          {new Date(iap.meta.operationalPeriod.end).toLocaleString()}
        </div>
      </div>
      {/* Document checklist table would go here */}
    </div>
  );
};