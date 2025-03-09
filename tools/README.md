# GIS Property Boundaries Processing Tool

This tool processes GIS property boundary files (shapefiles) and converts them into optimized GeoJSON files partitioned by geographic coordinates for efficient loading in web applications.

## Features

- Extracts and processes shapefiles from ZIP archives
- Handles coordinate projection transformations
- Partitions data by geographic grid cells
- Optimizes property data by keeping only relevant fields
- Creates an index file for efficient data lookup
- Generates small, manageable GeoJSON files for web usage

## Installation

```bash
cd tools
npm install
```

## Usage

```bash
node index.js process <zipfile> [options]
```

### Options

- `-o, --output <directory>` - Output directory for processed files (default: "../public/parcels")
- `-g, --grid-size <size>` - Size of grid cells in degrees (default: "0.01")
- `-p, --properties <list>` - Comma-separated list of properties to keep (default: "APN,StreetNumb,StreetName,StreetType,StreetDir,City,ZipCode")
- `-i, --index-name <name>` - Name of the index file (default: "parcel-index.json")

### Example

```bash
node index.js process ./data/maricopa_parcels.zip --output ../public/parcels --grid-size 0.02 --properties APN,StreetNumb,StreetName,City,ZipCode
```

## Output

The tool generates:

1. Multiple GeoJSON files, each containing property boundaries for a specific geographic grid cell
2. An index file that maps grid cells to their corresponding GeoJSON files

### File Naming Convention

GeoJSON files are named using the following pattern:

```
parcels_<latitude>_<longitude>.json
```

Where `<latitude>` and `<longitude>` represent the southwest corner of the grid cell.

### Index File Structure

The index file (`parcel-index.json` by default) has the following structure:

```json
{
  "gridSize": 0.01,
  "cells": {
    "33.123456_-112.123456": {
      "bounds": {
        "minLat": 33.123456,
        "maxLat": 33.133456,
        "minLng": -112.123456,
        "maxLng": -112.113456
      },
      "filename": "parcels_33.123456_-112.123456.json",
      "featureCount": 250
    },
    // More cells...
  },
  "metadata": {
    "totalCells": 120,
    "totalFeatures": 15000,
    "generatedAt": "2023-06-15T12:34:56.789Z"
  }
}
```

## Integration with Web Application

To use the processed data in your web application:

1. Place the generated files in your application's public directory
2. Load the index file to determine which grid cells to load based on the current map view
3. Load only the necessary GeoJSON files for the visible area

Example code for loading property boundaries in a web application:

```javascript
// Load the index file
async function loadParcelIndex() {
  const response = await fetch('/parcels/parcel-index.json');
  return await response.json();
}

// Determine which grid cells to load based on map bounds
function getGridCellsForBounds(index, bounds) {
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
}

// Load GeoJSON data for specific cells
async function loadParcelData(cells) {
  const features = [];
  
  for (const cell of cells) {
    const response = await fetch(`/parcels/${cell.filename}`);
    const data = await response.json();
    features.push(...data.features);
  }
  
  return features;
}

// Usage in a map application
async function updatePropertyBoundaries(mapBounds) {
  const index = await loadParcelIndex();
  const relevantCells = getGridCellsForBounds(index, mapBounds);
  const parcelFeatures = await loadParcelData(relevantCells);
  
  // Add features to map
  displayFeaturesOnMap(parcelFeatures);
}
```
