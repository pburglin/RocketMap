import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Create a grid based on bounds and grid size
 * @param {Object} bounds - The bounds of the data
 * @param {number} gridSize - The size of each grid cell in degrees
 * @returns {Object} - Grid object with cell keys and empty feature arrays
 */
export function createGrid(bounds, gridSize) {
  const grid = {};
  
  // Add a small buffer to ensure we cover all features
  const minLat = Math.floor(bounds.minLat / gridSize) * gridSize - gridSize;
  const maxLat = Math.ceil(bounds.maxLat / gridSize) * gridSize + gridSize;
  const minLng = Math.floor(bounds.minLng / gridSize) * gridSize - gridSize;
  const maxLng = Math.ceil(bounds.maxLng / gridSize) * gridSize + gridSize;
  
  for (let lat = minLat; lat < maxLat; lat += gridSize) {
    for (let lng = minLng; lng < maxLng; lng += gridSize) {
      const cellKey = getCellKey(lat, lng, gridSize);
      grid[cellKey] = {
        bounds: {
          minLat: lat,
          maxLat: lat + gridSize,
          minLng: lng,
          maxLng: lng + gridSize
        },
        features: []
      };
    }
  }
  
  return grid;
}

/**
 * Get a standardized cell key for a lat/lng coordinate
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} gridSize - Grid cell size in degrees
 * @returns {string} - Cell key in the format "lat_lng"
 */
export function getCellKey(lat, lng, gridSize) {
  const latCell = Math.floor(lat / gridSize) * gridSize;
  const lngCell = Math.floor(lng / gridSize) * gridSize;
  return `${latCell.toFixed(6)}_${lngCell.toFixed(6)}`;
}

/**
 * Determine which grid cells a feature belongs to
 * @param {Object} feature - GeoJSON feature
 * @param {Object} grid - Grid object
 * @param {number} gridSize - Grid cell size in degrees
 */
export function assignFeaturesToGrid(feature, grid, gridSize) {
  if (!feature.geometry) return;
  
  // Get all coordinates from the geometry
  const coordinates = getAllCoordinates(feature.geometry);
  
  // Find min/max bounds of the feature
  const featureBounds = {
    minLat: Infinity,
    maxLat: -Infinity,
    minLng: Infinity,
    maxLng: -Infinity
  };
  
  for (const [lng, lat] of coordinates) {
    featureBounds.minLat = Math.min(featureBounds.minLat, lat);
    featureBounds.maxLat = Math.max(featureBounds.maxLat, lat);
    featureBounds.minLng = Math.min(featureBounds.minLng, lng);
    featureBounds.maxLng = Math.max(featureBounds.maxLng, lng);
  }
  
  // Determine which cells this feature intersects with
  const minLatCell = Math.floor(featureBounds.minLat / gridSize) * gridSize;
  const maxLatCell = Math.floor(featureBounds.maxLat / gridSize) * gridSize;
  const minLngCell = Math.floor(featureBounds.minLng / gridSize) * gridSize;
  const maxLngCell = Math.floor(featureBounds.maxLng / gridSize) * gridSize;
  
  // Add feature to all intersecting cells
  for (let lat = minLatCell; lat <= maxLatCell; lat += gridSize) {
    for (let lng = minLngCell; lng <= maxLngCell; lng += gridSize) {
      const cellKey = getCellKey(lat, lng, gridSize);
      if (grid[cellKey]) {
        grid[cellKey].features.push(feature);
      }
    }
  }
}

/**
 * Extract all coordinates from a GeoJSON geometry
 * @param {Object} geometry - GeoJSON geometry object
 * @returns {Array} - Array of [lng, lat] coordinates
 */
