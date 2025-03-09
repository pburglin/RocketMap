#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import * as shapefile from 'shapefile';
import chalk from 'chalk';
import ProgressBar from 'progress';
import proj4 from 'proj4';
import { createGrid, assignFeaturesToGrid, writeGridFiles, createIndexFile } from './lib/grid.js';
import { parseShapefileProjection, transformCoordinates } from './lib/projection.js';
import { optimizeProperties } from './lib/optimize.js';

const program = new Command();

program
  .name('gis-processor')
  .description('Process GIS property boundary files for efficient web usage')
  .version('1.0.0');

program
  .command('process')
  .description('Process a ZIP file containing property boundary shapefiles')
  .argument('<zipfile>', 'Path to the ZIP file containing shapefiles')
  .option('-o, --output <directory>', 'Output directory for processed files', '../public/parcels')
  .option('-g, --grid-size <size>', 'Size of grid cells in degrees', '0.01')
  .option('-p, --properties <list>', 'Comma-separated list of properties to keep', 'APN,StreetNumb,StreetName,StreetType,StreetDir,City,ZipCode')
  .option('-i, --index-name <name>', 'Name of the index file', 'parcel-index.json')
  .action(async (zipfile, options) => {
    try {
      console.log(chalk.blue('🚀 Starting GIS property boundary processing'));
      console.log(chalk.gray(`Input file: ${zipfile}`));
      console.log(chalk.gray(`Output directory: ${options.output}`));
      console.log(chalk.gray(`Grid size: ${options.gridSize} degrees`));
      
      // Create output directory if it doesn't exist
      await fs.ensureDir(options.output);
      
      // Extract ZIP file to temporary directory
      const tempDir = path.join(options.output, '_temp');
      await fs.ensureDir(tempDir);
      console.log(chalk.yellow('📦 Extracting ZIP file...'));
      
      const zip = new AdmZip(zipfile);
      zip.extractAllTo(tempDir, true);
      
      // Find shapefile in the extracted files
      const files = await fs.readdir(tempDir);
      const shpFile = files.find(file => file.endsWith('.shp'));
      
      if (!shpFile) {
        throw new Error('No .shp file found in the ZIP archive');
      }
      
      const shpPath = path.join(tempDir, shpFile);
      console.log(chalk.yellow(`🗺️ Found shapefile: ${shpFile}`));
      
      // Parse projection file if it exists
      const prjFile = files.find(file => file.endsWith('.prj'));
      let projectionTransform = null;
      
      if (prjFile) {
        const prjPath = path.join(tempDir, prjFile);
        const prjContent = await fs.readFile(prjPath, 'utf8');
        projectionTransform = parseShapefileProjection(prjContent);
        console.log(chalk.yellow('🧭 Parsed projection information'));
      }
      
      // Read shapefile
      console.log(chalk.yellow('📊 Reading shapefile data...'));
      const source = await shapefile.open(shpPath);
      
      // Count features for progress bar
      let featureCount = 0;
      let bounds = {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity
      };
      
      // First pass to count features and determine bounds
      console.log(chalk.yellow('🔍 Analyzing data and determining bounds...'));
      let feature;
      while ((feature = await source.read()) && !feature.done) {
        featureCount++;
        
        // Transform coordinates if needed
        if (projectionTransform) {
          feature = transformCoordinates(feature, projectionTransform);
        }
        
        // Update bounds
        if (feature.value.geometry.type === 'Polygon' || feature.value.geometry.type === 'MultiPolygon') {
          const coordinates = feature.value.geometry.type === 'Polygon' 
            ? [feature.value.geometry.coordinates] 
            : feature.value.geometry.coordinates;
          
          for (const polygon of coordinates) {
            for (const ring of polygon) {
              for (const [lng, lat] of ring) {
                bounds.minLat = Math.min(bounds.minLat, lat);
                bounds.maxLat = Math.max(bounds.maxLat, lat);
                bounds.minLng = Math.min(bounds.minLng, lng);
                bounds.maxLng = Math.max(bounds.maxLng, lng);
              }
            }
          }
        }
      }
      
      console.log(chalk.green(`📊 Found ${featureCount} features`));
      console.log(chalk.gray(`Bounds: ${JSON.stringify(bounds, null, 2)}`));
      
      // Create grid based on bounds
      const gridSize = parseFloat(options.gridSize);
      const grid = createGrid(bounds, gridSize);
      console.log(chalk.yellow(`🔲 Created grid with ${Object.keys(grid).length} cells`));
      
      // Reset source for second pass
      source.close();
      const source2 = await shapefile.open(shpPath);
      
      // Process features and assign to grid cells
      console.log(chalk.yellow('🔄 Processing features and assigning to grid cells...'));
      const bar = new ProgressBar('[:bar] :percent :etas', { 
        total: featureCount,
        width: 30,
        complete: '=',
        incomplete: ' '
      });
      
      // Get properties to keep
      const propertiesToKeep = options.properties.split(',');
      
      // Second pass to process features
      while ((feature = await source2.read()) && !feature.done) {
        // Transform coordinates if needed
        if (projectionTransform) {
          feature = transformCoordinates(feature, projectionTransform);
        }
        
        // Optimize properties
        feature.value.properties = optimizeProperties(feature.value.properties, propertiesToKeep);
        
        // Assign to grid cells
        assignFeaturesToGrid(feature.value, grid, gridSize);
        
        bar.tick();
      }
      
      // Write grid files
      console.log(chalk.yellow('💾 Writing grid files...'));
      await writeGridFiles(grid, options.output);
      
      // Create index file
      console.log(chalk.yellow('📑 Creating index file...'));
      await createIndexFile(grid, options.output, options.indexName, gridSize);
      
      // Clean up temporary directory
      await fs.remove(tempDir);
      
      console.log(chalk.green('✅ Processing complete!'));
      console.log(chalk.blue(`Output files are in: ${options.output}`));
      console.log(chalk.blue(`Index file: ${path.join(options.output, options.indexName)}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error processing GIS data:'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
