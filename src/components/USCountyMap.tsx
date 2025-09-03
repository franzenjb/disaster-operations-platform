/**
 * US County Map with Real Boundaries
 * Uses actual county GeoJSON data from US Census Bureau
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useOperationStore } from '../stores/useOperationStore';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// US Census Bureau provides county boundaries
// This URL provides all US counties with accurate boundaries
const US_COUNTIES_GEOJSON_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

export function USCountyMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const countyLayer = useRef<L.GeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [countyData, setCountyData] = useState<any>(null);
  
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  // Fetch real county boundaries on mount
  useEffect(() => {
    fetch(US_COUNTIES_GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setCountyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load county boundaries:', err);
        setLoading(false);
      });
  }, []);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    
    // Create map centered on US
    const map = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
    
    // Use a better base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 18,
    }).addTo(map);
    
    mapInstance.current = map;
    
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);
  
  // Update map with selected counties
  useEffect(() => {
    if (!mapInstance.current || !countyData || loading) return;
    
    // Remove existing layer
    if (countyLayer.current) {
      mapInstance.current.removeLayer(countyLayer.current);
      countyLayer.current = null;
    }
    
    if (selectedCounties.length === 0) {
      // Show full US
      mapInstance.current.setView([39.8283, -98.5795], 4);
      return;
    }
    
    // Create set of selected county names for fast lookup
    const selectedNames = new Set(
      selectedCounties.map(c => {
        // Clean county name - remove state suffix and "County"
        return c.name
          .replace(/, [A-Z]{2}$/, '')  // Remove ", FL" etc
          .replace(' County', '')
          .toLowerCase()
          .trim();
      })
    );
    
    // Track bounds of selected counties
    const bounds: L.LatLngBoundsExpression = [];
    let hasMatchedCounties = false;
    
    // Style function for counties
    const styleFeature = (feature: any) => {
      const countyName = (feature.properties.NAME || '').toLowerCase().trim();
      const isSelected = selectedNames.has(countyName);
      
      if (isSelected) {
        hasMatchedCounties = true;
        // Get the bounds of this feature
        if (feature.geometry && feature.geometry.coordinates) {
          // This is a simplified way to get bounds - in production would be more thorough
          const coords = feature.geometry.coordinates[0];
          if (coords && coords[0]) {
            const latlng = coords[0].map((coord: any) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                return [coord[1], coord[0]]; // GeoJSON is [lng, lat]
              }
              return null;
            }).filter(Boolean);
            
            if (latlng.length > 0) {
              bounds.push(...latlng);
            }
          }
        }
      }
      
      return {
        fillColor: isSelected ? '#dc2626' : 'transparent',
        fillOpacity: isSelected ? 0.6 : 0,
        color: isSelected ? '#991b1b' : '#d1d5db',
        weight: isSelected ? 2 : 0.5,
        dashArray: isSelected ? '' : '2,2'
      };
    };
    
    // Create GeoJSON layer with all counties
    countyLayer.current = L.geoJSON(countyData, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const countyName = (feature.properties.NAME || '').toLowerCase().trim();
        const isSelected = selectedNames.has(countyName);
        
        if (isSelected) {
          // Add popup for selected counties
          const stateName = feature.properties.STATE || '';
          const fips = feature.properties.GEO_ID || '';
          
          layer.bindPopup(`
            <div class="p-2">
              <div class="font-bold text-lg">${feature.properties.NAME}</div>
              <div class="text-sm text-gray-600">${stateName}</div>
              <div class="text-xs text-gray-500 mt-1">FIPS: ${fips}</div>
              <div class="text-xs text-red-600 mt-2 font-medium">
                Active in Operation
              </div>
            </div>
          `);
          
          // Hover effects
          layer.on('mouseover', function(e) {
            const layer = e.target;
            layer.setStyle({
              fillOpacity: 0.8,
              weight: 3
            });
          });
          
          layer.on('mouseout', function(e) {
            const layer = e.target;
            layer.setStyle({
              fillOpacity: 0.6,
              weight: 2
            });
          });
        }
      }
    });
    
    countyLayer.current.addTo(mapInstance.current);
    
    // Fit map to selected counties if we found any
    if (hasMatchedCounties && bounds.length > 0) {
      try {
        mapInstance.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 8 
        });
      } catch (e) {
        console.log('Could not fit bounds, using default view');
      }
    }
    
  }, [selectedCounties, countyData, loading]);
  
  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg overflow-hidden border border-gray-200"
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading US county boundaries...</p>
          </div>
        </div>
      )}
      
      {!loading && selectedCounties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-lg p-4 text-center shadow-lg">
            <p className="text-gray-600 font-medium">No counties selected</p>
            <p className="text-sm text-gray-500 mt-1">
              Select counties to see them highlighted on the map
            </p>
          </div>
        </div>
      )}
      
      {selectedCounties.length > 0 && !loading && (
        <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg">
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {selectedCounties.length} Counties Selected
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-xs text-gray-600">Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-400 rounded"></div>
                <span className="text-xs text-gray-600">Inactive</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}