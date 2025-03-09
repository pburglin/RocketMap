import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import PropertyBoundaries from './PropertyBoundaries';

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
const bookmarkIcon = createIcon('#ef4444'); // Red icon for bookmarks

// Component to update map view when location changes
const LocationUpdater: React.FC<{ center?: [number, number]; zoom?: number; isTracking: boolean }> = ({ center, zoom, isTracking }) => {
  const map = useMap();
  
  useEffect(() => {
    // Only auto-center the map if tracking is enabled and we have a center position
    if (isTracking && center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map, isTracking]);
  
  return null;
};

// Component to track map center
const MapCenterTracker: React.FC = () => {
  const map = useMap();
  const { setMapCenter } = useAppContext();
  
  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    }
  });
  
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
  const { userLocation, isTrackingLocation, mapSettings, bookmarks, mapCenter, locationPermissionState } = useAppContext();
  const [displayCenter, setDisplayCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapKey, setMapKey] = useState<number>(1); // Used to force re-render the map
  
  // Force map re-render when permission state changes to fix iOS black screen issue
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [locationPermissionState]);
  
  // Update initial display center when component mounts or when focus location changes
  useEffect(() => {
    if (focusLocation) {
      setDisplayCenter(focusLocation);
    } else if (userLocation && isTrackingLocation) {
      // Only update display center from user location if tracking is enabled
      setDisplayCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [focusLocation, userLocation, isTrackingLocation]);

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
      key={mapKey} // Force re-render when key changes
      center={displayCenter} 
      zoom={15} 
      style={{ height: '100vh', width: '100%', zIndex: 0 }}
      zoomControl={false}
      attributionControl={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
      easeLinearity={0.35}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={getTileLayer()}
      />
      
      {/* Property boundaries layer (if enabled) */}
      {mapSettings.showPropertyBoundaries && <PropertyBoundaries />}
      
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
      
      {/* Bookmarks markers (if overlay is enabled) */}
      {mapSettings.showBookmarksOverlay && bookmarks.map(bookmark => (
        <Marker
          key={bookmark.id}
          position={[bookmark.location.latitude, bookmark.location.longitude]}
          icon={bookmarkIcon}
        >
          <Popup>
            <strong>{bookmark.title}</strong><br />
            {bookmark.description && <>{bookmark.description}<br /></>}
            Lat: {bookmark.location.latitude.toFixed(6)}<br />
            Lng: {bookmark.location.longitude.toFixed(6)}
          </Popup>
        </Marker>
      ))}
      
      {/* Update map view when location changes - only if tracking is enabled */}
      <LocationUpdater 
        center={focusLocation || (userLocation && isTrackingLocation ? [userLocation.latitude, userLocation.longitude] : undefined)} 
        isTracking={isTrackingLocation || !!focusLocation}
      />
      
      {/* Track map center */}
      <MapCenterTracker />
    </MapContainer>
  );
};

export default Map;
