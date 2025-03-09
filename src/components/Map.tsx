import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
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
const bookmarkIcon = createIcon('#ef4444'); // Red icon for bookmarks

// Component to update map view when location changes
const LocationUpdater: React.FC<{ center?: [number, number]; zoom?: number; isTracking: boolean }> = ({ center, zoom, isTracking }) => {
  const map = useMap();
  
  useEffect(() => {
    // Only auto-center the map if tracking is enabled and we have a center position
    if (isTracking && center) {
      try {
        map.setView(center, zoom || map.getZoom());
      } catch (err) {
        console.error('Error updating map view:', err);
      }
    }
  }, [center, zoom, map, isTracking]);
  
  return null;
};

// Component to track map center
const MapCenterTracker: React.FC = () => {
  const map = useMap();
  const { setMapCenter } = useAppContext();
  
  const handleMoveEnd = useCallback(() => {
    try {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    } catch (err) {
      console.error('Error tracking map center:', err);
    }
  }, [map, setMapCenter]);
  
  useMapEvents({
    moveend: handleMoveEnd
  });
  
  return null;
};

// Direction indicator component
const DirectionIndicator: React.FC<{ position: [number, number]; heading: number | null | undefined }> = ({ position, heading }) => {
  if (heading === null || heading === undefined) return null;
  
  // Create a polygon representing the direction cone
  const createDirectionCone = () => {
    try {
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
    } catch (err) {
      console.error('Error creating direction cone:', err);
      return [[0, 0]] as L.LatLngExpression[]; // Return a fallback
    }
  };
  
  try {
    const conePositions = createDirectionCone();
    
    return (
      <L.Polygon positions={conePositions} pathOptions={{ color: '#1e40af', fillColor: '#3b82f6', fillOpacity: 0.5 }} />
    );
  } catch (err) {
    console.error('Error rendering direction indicator:', err);
    return null;
  }
};

interface MapProps {
  focusLocation?: [number, number];
}

const Map: React.FC<MapProps> = ({ focusLocation }) => {
  const { userLocation, isTrackingLocation, mapSettings, bookmarks, mapCenter } = useAppContext();
  const [displayCenter, setDisplayCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapKey, setMapKey] = useState<number>(Date.now()); // Key for forcing re-render
  
  // Update initial display center when component mounts or when focus location changes
  useEffect(() => {
    try {
      if (focusLocation) {
        setDisplayCenter(focusLocation);
      } else if (userLocation && isTrackingLocation) {
        // Only update display center from user location if tracking is enabled
        setDisplayCenter([userLocation.latitude, userLocation.longitude]);
      } else if (mapCenter) {
        // Use the stored map center if available
        setDisplayCenter(mapCenter);
      }
    } catch (err) {
      console.error('Error updating display center:', err);
    }
  }, [focusLocation, userLocation, isTrackingLocation, mapCenter]);

  // Select tile layer based on map settings
  const getTileLayer = useCallback(() => {
    try {
      switch (mapSettings.mapType) {
        case 'satellite':
          return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        case 'topography':
          return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        case 'streets':
        default:
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      }
    } catch (err) {
      console.error('Error getting tile layer:', err);
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // Default fallback
    }
  }, [mapSettings.mapType]);

  // Force map re-render if tracking state changes
  useEffect(() => {
    setMapKey(Date.now());
  }, [isTrackingLocation]);

  return (
    <MapContainer 
      key={mapKey}
      center={displayCenter} 
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
