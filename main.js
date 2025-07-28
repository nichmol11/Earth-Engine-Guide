// Load and process Landsat 8 data
var images = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterDate('2020-01-01', '2024-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .sort('system:time_start');

//Function to apply corrections to bands
function scaleBands(img) {
  return img.addBands(
    img.select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'])
         .multiply(0.0000275).add(-0.2), null, true);
}

/*
//Create a new corrected image collection
var imgL8 = images.map(scaleL8);

//Add a true colour composite using the median value from the collection for each pixel
Map.addLayer(imgL8.median(), {
      bands: ['SR_B4', 'SR_B3', 'SR_B2'],
      min: 0,
      max: 0.2
    }, 'True Color');

//Produce a composite image using the median value from the collection for each pixel and add it to the map
//We produce a false colour visualisation here, Red = Near Infrared (Band 5), Green = Red (Band 4) and Blue = Green (Band 3)
 Map.addLayer(imgL8.median(), {
      bands: ['SR_B5', 'SR_B4', 'SR_B3'],
      min: 0,
      max: 0.3
    }, 'False Color'); 
    
*/

//Functions to calculate NDVI
//Landsat 8 function
function calcNDVIL8(image) {
    var srBands = image.select(['SR_B5', 'SR_B4'])
    var ndvi = srBands.expression(
      '(NIR - RED) / (NIR + RED)', {
        'NIR': srBands.select('SR_B5'),
        'RED': srBands.select('SR_B4')
      }).rename('NDVI');
    return ndvi.copyProperties(image, ['system:time_start']);
}
//Landsat 7 function
function calcNDVIL7(image) {
    var srBands = image.select(['SR_B4', 'SR_B3'])
    var ndvi = srBands.expression(
      '(NIR - RED) / (NIR + RED)', {
        'NIR': srBands.select('SR_B4'),
        'RED': srBands.select('SR_B3')
      }).rename('NDVI');
    return ndvi.copyProperties(image, ['system:time_start']);
}

/*
//Perform the calculation
var ndviImgs = imgL8.map(calcNDVI);

//Add the median NDVI layer to the map
Map.addLayer(ndviImgs.median(), {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'Median NDVI');
*/


/*
//Export the median NDVI image clipped to the AOI polygon
Export.image.toDrive({
  image: ndviImgs.median(),
  description: 'NDVI_AOI',
  region: AOI.bounds(),
  scale: 30,
  crs: 'EPSG:2193',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  formatOptions: {
    noData: -9999,
  }
});
*/

//Building UI elements for app

//Array to store the parameters for the different layers
var layers = [];
var currentIndex = 0;
var currentYear = 2024;

//Function to generate the parameters for each layer for a given year
function generateLayers(year) {
  currentYear = year;
  var startDate = year + '-01-01';
  var endDate = year + '-12-31';

  var imgCol = year < 2014 ? "LANDSAT/LE07/C02/T1_L2" : "LANDSAT/LC08/C02/T1_L2";

  var images = ee.ImageCollection(imgCol)
  .filterDate(startDate, endDate)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .sort('system:time_start');

  var imgsCorr = images.map(scaleBands);
  var NDVIcol = year < 2014 ? imgsCorr.map(calcNDVIL7) : imgsCorr.map(calcNDVIL8);

  layers = [
    {
      name: "Landsat " + (year < 2014 ? "7 " : "8 ") + "true colour",
      image: imgsCorr.median().select(year < 2014 ? ['SR_B3','SR_B2','SR_B1'] : ['SR_B4','SR_B3','SR_B2']),
      visParams: {bands: (year < 2014 ? ['SR_B3','SR_B2','SR_B1'] : ['SR_B4','SR_B3','SR_B2']), min: 0, max: 0.2}
    },
    {
      name: "Landsat " + (year < 2014 ? "7 " : "8 ") + "false colour",
      image: imgsCorr.median().select(year < 2014 ? ['SR_B4','SR_B3','SR_B2'] : ['SR_B5','SR_B4','SR_B3']),
      visParams: {bands: (year < 2014 ? ['SR_B4','SR_B3','SR_B2'] : ['SR_B4','SR_B3','SR_B2']), min: 0, max: 0.3}
    },
    {
      name: "Landsat " + (year < 2014 ? "7 " : "8 ") + "NDVI",
      image: NDVIcol.median().select('NDVI'),
      visParams: {min: -1, max: 1, palette: ['blue', 'white', 'green']}
    }
  ];
}





//Function to add the selected layer to the map and clear the existing layers
function updateMapLayers(selectedIndex) {
  // Clear and update map layer
  Map.layers().reset();
  var layer = layers[selectedIndex];
  currentIndex = selectedIndex;
  Map.addLayer(layer.image, layer.visParams, layer.name);
  label.setValue(currentYear + " " + layer.name);
}

//Add a button to switch to true colour
var button = ui.Button({
  label: 'True Colour View',
  onClick: function() {
    //Update the map with the first layer in the array (true colour)
    updateMapLayers(0);
  } 
});

//Add a button to switch to false colour near-infrared
var button = ui.Button({
  label: 'False Colour View',
  onClick: function() {
    //Update the map with the second layer in the array (false colour near-infrared)
    updateMapLayers(1);
  } 
});

//Add a button to switch to NDVI view
var button = ui.Button({
  label: 'NDVI View',
  onClick: function() {
    //Update the map with the second layer in the array (false colour near-infrared)
    updateMapLayers(2);
  } 
});


//Add a slider
var slider = ui.Slider(2000, 2024, 2024, 1);
slider.onChange(function(value) {
  //Generate the layers for the given year
  generateLayers(value);
  //Update the current view to the given year
  updateMapLayers(currentIndex)
});

//Add a label to provide details on current view
var label = ui.label();

// Add the default view/year
generateLayers(2024);
updateMapLayers(0);

/*ui.root.insert(0, cycleButton);*/
