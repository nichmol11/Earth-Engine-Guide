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

## Adding and visualising data
We can start by adding the data we want to use. We do this by creating an image collection as a JavaScript variable, defining the platform (e.g. Landsat, Sentinel, Modis) and level of product we want and then applying various filters. In the code block below, I create an image collection from Landsat 8 Level 2 Collection 2 Tier 1 and filter it to only include images taken between 2000 and 2024.


```javascript
// Load and process Landsat 8 data
var images = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")(
  .filterDate('2000-01-01', '2024-12-31')
  .sort('system:time_start')
  .map(scaleL8)
  );
```

*Level 2 images refer to images that have undergone additional processing to provide more accurate and usable products for scientific analysis. Collection 2 refers to images that have undergone a reprocessing effort that improved georectification and radiometric calibration. While Tier 1 refers to the best quality images from the Landsat archive.*

Now what we have now is a collection of images, not an individual image. If we want to visualise the data we need to either select a single image (for example the image with the lowest cloud cover) or use some way to summarise the collection and produce a multi-image composite. There are a variety of ways of doing this such as taking the mean or median pixel value from the collection or by choosing 

Now lets look at how we would add a false colour near-infrared composite image to the map. Firstly we need to scale the pixel values, converting the raw digital numbers to surface reflectance values (ranging between 0 and 1). While this is not strictly required for just displaying an image, its required if we want to do any form of quantitative analysis such as calculating NDVI so its best to do this now. For the non-thermal bands from both Landsat 7 and Landsat 8 the correction formula is as follows:

$$
Reflectance = DN \times 0.0000275 - 0.2
$$

We can write a function to apply this correction to the appropriate bands. Then we pass the image collection through this correction formula, creating a new corrected image collection.

```javascript
//Function to apply corrections to bands
function scaleL8(img) {
  return img.addBands(
    img.select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'])
         .multiply(0.0000275).add(-0.2), null, true);
}

//Create a new corrected image collection
var imgL8 = images.map(scaleL8)
```

Now that we have applied the correction we can display an image. We need to choose the bands we want to display. To do this we have to choose the bands we want to use. Bands are numbered sequentially with increasing wavelength. Note that, as shown in the diagram below, the bands are offset by 1 between Landsat 7 and 8. This is because Landsat 8 added an extra *deep blue* band as band 1.

![Diagram of posiiton of Landsat 7 and 8 bands](landsat_bands.png)

To summarise, the following table shows the most commonly used bands and their Landsat 7 and 8 band numbers:

| Band Name       | Landsat 7      | Landsat 8      |
|-----------------|----------------|----------------|
| Blue            | Band 1         | Band 2         |
| Green           | Band 2         | Band 3         |
| Red             | Band 3         | Band 4         |
| Near-Infrared   | Band 4         | Band 5         |

So to render a Landsat 8 true colour image we need bands 2, 3 and 4. We do this using the addLayer function as shown below. Because we still have a collection of images we can produce a produce a median pixel composite by using the .median() function. Setting the minimum and maximum....

```javascript
//Add a true colour composite using the median value from the collection for each pixel
Map.addLayer(imgL8.median(), {
      bands: ['SR_B4', 'SR_B3', 'SR_B2'],
      min: 0,
      max: 0.2
    }, 'True Color');
```


## Calculating and visualising radiometric indices (NDVI)

## More Information
Here are some more useful resources related to Earth Engine including official documentation and tutorial videos.
- [Offical Google Guide: Getting started with Google Earth Engine](https://developers.google.com/earth-engine/guides/getstarted)
- 


