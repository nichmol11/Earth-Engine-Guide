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


```javascript
// Load and process Landsat 8 data
var images = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(aoi)
  .filterDate('2024-01-01', '2024-12-31')
  .sort('system:time_start')
  .map(scaleL8);
```

## More Information
Here are some more useful resources related to Earth Engine including official documentation and tutorial videos.
- [Offical Google Guide: Getting started with Google Earth Engine](https://developers.google.com/earth-engine/guides/getstarted)
- 