/**
 * Red Cross Regions and Counties
 * Simplified for demo - would load from API in production
 */

export interface Region {
  id: string;
  name: string;
  abbreviation: string;
  counties: string[];
  chapters: string[];
}

export const REGIONS: Region[] = [
  {
    id: 'south-florida',
    name: 'South Florida Region',
    abbreviation: 'SFL',
    counties: [
      'Miami-Dade County',
      'Broward County',
      'Palm Beach County',
      'Monroe County',
      'Collier County',
      'Lee County',
      'Charlotte County',
      'Sarasota County',
      'Manatee County',
      'DeSoto County',
      'Glades County',
      'Hendry County',
      'Highlands County'
    ],
    chapters: [
      'Greater Miami & The Keys',
      'Broward County',
      'Palm Beach County',
      'South Florida'
    ]
  },
  {
    id: 'north-florida',
    name: 'North Florida Region',
    abbreviation: 'NFL',
    counties: [
      'Duval County',
      'St. Johns County',
      'Nassau County',
      'Baker County',
      'Clay County',
      'Putnam County',
      'Flagler County',
      'Volusia County',
      'Alachua County',
      'Marion County',
      'Leon County',
      'Gadsden County',
      'Jefferson County',
      'Wakulla County'
    ],
    chapters: [
      'Northeast Florida',
      'Capital Area',
      'North Central Florida'
    ]
  },
  {
    id: 'central-florida',
    name: 'Central Florida and the US Virgin Islands Region',
    abbreviation: 'CFL',
    counties: [
      'Orange County',
      'Osceola County',
      'Seminole County',
      'Lake County',
      'Polk County',
      'Brevard County',
      'Indian River County',
      'St. Lucie County',
      'Martin County',
      'Okeechobee County'
    ],
    chapters: [
      'Central Florida',
      'Space Coast',
      'Treasure Coast'
    ]
  },
  {
    id: 'texas-gulf',
    name: 'Texas Gulf Coast Region',
    abbreviation: 'TGC',
    counties: [
      'Harris County',
      'Galveston County',
      'Brazoria County',
      'Fort Bend County',
      'Montgomery County',
      'Liberty County',
      'Chambers County',
      'Jefferson County',
      'Orange County'
    ],
    chapters: [
      'Greater Houston',
      'Southeast Texas'
    ]
  },
  // Add all 50 regions here in production
];