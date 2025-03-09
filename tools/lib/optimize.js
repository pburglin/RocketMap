/**
 * Optimize feature properties by keeping only specified properties
 * @param {Object} properties - Original properties object
 * @param {Array} propertiesToKeep - Array of property names to keep
 * @returns {Object} - Optimized properties object
 */
export function optimizeProperties(properties, propertiesToKeep) {
  if (!properties) return {};
  
  // Create a new object with only the specified properties
  const optimized = {};
  
  for (const prop of propertiesToKeep) {
    if (properties[prop] !== undefined) {
      optimized[prop] = properties[prop];
    }
  }
  
  return optimized;
}
