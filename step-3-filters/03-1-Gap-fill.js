/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var regions = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Polygon(
                [[[-81.59535819052395, 1.9759677446610016],
                  [-81.59535819052395, -22.39180449745901],
                  [-55.66762381552395, -22.39180449745901],
                  [-55.66762381552395, 1.9759677446610016]]], null, false),
            {
              "system:index": "0"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var param = {
    regionGlacier: 1011,
    pais: 'PERU', 
    year: 2021,  // Solo visualizacion
    version_input: 4,
    version_output: 41,
   }

// input
var AssetGlacierClass =  'projects/mapbiomas-raisg/TRANSVERSALES/'+ param.pais + '/COLECCION5/GLACIAR/clasificacion'
var OutputAsset = 'projects/mapbiomas-raisg/TRANSVERSALES/'+ param.pais + '/COLECCION5/GLACIAR/clasificacion-ft/'
var OutputAssetMet = 'projects/mapbiomas-raisg/TRANSVERSALES/'+ param.pais + '/COLECCION5/GLACIAR/clasificacion-ft/'
var AssetMosaicnexgenmap= 'projects/nexgenmap/MapBiomas2/LANDSAT/PANAMAZON/mosaics-2'
var AssetMosaicraisg= 'projects/mapbiomas-raisg/MOSAICOS/mosaics-2'
var AssetRegions = 'projects/mapbiomas-raisg/DATOS_AUXILIARES/VECTORES/clasificacion-regiones-glacier-5';
var AssetRegionsRaster = 'projects/mapbiomas-raisg/DATOS_AUXILIARES/RASTERS/clasificacion-regiones-glacier-5';

var palettes = require('users/mapbiomas/modules:Palettes.js');
var eePalettes = require('users/gena/packages:palettes');


var regionRaster = ee.Image(AssetRegionsRaster).eq(param.regionGlacier).selfMask()
Map.addLayer(regionRaster, {"format": "png"}, 'Region ');

var mosaic = ee.ImageCollection(AssetMosaicnexgenmap).merge(AssetMosaicraisg)
            .select(['swir1_median', 'nir_median', 'red_median'])
            .filterMetadata('year', 'equals', param.year);
            
var Clasificacion_Year = ee.ImageCollection(AssetGlacierClass)
                      .filterMetadata('region', 'equals', param.regionGlacier)
                      .filterMetadata('version', 'equals', param.version_input);
                      
print(Clasificacion_Year)

// capas COL4
var PERU = ee.ImageCollection("projects/mapbiomas-raisg/TRANSVERSALES/PERU/COLECCION4/GLACIAR/INTEGRACION/glaciar4");
var BOLIVIA = ee.ImageCollection("projects/mapbiomas-raisg/TRANSVERSALES/BOLIVIA/COLECCION4/GLACIAR/INTEGRACION/glaciar4");
var ECUADOR = ee.ImageCollection("projects/mapbiomas-raisg/TRANSVERSALES/ECUADOR/COLECCION4/GLACIAR/INTEGRACION/glaciar4");
var VENEZUELA = ee.ImageCollection("projects/mapbiomas-raisg/TRANSVERSALES/VENEZUELA/COLECCION4/GLACIAR/INTEGRACION/glaciar4");

var Clasificacion_COL4 = PERU.merge(BOLIVIA)
                             .merge(ECUADOR)
                             .merge(VENEZUELA);

var years = [
    1985, 1986, 1987, 1988,
    1989, 1990, 1991, 1992,
    1993, 1994, 1995, 1996,
    1997, 1998, 1999, 2000,
    2001, 2002, 2003, 2004,
    2005, 2006, 2007, 2008,
    2009, 2010, 2011, 2012,
    2013, 2014, 2015, 2016,
    2017, 2018, 2019, 2020,
    2021, 2022, 2023];

var Clasificacion = ee.Image(0).select([]);
years.forEach(function(year){
  
  var GlacierYear
  if(year < 2022){
    GlacierYear = Clasificacion_COL4.filter(ee.Filter.eq('year', year)).mosaic().unmask(25).updateMask(regionRaster);
  } else {
    GlacierYear = Clasificacion_Year.filterMetadata('year', 'equals', year).mode();
  }
  
  Clasificacion = Clasificacion.addBands(GlacierYear.rename('classification_'+year));
});
// Clasificacion = Clasificacion.slice(1);
print(Clasificacion);

Map.addLayer(Clasificacion,
            {},'Glacier-original'+'-v1',false)


// GAP FILL

/**
* User defined functions
*/
var applyGapFill = function (image) {

    // apply the gap fill form t0 until tn
    var imageFilledt0tn = bandNames.slice(1)
        .iterate(
            function (bandName, previousImage) {

                var currentImage = image.select(ee.String(bandName));

                previousImage = ee.Image(previousImage);

                currentImage = currentImage.unmask(
                    previousImage.select([0]));

                return currentImage.addBands(previousImage);

            }, ee.Image(image.select([bandNames.get(0)]))
        );

    imageFilledt0tn = ee.Image(imageFilledt0tn);

    // apply the gap fill form tn until t0
    var bandNamesReversed = bandNames.reverse();

    var imageFilledtnt0 = bandNamesReversed.slice(1)
        .iterate(
            function (bandName, previousImage) {

                var currentImage = imageFilledt0tn.select(ee.String(bandName));

                previousImage = ee.Image(previousImage);

                currentImage = currentImage.unmask(
                    previousImage.select(previousImage.bandNames().length().subtract(1)));

                return previousImage.addBands(currentImage);

            }, ee.Image(imageFilledt0tn.select([bandNamesReversed.get(0)]))
        );


    imageFilledtnt0 = ee.Image(imageFilledtnt0).select(bandNames);

    return imageFilledtnt0;
};


// Obtiene la version de salida en base al ciclo
var version_input = param.version_input;
var version_output = param.version_output;

var image = Clasificacion;

var regions = ee.FeatureCollection(AssetRegions)
    .filterMetadata('id_regionC', "equals", param.regionGlacier);


// get band names list 
var bandNames = ee.List(
    years.map(
        function (year) {
            return 'classification_' + String(year);
        }
    )
);

//--- convert pixel 0 para 27, and 22 para 24---
var classif = ee.Image();
var bandnameReg = image.bandNames();
bandnameReg.getInfo().forEach(
  function (bandName) {
    var imagey = image.select(bandName)
    var band0 = imagey.updateMask(imagey.unmask().neq(27))
                      // imagey.where(imagey.eq(0), 27)
                      // .where(imagey.eq(33), 33); //.updateMask(imagey.unmask().neq(27))
    classif = classif.addBands(band0.rename(bandName))
  }
)

image =classif.select(bandnameReg);

// generate a histogram dictionary of [bandNames, image.bandNames()]
var bandsOccurrence = ee.Dictionary(
    bandNames.cat(image.bandNames()).reduce(ee.Reducer.frequencyHistogram())
);

print(bandsOccurrence);
 
// insert a masked band 
var bandsDictionary = bandsOccurrence.map(
    function (key, value) {
        return ee.Image(
            ee.Algorithms.If(
                ee.Number(value).eq(2),
                image.select([key]).byte(),
                ee.Image().rename([key]).byte().updateMask(image.select(0))
            )
        );
    }
);

// convert dictionary to image
var imageAllBands = ee.Image(
    bandNames.iterate(
        function (band, image) {
            return ee.Image(image).addBands(bandsDictionary.get(ee.String(band)));
        },
        ee.Image().select()
    )
);


// generate image pixel years
var imagePixelYear = ee.Image.constant(years)
    .updateMask(imageAllBands)
    .rename(bandNames);

// apply the gap fill
var imageFilledtnt0 = applyGapFill(imageAllBands);
var imageFilledYear = applyGapFill(imagePixelYear);


/**
* Export images to asset
*/
var imageName = param.pais + '-' + param.regionGlacier + '-' + version_output;

imageFilledtnt0 = imageFilledtnt0.select(bandNames)
                  .set('code_region', param.regionGlacier)
                  .set('pais', param.pais)
                  .set('version', version_output)
                  .set('descripcion', 'gapfill')
                  .set('paso', 'P03')

print(imageFilledtnt0);

Export.image.toAsset({
    'image': imageFilledtnt0,
    'description': imageName,
    'assetId':  OutputAsset + imageName,
    'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': regions.geometry().bounds(),
    'scale': 30,
    'maxPixels': 1e13
});

var imageNameGapFill = param.pais + '-' + param.regionGlacier + '-' + version_output + '-metadata';

var imageFilledYear = imageFilledYear
                        .set('code_region', param.regionGlacier)
                        .set('pais', param.pais)
                        .set('version', version_output)
                        .set('descripcion', 'gapfill metadata')
                        .set('paso', 'P01')

print(imageFilledYear)  
Export.image.toAsset({
    'image': imageFilledYear,
    'description': imageNameGapFill,
    'assetId': OutputAssetMet + imageNameGapFill,
    'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': regions.geometry().bounds(),
    'scale': 30,
    'maxPixels': 1e13
});
/**
* Layers
*/

var vis = {
    'bands': ['classification_' + param.year],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2'),
    'format': 'png'
};


Map.addLayer(mosaic.mosaic().updateMask(regionRaster), {
      'bands': ['swir1_median', 'nir_median', 'red_median'],
      'gain': [0.08, 0.06, 0.08],
      'gamma': 0.65
  }, 'mosaic-'+param.year, false);
  
Map.addLayer(
    image,
    vis,
    'clasificacion original Mask-' + param.year);

Map.addLayer(
    imageFilledtnt0,
    vis,
    'clasificacion gap fill ' + param.year);

Map.addLayer(imageFilledYear,
    {
        'bands': ['classification_' + param.year],
        'min': 1985,
        'max': 2018,
        'palette': eePalettes.colorbrewer.YlOrBr[9],
        'format': 'png'
    },
    'image metadata',false
);

Map.addLayer(
    regions.style({
        "color": "ff0000",
        "fillColor": "ff000000"
    }),
    {
        "format": "png"
    },
    'Region ' + param.regionGlacier,
    false);

