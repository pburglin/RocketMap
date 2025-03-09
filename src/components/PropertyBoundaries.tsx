import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
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
  geometry: any;
  properties: {
    APN?: string;
    StreetNumb?: string;
    StreetName?: string;
    StreetType?: string;
    StreetDir?: string;
    City?: string;
    ZipCode?: string;
    [key: string]: any;
  };
}

interface ParcelData {
  type: string;
  features: ParcelFeature[];
}

const PropertyBoundaries: React.FC = () => {
  const map = useMap();
  const { mapSettings } = useAppContext();
  const [parcelIndex, setParcelIndex] = useState<ParcelIndex | null>(null);
  const [loadedCells, setLoadedCells] = useState<Set<string>>(new Set());
  const [parcelLayer, setParcelLayer] = useState<L.GeoJSON | null>(null);

  // Load the parcel index file
  useEffect(() => {
    if (!mapSettings.showPropertyBoundaries) return;

    const loadIndex = async () => {
      try {
        const response = await fetch('/parcels/parcel-index.json');
        if (!response.ok) {
          console.warn('Property boundaries index file not found. Upload parcel data first.');
          return;
        }
        const data = await response.json();
        setParcelIndex(data);
      } catch (error) {
        console.error('Error loading parcel index:', error);
      }
    };

    loadIndex();
  }, [mapSettings.showPropertyBoundaries]);

  // Create GeoJSON layer for parcels
  useEffect(() => {
    if (!mapSettings.showPropertyBoundaries) {
      // Remove layer if property boundaries are disabled
      if (parcelLayer) {
        map.removeLayer(parcelLayer);
        setParcelLayer(null);
      }
      return;
    }

    // Create new layer if it doesn't exist
    if (!parcelLayer) {
      const layer = L.geoJSON([], {
        style: {
          color: '#ff6b6b',
          weight: 1,
          opacity: 0.7,
          fillColor: '#ff6b6b',
          fillOpacity: 0.1
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const props = feature.properties;
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
      setParcelLayer(layer);
    }
  }, [map, mapSettings.showPropertyBoundaries, parcelLayer]);

  // Load parcel data when map moves
  useEffect(() => {
    if (!mapSettings.showPropertyBoundaries || !parcelIndex || !parcelLayer) return;

    const handleMoveEnd = async () => {
      const bounds = map.getBounds();
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
            const response = await fetch(`/parcels/${cell.filename}`);
            if (!response.ok) continue;
            
            const data: ParcelData = await response.json();
            parcelLayer.addData(data);
            
            // Mark cell as loaded
            setLoadedCells(prev => new Set([...prev, cell.filename]));
          } catch (error) {
            console.error(`Error loading parcel data for ${cell.filename}:`, error);
          }
        }
      }
    };
    
    // Initial load based on current view
    handleMoveEnd();
    
    // Add event listener for map movement
    map.on('moveend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, parcelIndex, parcelLayer, loadedCells, mapSettings.showPropertyBoundaries]);
  
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
