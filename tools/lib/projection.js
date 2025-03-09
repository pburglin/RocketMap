import proj4 from 'proj4';

/**
 * Parse projection information from a .prj file
 * @param {string} prjContent - Content of the .prj file
 * @returns {Function|null} - Transformation function or null if no transformation needed
 */
export function parseShapefileProjection(prjContent) {
  try {
    // If the projection is already WGS84, no transformation needed
    if (prjContent.includes('GEOGCS["GCS_WGS_1984"') || 
        prjContent.includes('GEOGCS["WGS 84"')) {
      return null;
    }
    
    // Create transformation function from the projection to WGS84
    const fromProj = prjContent;
    const toProj = 'EPSG:4326'; // WGS84
    
    return proj4(fromProj, toProj);
  } catch (error) {
    console.warn('Warning: Could not parse projection information. Using raw coordinates.');
    return null;
  }
}

/**
 * Transform coordinates from source projection to WGS84
 * @param {Object} feature - GeoJSON feature
 * @param {Function} transform - Projection transformation function
 * @returns {Object} - Feature with transformed coordinates
 */
export function transformCoordinates(feature, transform) {
  if (!transform || !feature.value.geometry) return feature;
  
  const transformedFeature = { ...feature };
  
  switch (feature.value.geometry.type) {
    case 'Point':
      transformedFeature.value.geometry.coordinates = transformPoint(
        feature.value.geometry.coordinates, 
        transform
      );
      break;
      
    case 'LineString':
      transformedFeature.value.geometry.coordinates = feature.value.geometry.coordinates.map(
        point => transformPoint(point, transform)
      );
      break;
      
    case 'Polygon':
      transformedFeature.value.geometry.coordinates = feature.value.geometry.coordinates.map(
        ring => ring.map(point => transformPoint(point, transform))
      );
      break;
      
    case 'MultiPoint':
      transformedFeature.value.geometry.coordinates = feature.value.geometry.coordinates.map(
        point => transformPoint(point, transform)
      );
      break;
      
    case 'MultiLineString':
      transformedFeature.value.geometry.coordinates = feature.value.geometry.coordinates.map(
        line => line.map(point => transformPoint(point, transform))
      );
      break;
      
    case 'MultiPolygon':
      transformedFeature.value.geometry.coordinates = feature.value.geometry.coordinates.map(
        polygon => polygon.map(ring => ring.map(point => transformPoint(point, transform)))
      );
      break;
  }
  
  return transformedFeature;
}

/**
 * Transform a single point from source projection to WGS84
 * @param {Array} point - [x, y] coordinates
 * @param {Function} transform - Projection transformation function
 * @returns {Array} - Transformed [lng, lat] coordinates
 */
function transformPoint(point, transform) {
  try {
    // proj4 expects [x, y] and returns [lng, lat]
    const transformed = transform.forward(point);
    return transformed;
  } catch (error) {
    console.warn('Warning: Could not transform point. Using original coordinates.');
    return point;
  }
}
