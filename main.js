//Define Parameters

// Load your uploaded dune polygons
var dunes = ee.FeatureCollection('projects/dns-ndvi-testing/assets/Dissolved_Dune_Extents');

// Set a nodata value
var noDataVal = -9999;

// Define the two years to calculate median NDVI for
var firstYear = '2000';
var lastYear = '2024';

//Define the maximum levels of cloud cover for the first and last ranges of images
var firstRangeCCPercent = 50;
var lastRangeCCPercent = 30;


//Processing

//Calculate full year ranges
var firstRangeStartDate = firstYear + '-01-01';
var firstRangeEndDate = firstYear + '-12-31';

var lastRangeStartDate = lastYear + '-01-01';
var lastRangeEndDate = lastYear + '-12-31';


// Load first range Landsat 7 NDVI
var firstRangeLandsat = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(AOI)
  .filterDate(firstRangeStartDate, firstRangeEndDate)
  //.filter(ee.Filter.lt('CLOUD_COVER', firstRangeCCPercent))
  .map(function(image) {
    var srBands = image.select(['SR_B4', 'SR_B3']).multiply(0.0000275).add(-0.2);
    var ndvi = srBands.expression(
      '(NIR - RED) / (NIR + RED)', {
        'NIR': srBands.select('SR_B4'),
        'RED': srBands.select('SR_B3')
      }).rename('NDVI')//.clamp(-1,1);
    return ndvi.copyProperties(image, ['system:time_start', 'CLOUD_COVER']);
  });
  
// Load last range Landsat 8 NDVI
var lastRangeLandsat = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(AOI)
  .filterDate(lastRangeStartDate, lastRangeEndDate)
  //.filter(ee.Filter.lt('CLOUD_COVER', lastRangeCCPercent))
  .map(function(image) {
    var srBands = image.select(['SR_B5', 'SR_B4']).multiply(0.0000275).add(-0.2);
    var ndvi = srBands.expression(
      '(NIR - RED) / (NIR + RED)', {
        'NIR': srBands.select('SR_B5'),
        'RED': srBands.select('SR_B4')
      }).rename('NDVI')//.clamp(-1,1);
    return ndvi.copyProperties(image, ['system:time_start', 'CLOUD_COVER']);
  });
  
// Compute median NDVI and clip to dune extents
var firstRangeMedianNdvi = firstRangeLandsat.median().clip(dunes).unmask(noDataVal).clip(AOI);
var lastRangeMedianNdvi = lastRangeLandsat.median().clip(dunes).unmask(noDataVal).clip(AOI);

// Add layers to the map
Map.addLayer(firstRangeMedianNdvi, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, firstYear + 'Median NDVI - Landsat 7');
Map.addLayer(lastRangeMedianNdvi, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, lastYear + 'Median NDVI - Landsat 8');


// Export to Drive (clipped to bounding box)

//Export first range image
Export.image.toDrive({
  image: firstRangeMedianNdvi,
  description: 'Median_NDVI_' + firstYear,
  region: AOI.bounds(),
  scale: 30,
  crs: 'EPSG:2193',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  formatOptions: {
    noData: noDataVal,
  }
});

//Export last range image
Export.image.toDrive({
  image: lastRangeMedianNdvi,
  description: 'Median_NDVI_' + lastYear,
  region: AOI.bounds(),
  scale: 30,
  crs: 'EPSG:2193',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  formatOptions: {
    noData: noDataVal,
  }
});
