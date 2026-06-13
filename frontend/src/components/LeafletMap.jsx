import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
const LeafletMap = ({ 
  pickup, 
  destination, 
  pickupCoords, 
  dropoffCoords,
  driverRoute, 
  driverCoords,
  height = "350px" 
}) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    // 1. Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [13.0067, 80.2206], // Guindy (Chennai Center)
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });
      // Sleek dark-themed tiles from CartoDB (perfect for our premium UI)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
    const map = mapRef.current;
    // Clear existing markers and paths on update
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
    const markers = [];
    const points = [];
    // Custom Icon Creators using Tailwind and Lucide style SVGs
    const createHtmlIcon = (bgColor, iconSvg) => {
      return L.divIcon({
        html: `<div class="${bgColor} p-1.5 rounded-full border border-slate-800 shadow-xl flex items-center justify-center text-white" style="width: 28px; height: 28px;">
          ${iconSvg}
        </div>`,
        className: 'custom-marker-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });
    };
    const pinIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    const navIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;
    const stopIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
    // 2. Plot Passenger Details if coords exist
    if (pickupCoords && pickupCoords.lat) {
      const pickLatLng = [pickupCoords.lat, pickupCoords.lng];
      const m = L.marker(pickLatLng, {
        icon: createHtmlIcon('bg-emerald-500 shadow-emerald-500/20', pinIconSvg)
      }).addTo(map).bindPopup(`<b>Pickup:</b> ${pickup || 'Starting Location'}`);
      markers.push(m);
      points.push(pickLatLng);
    }
    if (dropoffCoords && dropoffCoords.lat) {
      const dropLatLng = [dropoffCoords.lat, dropoffCoords.lng];
      const m = L.marker(dropLatLng, {
        icon: createHtmlIcon('bg-brand-yellow text-slate-900', navIconSvg)
      }).addTo(map).bindPopup(`<b>Destination:</b> ${destination || 'Dropoff Point'}`);
      markers.push(m);
      points.push(dropLatLng);
    }
    // 3. Draw Passenger Polyline if both passenger points exist
    if (pickupCoords && dropoffCoords && pickupCoords.lat && dropoffCoords.lat) {
      L.polyline([[pickupCoords.lat, pickupCoords.lng], [dropoffCoords.lat, dropoffCoords.lng]], {
        color: '#10b981', // Emerald
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 8'
      }).addTo(map);
    }
    // 4. Plot Driver Details
    if (driverCoords && driverCoords.length > 0) {
      const driverLatLngs = driverCoords.map(c => [c.lat, c.lng]);
      
      // Draw complete driver route line
      L.polyline(driverLatLngs, {
        color: '#6366f1', // Indigo Accent
        weight: 5,
        opacity: 0.7,
        lineJoin: 'round'
      }).addTo(map);
      // Plot markers for driver stops
      driverCoords.forEach((c, idx) => {
        const stopLatLng = [c.lat, c.lng];
        points.push(stopLatLng);
        
        let label = `Stop ${idx + 1}: ${c.name}`;
        let iconColor = 'bg-slate-700';
        if (idx === 0) {
          label = `Driver Start: ${c.name}`;
          iconColor = 'bg-blue-500';
        } else if (idx === driverCoords.length - 1) {
          label = `Driver Destination: ${c.name}`;
          iconColor = 'bg-red-500';
        }
        L.marker(stopLatLng, {
          icon: createHtmlIcon(iconColor, stopIconSvg)
        }).addTo(map).bindPopup(`<b>${label}</b>`);
      });
    }
    // 5. Fit bounds to contain all points
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([13.0067, 80.2206], 12);
    }
  }, [pickup, destination, pickupCoords, dropoffCoords, driverRoute, driverCoords]);
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div 
        ref={containerRef} 
        style={{ height, width: "100%" }} 
        className="z-10 bg-slate-900"
      />
      {/* Dynamic Overlay Info Panel */}
      <div className="absolute bottom-4 left-4 z-20 bg-brand-dark/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-4 text-xs font-semibold">
        <div className="flex items-center space-x-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-300">Pickup</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-yellow" />
          <span className="text-slate-300">Dropoff</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <span className="text-slate-300">Driver Route</span>
        </div>
      </div>
    </div>
  );
};
export default LeafletMap;
