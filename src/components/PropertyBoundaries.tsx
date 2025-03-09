import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { GeoJSON, GeoJsonObject } from 'leaflet';
import { useAppContext } from '../context/AppContext';

interface ParcelIndex {
  gridSize: number;
  cells: {
    [key: string]: {
      bounds: {
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
      };
      filename: string;
      featureCount: number;
    };
  };
  metadata: {
    totalCells: number;
    totalFeatures: number;
    generatedAt: string;
  };
}

interface ParcelFeature {
  type: string;
  geometry: object;
  properties: {
    APN?: string;
    StreetNumb?: string;
    StreetName?: string;
    StreetType?: string;
    StreetDir?: string;
    City?: string;
    ZipCode?: string;
    [key: string]: unknown;
  };
}

interface ParcelData {
  type: string;
  features: ParcelFeature[];
}

const PropertyBoundaries: React.FC = () => {
  const map = useMap();
  const { mapSettings, updateMapSettings } = useAppContext();
  const [parcelIndex, setParcelIndex] = useState<ParcelIndex | null>(null);
  const [loadedCells, setLoadedCells] = useState<Set<string>>(new Set());
  const parcelLayerRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null);
  const indexLoadedRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const lastBoundsRef = useRef<string>('');
  const debounceTimerRef = useRef<number | null>(null);

  // Load the parcel index file only when property boundaries are enabled and county is selected
  useEffect(() => {
    if (mapSettings.showPropertyBoundaries && mapSettings.parcelCounty && !indexLoadedRef.current) {
      const county = mapSettings.parcelCounty;
      const loadIndex = async () => {
        try {
          const response = await fetch(`/parcels/${county}/parcel-index.json`);
          if (!response.ok) {
            console.warn('Property boundaries index file not found. Upload parcel data first.');
            return;
          }
          const data = await response.json();
          setParcelIndex(data);
          indexLoadedRef.current = true;
        } catch (error) {
          console.error('Error loading parcel index:', error);
        }
      };

      loadIndex();
    } else if (!mapSettings.parcelCounty) {
      // If no county selected, turn off property boundaries
      updateMapSettings({ showPropertyBoundaries: false });
    }
  }, [mapSettings.showPropertyBoundaries, mapSettings.parcelCounty, updateMapSettings]);

  // Create or remove GeoJSON layer based on settings
  useEffect(() => {
    if (mapSettings.showPropertyBoundaries && mapSettings.parcelCounty) {
      // Create layer if it doesn't exist
      if (!parcelLayerRef.current) {
        const layer = L.geoJSON<GeoJsonObject>([], {
          style: {
            color: '#ff6b6b',
            weight: 1,
            opacity: 0.7,
            fillColor: '#ff6b6b',
            fillOpacity: 0.1
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const props = feature.properties as ParcelFeature['properties']; // Type assertion here
              let popupContent = '<div class="parcel-popup">';
              
              if (props.APN) {
                popupContent += `<strong>Parcel ID:</strong> ${props.APN}<br>`;
              }
              
              // Build address string
              const addressParts = [];
              if (props.StreetNumb) addressParts.push(props.StreetNumb);
              if (props.StreetDir) addressParts.push(props.StreetDir);
              if (props.StreetName) addressParts.push(props.StreetName);
              if (props.StreetType) addressParts.push(props.StreetType);
              
              if (addressParts.length > 0) {
                popupContent += `<strong>Address:</strong> ${addressParts.join(' ')}<br>`;
              }
              
              if (props.City) {
                popupContent += `<strong>City:</strong> ${props.City}<br>`;
              }
              
              if (props.ZipCode) {
                popupContent += `<strong>ZIP:</strong> ${props.ZipCode}<br>`;
              }
              
              popupContent += '</div>';
              layer.bindPopup(popupContent);
            }
          }
        });
        
        layer.addTo(map);
        parcelLayerRef.current = layer;
      }
    } else {
      // Remove layer if it exists
      if (parcelLayerRef.current) {
        map.removeLayer(parcelLayerRef.current);
        parcelLayerRef.current = null;
        
        // Clear loaded cells to free memory
        setLoadedCells(new Set());
        
        // Clear any pending debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      }
    }
    
    return () => {
      // Cleanup on component unmount
      if (parcelLayerRef.current) {
        map.removeLayer(parcelLayerRef.current);
        parcelLayerRef.current = null;
      }
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [map, mapSettings.showPropertyBoundaries, mapSettings.parcelCounty, updateMapSettings]);

  // Load parcel data when map moves, with debounce
  useEffect(() => {
    if (!mapSettings.showPropertyBoundaries || !parcelIndex || !parcelLayerRef.current) return;

    const handleMoveEnd = () => {
      // Debounce to prevent excessive loading during continuous panning/zooming
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(async () => {
        if (isLoadingRef.current) return;
        
        const bounds = map.getBounds();
        const boundsKey = `${bounds.getNorth().toFixed(6)}_${bounds.getSouth().toFixed(6)}_${bounds.getEast().toFixed(6)}_${bounds.getWest().toFixed(6)}_${map.getZoom()}`;
        
        // Skip if bounds haven't changed significantly
        if (boundsKey === lastBoundsRef.current) return;
        lastBoundsRef.current = boundsKey;
        
        isLoadingRef.current = true;
        
        try {
          const relevantCells = getGridCellsForBounds(
            parcelIndex,
            {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            }
          );
          
          // Load cells that haven't been loaded yet
          for (const cell of relevantCells) {
            if (!loadedCells.has(cell.filename)) {
              try {
                const county = mapSettings.parcelCounty;
                const response = await fetch(`/parcels/${county}/${cell.filename}`);
                if (!response.ok) continue;
                
                const data: ParcelData = await response.json();
                
                // Only add data if layer still exists (user might have disabled during fetch)
                if (parcelLayerRef.current && mapSettings.showPropertyBoundaries) {
                  parcelLayerRef.current.addData(data as GeoJsonObject);
                  
                  // Mark cell as loaded
                  setLoadedCells(prev => new Set([...prev, cell.filename]));
                }
              } catch (error) {
                console.error(`Error loading parcel data for ${cell.filename}:`, error);
              }
            }
          }
        } finally {
          isLoadingRef.current = false;
        }
      }, 300); // 300ms debounce
    };
    
    // Initial load based on current view
    handleMoveEnd();
    
    // Add event listener for map movement
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [map, parcelIndex, loadedCells, mapSettings.showPropertyBoundaries, mapSettings.parcelCounty, updateMapSettings]);

  // Helper function to determine which grid cells to load based on map bounds
  const getGridCellsForBounds = (
    index: ParcelIndex,
    bounds: { north: number; south: number; east: number; west: number }
  ) => {
    const { gridSize, cells } = index;
    const relevantCells = [];
    
    // Calculate grid cell keys that intersect with the map bounds
    const minLatCell = Math.floor(bounds.south / gridSize) * gridSize;
    const maxLatCell = Math.floor(bounds.north / gridSize) * gridSize;
    const minLngCell = Math.floor(bounds.west / gridSize) * gridSize;
    const maxLngCell = Math.floor(bounds.east / gridSize) * gridSize;
    
    for (let lat = minLatCell; lat <= maxLatCell; lat += gridSize) {
      for (let lng = minLngCell; lng <= maxLngCell; lng += gridSize) {
        const cellKey = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
        if (cells[cellKey]) {
          relevantCells.push(cells[cellKey]);
        }
      }
    }
    
    return relevantCells;
  };
  
  return null; // This component doesn't render anything directly
};

export default PropertyBoundaries;
