import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';

// Custom marker icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const blueIcon = createIcon('#1e40af');
const grayIcon = createIcon('#6b7280');

// Component to update map view when location changes
const LocationUpdater: React.FC<{ center?: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

// Direction indicator component
const DirectionIndicator: React.FC<{ position: [number, number]; heading: number | null | undefined }> = ({ position, heading }) => {
  if (heading === null || heading === undefined) return null;
  
  // Create a polygon representing the direction cone
  const createDirectionCone = () => {
    const [lat, lng] = position;
    const distance = 0.0003; // Size of the cone
    
    // Convert heading to radians
    const headingRad = (heading * Math.PI) / 180;
    
    // Calculate the tip of the cone
    const tipLat = lat + Math.cos(headingRad) * distance;
    const tipLng = lng + Math.sin(headingRad) * distance;
    
    // Calculate the base points of the cone
    const baseAngle1 = headingRad - Math.PI / 4;
    const baseAngle2 = headingRad + Math.PI / 4;
    
    const baseLat1 = lat + Math.cos(baseAngle1) * distance * 0.5;
    const baseLng1 = lng + Math.sin(baseAngle1) * distance * 0.5;
    
    const baseLat2 = lat + Math.cos(baseAngle2) * distance * 0.5;
    const baseLng2 = lng + Math.sin(baseAngle2) * distance * 0.5;
    
    return [
      [lat, lng],
      [tipLat, tipLng],
      [baseLat2, baseLng2],
      [baseLat1, baseLng1],
      [lat, lng]
    ] as L.LatLngExpression[];
  };
  
  const conePositions = createDirectionCone();
  
  return (
    <L.Polygon positions={conePositions} pathOptions={{ color: '#1e40af', fillColor: '#3b82f6', fillOpacity: 0.5 }} />
  );
};

interface MapProps {
  focusLocation?: [number, number];
}

const Map: React.FC<MapProps> = ({ focusLocation }) => {
  const { userLocation, isTrackingLocation, mapSettings } = useAppContext();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  
  // Update map center when user location changes or focus location is provided
  useEffect(() => {
    if (focusLocation) {
      setMapCenter(focusLocation);
    } else if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation, focusLocation]);

  // Select tile layer based on map settings
  const getTileLayer = () => {
    switch (mapSettings.mapType) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'topography':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'streets':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={15} 
      style={{ height: '100vh', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={getTileLayer()}
      />
      
      {/* Property boundaries layer (if enabled) */}
      {mapSettings.showPropertyBoundaries && (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}"
          opacity={0.5}
        />
      )}
      
      {/* User location marker */}
      {userLocation && (
        <>
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={isTrackingLocation ? blueIcon : grayIcon}
          >
            <Popup>
              Your location<br />
              Lat: {userLocation.latitude.toFixed(6)}<br />
              Lng: {userLocation.longitude.toFixed(6)}
              {userLocation.accuracy && <><br />Accuracy: {userLocation.accuracy.toFixed(1)}m</>}
            </Popup>
          </Marker>
          
          {/* Accuracy circle */}
          {userLocation.accuracy && (
            <Circle 
              center={[userLocation.latitude, userLocation.longitude]}
              radius={userLocation.accuracy}
              pathOptions={{ color: isTrackingLocation ? '#1e40af' : '#6b7280', fillColor: isTrackingLocation ? '#3b82f6' : '#9ca3af', fillOpacity: 0.2 }}
            />
          )}
          
          {/* Direction indicator */}
          {isTrackingLocation && userLocation.heading !== undefined && (
            <DirectionIndicator 
              position={[userLocation.latitude, userLocation.longitude]} 
              heading={userLocation.heading} 
            />
          )}
        </>
      )}
      
      {/* Update map view when location changes */}
      <LocationUpdater center={focusLocation || (userLocation ? [userLocation.latitude, userLocation.longitude] : undefined)} />
    </MapContainer>
  );
};

export default Map;
