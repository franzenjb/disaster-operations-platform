/**
 * Disaster Operations Platform - Core Data Model
 * 
 * This is the single source of truth for all disaster operation data.
 * Built to last 20 years and serve all 50 states + territories.
 */

export interface DisasterOperation {
  // Identity
  id: string;                    // DR-2024-FL-001
  operationName: string;         // "Hurricane Milton Response"
  
  // Metadata
  metadata: {
    created: Date;
    modified: Date;
    version: number;
    status: 'planning' | 'active' | 'closing' | 'closed';
    visibility: 'draft' | 'published';
  };
  
  // Geographic scope
  geography: {
    regions: Region[];
    counties: County[];
    chapters: Chapter[];
    affectedArea: GeoJSON.FeatureCollection;
  };
  
  // Command structure
  command: {
    droDirector: Contact;
    deputyDirector: Contact;
    chiefOfStaff?: Contact;
    sectionChiefs: {
      operations: Contact;
      planning: Contact;
      logistics: Contact;
      finance: Contact;
      workforce?: Contact;
    };
  };
  
  // Service delivery data (the actual Form 5266 lines)
  serviceLines: {
    feeding: FeedingData;
    sheltering: ShelteringData;
    health: HealthData;
    distribution: DistributionData;
    recovery: RecoveryData;
    logistics: LogisticsData;
  };
  
  // IAP - The living document
  iap: IAPDocument;
  
  // Audit & compliance
  audit: AuditEntry[];
  
  // Real-time collaboration
  collaboration: {
    activeUsers: string[];
    locks: ResourceLock[];
    pendingChanges: Change[];
  };
}

export interface Region {
  id: string;
  name: string;                  // "South Florida Region"
  abbreviation: string;          // "SFL"
  headquarters: Address;
  counties: string[];            // County IDs
  timeZone: string;
}

export interface County {
  id: string;
  name: string;
  state: string;
  fipsCode: string;
  chapter: string;               // Chapter ID
  population: number;
  boundary: GeoJSON.Feature;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  available24x7: boolean;
}

// Service Lines - These map to Form 5266 line items
export interface FeedingData {
  meals: DailyMetric[];          // Line 9
  snacks: DailyMetric[];         // Line 10
  waterDistributed: DailyMetric[];
  feedingSites: FeedingSite[];
  erkDeployed: number;
  totalMealsToDate: number;
}

export interface ShelteringData {
  sheltersOpen: number;          // Line 38
  shelterCensus: number;         // Line 40
  overnightStays: DailyMetric[];
  shelterSites: ShelterSite[];
  totalClientsServed: number;    // Line 44
}

export interface DailyMetric {
  date: Date;
  value: number;
  location?: string;
  verifiedBy?: string;
}

// The Unified IAP Document - ALWAYS LIVE, ALWAYS EDITABLE
export interface IAPDocument {
  id: string;
  operationId: string;
  
  // Document metadata
  meta: {
    iapNumber: number;           // Sequential: 1, 2, 3...
    operationalPeriod: {
      start: Date;
      end: Date;
    };
    preparedBy: Contact;
    approvedBy: Contact;
    distributionList: string[];
  };
  
  // The 16 pages - all editable in place
  sections: {
    coverPage: IAPCoverPage;
    directorsIntent: RichTextSection;
    priorities: PrioritiesSection;
    objectives: ObjectivesSection;
    previousObjectivesStatus: StatusSection;
    openActionTracker: ActionItem[];
    contactRoster: ContactSection;
    organizationChart: OrgChartSection;
    workAssignments: WorkAssignment[];
    workSites: WorkSite[];
    safetyMessage: RichTextSection;
    externalCoordination: RichTextSection;
    generalMessage: RichTextSection;
    dailySchedule: ScheduleItem[];
    weatherForecast: WeatherSection;
    maps: MapSection;
  };
  
  // Version control
  history: IAPVersion[];
  currentVersion: number;
  isDraft: boolean;
  
  // Collaboration
  currentEditors: {
    userId: string;
    section: string;
    since: Date;
  }[];
}

export interface RichTextSection {
  content: string;               // HTML or Markdown
  lastModified: Date;
  modifiedBy: string;
  attachments?: Attachment[];
}

export interface PrioritiesSection {
  priorities: {
    order: number;
    text: string;
    category: 'life-safety' | 'incident-stabilization' | 'property-conservation' | 'other';
  }[];
}

export interface ObjectivesSection {
  objectives: {
    id: string;                 // "1.1", "1.2", "2.1"...
    priority: number;            // Links to priority
    text: string;
    smart: {                     // SMART goals
      specific: string;
      measurable: string;
      achievable: boolean;
      relevant: string;
      timeBound: Date;
    };
    owner: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  }[];
}

// Audit trail for compliance
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  details: any;
  ipAddress?: string;
  previousValue?: any;
  newValue?: any;
}

// Change tracking for sync
export interface Change {
  id: string;
  timestamp: number;
  path: string;                 // "serviceLines.feeding.meals.0"
  operation: 'set' | 'delete' | 'append';
  value: any;
  userId: string;
  synced: boolean;
}

// Export all types
export type { 
  Region, County, Contact, 
  FeedingData, ShelteringData,
  IAPDocument, RichTextSection,
  AuditEntry, Change 
};