/**
 * Enhanced Choropleth Map Component
 * 
 * Fetches real county boundaries from public sources
 * Falls back to simplified data if needed
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useOperationStore } from '../stores/useOperationStore';
import { fetchAllUSCounties, CountiesGeoJSON } from '../services/fetchCountyBoundaries';
import floridaCountiesGeoJSON from '../data/florida-counties-geojson';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function ChoroplethMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const countyLayer = useRef<L.GeoJSON | null>(null);
  const [loadingBoundaries, setLoadingBoundaries] = useState(false);
  const [boundariesError, setBoundariesError] = useState<string | null>(null);
  
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    
    const map = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    
    mapInstance.current = map;
    
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);
  
  // Update choropleth when counties change
  useEffect(() => {
    if (!mapInstance.current) return;
    
    // Remove existing layer
    if (countyLayer.current) {
      mapInstance.current.removeLayer(countyLayer.current);
      countyLayer.current = null;
    }
    
    if (selectedCounties.length === 0) {
      mapInstance.current.setView([39.8283, -98.5795], 4);
      return;
    }
    
    // Try to load real county boundaries
    const loadCountyBoundaries = async () => {
      setLoadingBoundaries(true);
      setBoundariesError(null);
      
      try {
        // First try: Use our local Florida data if all counties are Florida
        const floridaCounties = selectedCounties.filter(county => {
          return floridaCountiesGeoJSON.features.some(
            f => f.properties.NAME === county.name
          );
        });
        
        if (floridaCounties.length === selectedCounties.length) {
          // All counties are Florida - use local data
          renderFloridaCounties();
        } else {
          // Try fetching national data
          const allUSCounties = await fetchAllUSCounties();
          
          if (allUSCounties) {
            renderNationalCounties(allUSCounties);
          } else {
            // Fallback to point markers
            renderFallbackMarkers();
          }
        }
      } catch (error) {
        console.error('Error loading county boundaries:', error);
        setBoundariesError('Could not load county boundaries');
        renderFallbackMarkers();
      } finally {
        setLoadingBoundaries(false);
      }
    };
    
    const renderFloridaCounties = () => {
      const selectedNames = new Set(selectedCounties.map(c => c.name));
      
      countyLayer.current = L.geoJSON(floridaCountiesGeoJSON as any, {
        style: (feature) => {
          const isSelected = selectedNames.has(feature?.properties.NAME);
          return {
            fillColor: isSelected ? '#dc2626' : '#e5e7eb',
            fillOpacity: isSelected ? 0.7 : 0.2,
            color: isSelected ? '#991b1b' : '#9ca3af',
            weight: isSelected ? 2 : 1,
          };
        },
        onEachFeature: (feature, layer) => {
          if (selectedNames.has(feature.properties.NAME)) {
            layer.bindPopup(`
              <div class="p-2">
                <div class="font-bold">${feature.properties.NAME}</div>
                <div class="text-sm">Population: ${feature.properties.POPULATION?.toLocaleString() || 'N/A'}</div>
              </div>
            `);
            
            layer.on('mouseover', function() {
              (this as any).setStyle({ fillOpacity: 0.9, weight: 3 });
            });
            
            layer.on('mouseout', function() {
              (this as any).setStyle({ fillOpacity: 0.7, weight: 2 });
            });
          }
        }
      });
      
      countyLayer.current!.addTo(mapInstance.current!);
      const bounds = countyLayer.current!.getBounds();
      mapInstance.current!.fitBounds(bounds, { padding: [50, 50] });
    };
    
    const renderNationalCounties = (geoData: CountiesGeoJSON) => {
      const selectedNames = new Set(
        selectedCounties.map(c => c.name.replace(' County', '').toLowerCase())
      );
      
      const matchedFeatures = geoData.features.filter(f => {
        const countyName = f.properties.NAME?.toLowerCase();
        return countyName && selectedNames.has(countyName);
      });
      
      if (matchedFeatures.length > 0) {
        countyLayer.current = L.geoJSON({
          type: 'FeatureCollection',
          features: matchedFeatures
        } as any, {
          style: {
            fillColor: '#dc2626',
            fillOpacity: 0.7,
            color: '#991b1b',
            weight: 2,
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div class="p-2">
                <div class="font-bold">${feature.properties.NAME}</div>
                <div class="text-sm">${feature.properties.STATE_NAME || ''}</div>
              </div>
            `);
          }
        });
        
        countyLayer.current!.addTo(mapInstance.current!);
        const bounds = countyLayer.current!.getBounds();
        mapInstance.current!.fitBounds(bounds, { padding: [50, 50] });
      } else {
        renderFallbackMarkers();
      }
    };
    
    const renderFallbackMarkers = () => {
      // Fallback to point markers
      const markersLayer = L.layerGroup();
      const bounds: L.LatLngBoundsExpression = [];
      
      selectedCounties.forEach(county => {
        const lat = 39 + Math.random() * 10;
        const lng = -95 - Math.random() * 10;
        
        const marker = L.marker([lat, lng])
          .bindPopup(`
            <div class="font-semibold">${county.name}</div>
            <div class="text-sm text-gray-600">County boundary data not available</div>
          `);
        
        markersLayer.addLayer(marker);
        bounds.push([lat, lng]);
      });
      
      markersLayer.addTo(mapInstance.current!);
      
      if (bounds.length > 0) {
        mapInstance.current!.fitBounds(bounds, { padding: [50, 50] });
      }
    };
    
    loadCountyBoundaries();
  }, [selectedCounties]);
  
  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg overflow-hidden border border-gray-200"
      />
      
      {loadingBoundaries && (
        <div className="absolute top-2 right-2 bg-white/90 rounded px-3 py-1 text-sm">
          Loading county boundaries...
        </div>
      )}
      
      {boundariesError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-700 rounded px-3 py-1 text-sm">
          {boundariesError}
        </div>
      )}
      
      {selectedCounties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-lg p-4 text-center shadow-lg">
            <p className="text-gray-600 font-medium">No counties selected</p>
            <p className="text-sm text-gray-500 mt-1">
              County boundaries will display here
            </p>
          </div>
        </div>
      )}
      
      {selectedCounties.length > 0 && !loadingBoundaries && (
        <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600 opacity-70 rounded"></div>
              <span>Active Counties ({selectedCounties.length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}