/**
 * Reactive Operation Map
 * 
 * THIS is the difference! In the old system, you had 7 map files
 * trying to sync. Here, the map just subscribes to county changes
 * and updates automatically. No manual wiring needed!
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useOperationStore } from '../stores/useOperationStore';
import { eventBus, EventType } from '../core/EventBus';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function OperationMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    
    // Create map
    const map = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    
    // Create markers layer
    markersLayer.current = L.layerGroup().addTo(map);
    
    mapInstance.current = map;
    
    // Cleanup
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);
  
  // Update map when counties change - THIS IS THE MAGIC!
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;
    
    // Clear existing markers
    markersLayer.current.clearLayers();
    
    if (selectedCounties.length === 0) {
      // Reset to US view
      mapInstance.current.setView([39.8283, -98.5795], 4);
      return;
    }
    
    const bounds: L.LatLngBoundsExpression = [];
    
    // Add markers for each county
    selectedCounties.forEach(county => {
      // In production, we'd have real coordinates from the county data
      // For demo, using simplified coordinates
      const lat = 25 + Math.random() * 5; // Florida area
      const lng = -80 - Math.random() * 5;
      
      const marker = L.marker([lat, lng])
        .bindPopup(`
          <div class="font-semibold">${county.name}</div>
          <div class="text-sm text-gray-600">Click to view details</div>
        `);
      
      markersLayer.current!.addLayer(marker);
      bounds.push([lat, lng]);
    });
    
    // Fit map to show all markers
    if (bounds.length > 0) {
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
    
    console.log(`Map updated with ${selectedCounties.length} counties - automatically!`);
  }, [selectedCounties]);
  
  // Subscribe to county events for real-time updates
  useEffect(() => {
    const handleCountyAdded = () => {
      console.log('County added - map will auto-update via React!');
    };
    
    const handleCountyRemoved = () => {
      console.log('County removed - map will auto-update via React!');
    };
    
    const unsubAdd = eventBus.on(EventType.COUNTY_ADDED, handleCountyAdded);
    const unsubRemove = eventBus.on(EventType.COUNTY_REMOVED, handleCountyRemoved);
    
    return () => {
      unsubAdd();
      unsubRemove();
    };
  }, []);
  
  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg overflow-hidden"
      />
      
      {selectedCounties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-lg p-4 text-center">
            <p className="text-gray-600">No counties selected</p>
            <p className="text-sm text-gray-500 mt-1">
              Counties will appear here automatically when selected
            </p>
          </div>
        </div>
      )}
    </div>
  );
}