function getAllCoordinates(geometry) {
  const coordinates = [];
  
  if (!geometry) return coordinates;
  
  switch (geometry.type) {
    case 'Point':
      coordinates.push(geometry.coordinates);
      break;
    case 'LineString':
      coordinates.push(...geometry.coordinates);
      break;
    case 'Polygon':
      for (const ring of geometry.coordinates) {
        coordinates.push(...ring);
      }
      break;
    case 'MultiPoint':
      coordinates.push(...geometry.coordinates);
      break;
    case 'MultiLineString':
      for (const line of geometry.coordinates) {
        coordinates.push(...line);
      }
      break;
    case 'MultiPolygon':
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          coordinates.push(...ring);
        }
      }
      break;
    case 'GeometryCollection':
      for (const geom of geometry.geometries) {
        coordinates.push(...getAllCoordinates(geom));
      }
      break;
  }
  
  return coordinates;
}

/**
 * Write grid cells to GeoJSON files
 * @param {Object} grid - Grid object with features
 * @param {string} outputDir - Output directory
 */
export async function writeGridFiles(grid, outputDir) {
  for (const [cellKey, cell] of Object.entries(grid)) {
    // Skip empty cells
    if (cell.features.length === 0) continue;
    
    // Create GeoJSON FeatureCollection
    const featureCollection = {
      type: 'FeatureCollection',
      features: cell.features
    };
    
    // Write to file
    const filename = `parcels_${cellKey}.json`;
    const filePath = path.join(outputDir, filename);
    await fs.writeJson(filePath, featureCollection, { spaces: 0 });
    
    // Update cell with file info and feature count
    cell.filename = filename;
    cell.featureCount = cell.features.length;
    
    // Remove features array to save memory
    delete cell.features;
  }
}

/**
 * Create or update an index file for the grid
 * @param {Object} grid - Grid object
 * @param {string} outputDir - Output directory
 * @param {string} indexName - Name of the index file
 * @param {number} gridSize - Grid cell size in degrees
 */
export async function createIndexFile(grid, outputDir, indexName, gridSize) {
  // Filter out empty cells
  const nonEmptyCells = Object.entries(grid)
    .filter(([_, cell]) => cell.filename)
    .reduce((acc, [key, cell]) => {
      acc[key] = {
        bounds: cell.bounds,
        filename: cell.filename,
        featureCount: cell.featureCount
      };
      return acc;
    }, {});
  
  const indexPath = path.join(outputDir, indexName);
  let existingIndex = {};
  let existingCells = {};
  let totalExistingFeatures = 0;
  
  // Check if index file already exists
  try {
    if (await fs.pathExists(indexPath)) {
      console.log(chalk.yellow(`Index file already exists, appending new data...`));
      existingIndex = await fs.readJson(indexPath);
      existingCells = existingIndex.cells || {};
      totalExistingFeatures = existingIndex.metadata?.totalFeatures || 0;
    }
  } catch (error) {
    console.log(chalk.yellow(`Error reading existing index file: ${error.message}`));
    console.log(chalk.yellow(`Creating new index file...`));
  }
  
  // Merge existing cells with new cells
  const mergedCells = { ...existingCells, ...nonEmptyCells };
  
  // Calculate total features (existing + new)
  const newFeatures = Object.values(nonEmptyCells).reduce((sum, cell) => sum + cell.featureCount, 0);
  const totalFeatures = totalExistingFeatures + newFeatures;
  
  // Create updated index object
  const index = {
    gridSize,
    cells: mergedCells,
    metadata: {
      totalCells: Object.keys(mergedCells).length,
      totalFeatures: totalFeatures,
      lastUpdated: new Date().toISOString(),
      ...(existingIndex.metadata?.generatedAt && { generatedAt: existingIndex.metadata.generatedAt })
    }
  };
  
  // If this is a new index, add the generatedAt timestamp
  if (!existingIndex.metadata?.generatedAt) {
    index.metadata.generatedAt = index.metadata.lastUpdated;
  }
  
  // Write updated index file
  await fs.writeJson(indexPath, index, { spaces: 2 });
  
  if (existingIndex.metadata) {
    console.log(chalk.green(`Updated index with ${Object.keys(nonEmptyCells).length} new cells containing ${newFeatures} features`));
    console.log(chalk.green(`Total: ${index.metadata.totalCells} cells containing ${index.metadata.totalFeatures} features`));
  } else {
    console.log(chalk.green(`Created index with ${index.metadata.totalCells} cells containing ${index.metadata.totalFeatures} features`));
  }
}
