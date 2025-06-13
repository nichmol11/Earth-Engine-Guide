# Using Google Earth Engine for assessing coastal dune vegetation changes
### By Nicholas Molloy


## About Earth Engine
_Earth Engine_ is a cloud based platform for analysing and visualising remote sensing data developed by Google. It allows a vast catalogue of satellite data to be efficiently accessed and processed using user-created algorithms.

The Earth Engine API is provided in Python and JavaScript. These APIs are simple yet very powerful tools which can quickly process large quantities of data by leveraging Google's cloud computing resources. 

In this guide the web-based Earth Engine code editor is used to create earth engine apps, simple GUI based web applications that are easy to deploy and share. The Earth Engine code editor is an online IDE (Integrated development environment) that allows the development of JavaScript earth engine algorithms and the visualisation of the resulting data on the integrated map. It also allows final data products to be exported in standard formats such as GeoTIFFs which can be used in desktop GIS applications like QGIS and ArcGIS.

## Getting Started
To get started, you will need a Google account. Navigate to the [Getting Started](https://code.earthengine.google.com/register) page and sign in with your Google account. Then proceed through the setup process and complete the form to apply for free non-commercial use and set up your first Earth Engine project. 

Once you get through the setup process, navigate to the [Earth Engine code editor](https://code.earthengine.google.com/). You will be greeted by the earth engine IDE which which looks like this:
 
![Screenshot of the earth engine code editor](Earth_engine_code_editor.png)

You will notice there are three panels on the top half of the screen and a map on the bottom half. The central panel is the text editor where you will write the algorithms that Earth Engine will execute in JavaScript. When you open Earth Engine this will be labelled New Script. Each script can be used to run algorithms and to build an Earth Engine app.

## Adding data
We can start by adding the data we want to use. We do this by creating an image collection, defining the platform (e.g. Landsat, Sentinel, Modis) and level of product we want and then applying various filters. In the code block below, I create an image collection from Landsat 8 Level 2 Collection 2 Tier 1 and filter it to only include images from 2024.


```javascript
// Load and process Landsat 8 data
var images = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")(
  .filterDate('2024-01-01', '2024-12-31')
  .sort('system:time_start')
  .map(scaleL8)
  );
```

*Level 2 images refer to images that have undergone additional processing to provide more accurate and usable products for scientific analysis. Collection 2 refers to images that have undergone a reprocessing effort that improved georectification and radiometric calibration. While Tier 1 refers to the best quality images from the Landsat archive.*

Now what we have now is a collection of images, not an individual image. If we want to visualise the data we need to either select a single image (for example the image with the lowest cloud cover) or use some way to summarise the collection and produce a multi-image composite. 
//add more infor here...

Now lets look at how we would add a false colour near-infrared composite image to the map:

```javascript
// Load and process Landsat 8 data
//Produce a collection all images from 2020 - 2024 which had cloud coverage of less than 20%
var images = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterDate('2020-01-01', '2024-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .sort('system:time_start')

//Function to apply corrections to bands
function scaleL8(img) {
  return img.addBands(
    img.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'])
         .multiply(0.0000275).add(-0.2), null, true);
}

//Create a new corrected image collection
var imgL8 = images.map(scaleL8)


//Produce a false colour near-infrared composite image from the collection and add it to the map. 
//We use the median value from the collection for each pixel
Map.addLayer(imgL8.median(), {
      bands: ['SR_B5', 'SR_B4', 'SR_B3'],
      min: 0,
      max: 0.3
    }, 'False Color');
```

## More Information
Here are some more useful resources related to Earth Engine including official documentation and tutorial videos.
- [Offical Google Guide: Getting started with Google Earth Engine](https://developers.google.com/earth-engine/guides/getstarted)
- 


