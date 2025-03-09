import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
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
  
  // Direction cone implementation temporarily disabled due to compatibility issues with iOS
  
  // Use Circle as a simpler direction indicator for now
  return (
    <Circle 
      center={position}
      radius={1} // Minimal radius, just to have something
      pathOptions={{ 
        color: '#1e40af', 
        fillColor: '#3b82f6', 
        fillOpacity: 0.5,
        weight: 0 
      }}
    />
  );
};

interface MapProps {
  focusLocation?: [number, number];
}

const Map: React.FC<MapProps> = ({ focusLocation }) => {
  const { userLocation, isTrackingLocation, mapSettings, bookmarks, locationPermissionState } = useAppContext();
  const [displayCenter, setDisplayCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapKey, setMapKey] = useState<number>(1); // Used to force re-render the map
  
  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Enhanced fix for iOS black screen issue
  useEffect(() => {
    // Force map re-render when permission state changes
    setMapKey(prev => prev + 1);
    
    // For iOS devices, add additional handling
    if (isIOS && locationPermissionState === 'granted') {
      // Add a small delay before re-rendering again to ensure iOS has fully processed permission change
      const timer = setTimeout(() => {
        setMapKey(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [locationPermissionState, isIOS]);
  
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
      zoomControl={false} // Disable default zoom control, we'll add our own
      attributionControl={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
      easeLinearity={0.35}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={getTileLayer()}
      />
      
      {/* Add zoom control */}
      <ZoomControl position="topleft" />
      
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
