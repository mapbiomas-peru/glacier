// TEMA TRANSVERSAL GLACIARES

var params = {
    'regionGlacier': 1007,
    'pais': 'PERU', // Options: 'PERU', 'BOLIVIA', 'ECUADOR', 'COLOMBIA ,'VENEZUELA'
    'shadowSum':3500,
    'trees': 50,
    'samples': [
            3000,              // glacier  3000
            8000               // no-glacier 8000
          ],
    'versionOutput':5,   // todos 4, en caso de 1007 version 5
    'versionBatch':4,
    'exportar': true,  // false, true
    'cloud': 20  // fraccion cloud de SMA para considera un pixel como no observado
};

var variables = [
                    "blue_median_dry",
                    "green_median_dry",
                    // "green_min",
                    "red_median_dry",
                    "nir_median_dry",
                    "swir1_median_dry",
                    "swir2_median_dry",
                    // "ndwimf_median",
                    "ndwimf_median_dry",
                    "ndsi_median_dry",
                    "ndsi_median_wet",
                    "ndsi_min",
                    // "ndsi_median",
                    // "blue_median",
                    // "green_median",
                    // "red_median",
                    // "nir_median",
                    // "swir1_median",
                    // "swir2_median",
                    'slope',
                    "gv",
                    "npv",
                    "soil",
                    "cloud",
                    "snow",
                    "shade"
              ]

              
//l5(1985-2012), l7(1999-2022), lx(1985-2013), l8(2013-2022)
//             YEAR, SENSOR,  <=Nube, >=nir_median,>=red_median
var YearsSensors =  [
              // [1985,  'lx',      75,    2114,      2497], 
              // [1986,  'lx',      75,     2114,      2497], 
              // [1987,  'lx',      75,     2114,      2497], 
              // [1988,  'lx',      75,     2114,      2497], 
              // [1989,  'lx',      75,     2114,      2497], 
              // [1990,  'lx',      75,     2114,      2497], 
              // [1991,  'lx',      75,     2114,      2497], 
              // [1992,  'lx',      75,     2114,      2497], 
              // [1993,  'lx',      75,     2114,      2497], 
              // [1994,  'lx',      75,     2114,      2497], 
              // [1995,  'lx',      75,     2114,      2497], 
              // [1996,  'lx',      75,     2114,      2497], 
              // [1997,  'lx',      75,     2114,      2497], 
              // [1998,  'lx',      75,     2114,      2497], 
              // [1999,  'lx',      75,     2114,      2497], 
              // [2000,  'lx',      75,     2114,      2497], 
              // [2001,  'lx',      75,     2114,      2497], 
              // [2002,  'lx',      75,     2114,      2497], 
              // [2003,  'lx',      75,     2114,      2497], 
              // [2004,  'lx',      75,     2114,      2497], 
              // [2005,  'lx',      75,     2114,      2497], 
              // [2006,  'lx',      75,     2114,      2497], 
              // [2007,  'lx',      75,     2114,      2497], 
              // [2008,  'lx',      75,     2114,      2497], 
              // [2009,  'lx',      75,     2114,      2497], 
              // [2010,  'lx',      75,     2114,      2497], 
              // [2011,  'lx',      75,     2114,      2497], 
              // [2012,  'lx',      75,     2114,      2497], 
              // [2013,  'l7',      75,     2114,      2497], 
              // [2014,  'l7',      75,     2114,      2497], 
              // [2015,  'l7',      75,     2114,      2497], 
              // [2016,  'l7',      75,     2114,      2497], 
              // [2017,  'l7',      75,     2114,      2497], 
              // [2018,  'l7',      75,     2114,      2497], 
              // [2019,  'l7',      75,     2114,      2497], 
              // [2020,  'l7',      75,     2114,      2497],
              // [2021,  'l7',      75,     2114,      2497],
              [2022,  'l7',      75,     2114,      2497],
              [2023,  'l7',      75,     2114,      2497],
              // [2013,  'l8',      75,     1730,      2304], 
              // [2014,  'l8',      75,     1730,      2304], 
              // [2015,  'l8',      75,     1730,      2304], 
              // [2016,  'l8',      75,     1730,      2304], 
              // [2017,  'l8',      75,     1730,      2304], 
              // [2018,  'l8',      75,     1730,      2304], 
              // [2019,  'l8',      75,     1730,      2304], 
              // [2020,  'l8',      75,     1730,      2304],
              // [2021,  'l8',      75,     1730,      2304],
              [2022,  'l8',      75,     1730,      2304],
              [2023,  'l8',      75,     1730,      2304],
              [2022,  'l9',      75,     1730,      2304],
              [2023,  'l9',      75,     1730,      2304]
             ]  
             

/**
* Importa geometria: carta y region
*/
 
var AssetRegions = 'projects/mapbiomas-raisg/DATOS_AUXILIARES/VECTORES/clasificacion-regiones-glacier-5';
var AssetRegionsRaster = 'projects/mapbiomas-raisg/DATOS_AUXILIARES/RASTERS/clasificacion-regiones-glacier-5';
var AssetClasBatch = 'projects/mapbiomas-raisg/TRANSVERSALES/'+ params.pais + '/COLECCION5/GLACIAR/clasificacion'
var GlacierCol3 = ee.Image("users/eturpo/Glacier-Mapping/COLECCION1/INTEGRACION/Glacier_collection1_integration_5");
var palettes = require('users/mapbiomas/modules:Palettes.js');
var dem = ee.Image("USGS/SRTMGL1_003");
var slope = ee.Terrain.slope(dem).rename('slope')

var region = ee.FeatureCollection(AssetRegions).filterMetadata('id_regionC', 'equals', params.regionGlacier)
var regionRaster = ee.Image(AssetRegionsRaster).eq(params.regionGlacier).selfMask()

var clasCollBatch = ee.ImageCollection(AssetClasBatch).filter(ee.Filter.eq('version', params.versionBatch));

// Map.centerObject(region, 10);
Map.addLayer(
    region.style({ fillColor: '000000', color: '00000000'}), 
    {}, 'Background'
);

/**
* Importa el modulo 'GetImages' para la obtención de los mosaicos
*/
var getImages = require('users/raisgmb01/mapbiomas-cross-cutting-themes:mapbiomas-glacier/collection-5/modules/GetImages.js');
var smafractions = require('users/raisgmb01/mapbiomas-cross-cutting-themes:mapbiomas-glacier/collection-5/modules/Sma-fractions.js');

/**
 * Get stable pixels
 * Get stable pixels from mapbiomas collection 2
 * Then cross over reference datasets 
 */
var getStablePixels = function (image, classes) {
  
  var bandNames = image.bandNames(),
      images = [];

  classes.forEach(function(classId){
      var previousBand = image
        .select([bandNames.get(0)]).eq(classId);
          
      var singleClass = ee.Image(
        bandNames.slice(1)
          .iterate(
            function( bandName, previousBand ) {
              bandName = ee.String( bandName );
              return image
                .select(bandName).eq(classId)
                .multiply(previousBand);
            },
            previousBand
          )
      );
      
      singleClass = singleClass
        .updateMask(singleClass.eq(1))
        .multiply(classId);
      
      images.push(singleClass);
  });
  
  
  // blend all images
  var allStable = ee.Image();
  
  for(var i = 0; i < classes.length; i++) 
    allStable = allStable.blend(images[i]);

  return allStable;
};

var getSamples = function(reference, mosaic, points) {
  
    var training = reference
      .addBands(mosaic)
      .sampleRegions({
          collection: points,
          properties: ['reference'],
          scale: 30,
          geometries: true,
          tileScale: 4
    });
    
    return {
      points: points, 
      training: training 
    };
    
};

//var Clasification = ee.Image();
YearsSensors.forEach(
  function(yearsensor) {
    var tree = {
      nir_dry:yearsensor[3],  //mayor o igual a
      red_dry:yearsensor[4],  //mayor o igual a
    }
    var param = {
    // 'grid_name': params.grid_name,
    't0': yearsensor[0]+'-01-01',
    't1': yearsensor[0]+'-12-31',
    'satellite': yearsensor[1],
    'cloud_cover': yearsensor[2],
    'pais': params.pais,
    'regionMosaic': params.regionGlacier,
    'shadowSum':params.shadowSum
    };
  var ImagesYear = getImages.getImages(param,[],region);
  
  // print('Mosaic:'+yearsensor[0], ImagesYear[1]);
    
  var Mosaic = ImagesYear[0].updateMask(regionRaster)
                            .addBands(slope);
                            
  Mosaic = Mosaic.updateMask(Mosaic.select('blue_median').gte(0));
  
  Mosaic = smafractions.getFractions(Mosaic);
  
  
  // Pixel estable
   var classes = ee.List.sequence(1, 34).getInfo();
   var stablePixels = getStablePixels(GlacierCol3, classes);
   
   stablePixels= stablePixels.updateMask(regionRaster)
                             .rename("reference");
   Map.addLayer(stablePixels,{},'stablePixels',false)
  // clasificacion random forest
  
    var points = stablePixels
    .addBands(ee.Image.pixelLonLat())
    .stratifiedSample({
        numPoints: 0,
        classBand: 'reference',
        region: region.geometry().bounds(),
        scale: 30,
        seed: 1,
        geometries: true,
        dropNulls: true,
        classValues: [34, 25], 
        classPoints: [ params.samples[0], params.samples[1] ]
  });
  
  var MosaicForClass = Mosaic.select(variables)
  print(yearsensor[0], MosaicForClass.bandNames().size())
  
  var trainingSamples = getSamples(stablePixels, MosaicForClass, points);
  var training = trainingSamples.training;
  
  // Define classifier
  var classifier = ee.Classifier.smileRandomForest({
      numberOfTrees: params.trees, 
      variablesPerSplit: 1
  });
  
  var _classifier = classifier.train(training, 'reference')
  var classified_RF = MosaicForClass.classify(_classifier)

  var classified_RF_v4 = classified_RF.where(Mosaic.select('nir_median').lte(tree.nir_dry),25)
                                      .where(Mosaic.select('red_median').lte(tree.red_dry),25)
                                      .where(Mosaic.select('snow').gte(40).and(Mosaic.select('slope').gte(15)), 34)
                                      .where(Mosaic.select('cloud').gte(params.cloud),27).selfMask();
                               
  var Collection = ImagesYear[1];
  //print('# imagenes:'+yearsensor[0], Collection.size())
   Map.addLayer(Mosaic.select(['swir1_median','nir_median','red_median']), {
          bands: 'swir1_median,nir_median,red_median',
          min:300,
          max:5000
      },'Mosaic-median-'+yearsensor[0]+ '-' +yearsensor[1], false)

    Map.addLayer(MosaicForClass, {
          bands: 'swir1_median_dry,nir_median_dry,red_median_dry',
          min:300,
          max:5000
      },'Mosaic-minsnow-'+yearsensor[0]+ '-' +yearsensor[1], false)
      
    Map.addLayer(Mosaic, {
          bands: 'snow',
          min:0,
          max:100,
          palette:[ "#00007F",  "#002AFF",  "#00D4FF",  "#7FFF7F",  "#FFD400",  "#FF2A00",  "#7F0000"]
      },'fraction-'+yearsensor[0]+ '-' +yearsensor[1], false)
      
  // Map.addLayer(Mosaic.select('snow').gte(40).and(Mosaic.select('slope').gte(15)).selfMask(), {palette:'blue'}, 'snow',false)
  
  Map.addLayer(classified_RF_v4.updateMask(classified_RF_v4.eq(34)).selfMask(),{palette: 'ff0000'},'classified-RF-'+params.versionOutput+'-'+yearsensor[0],false)
  
  // Map.addLayer(classified_RF_v4,{min:25,max:34,palette: ['#ffa500','#9d9d9d','#0cd2ff']},'classified-RF-v4-'+yearsensor[0],false)
  if(yearsensor[0]<=2023){
  var clasifyearBatch = clasCollBatch.filter(ee.Filter.eq('year', yearsensor[0])).mode()
  
  Map.addLayer(clasifyearBatch.updateMask(clasifyearBatch.eq(34)).selfMask(),{palette: 'fff729'},'classified-RF-' + params.versionBatch + '-batch'+yearsensor[0],false)
  }

  Map.addLayer(points,{},'points',false)
  
  
  
  // RANDOM FOREST
  var Clasification_RF = classified_RF_v4.rename('classification') //Clasification.addBands(Glacier.rename('clasification'+yearsensor[0]))
  
      Clasification_RF = Clasification_RF.toInt8().set('region', params.regionGlacier)
                                 .set('year', yearsensor[0])
                                 .set('version', params.versionOutput)
                                 .set('pais', params.pais)
                                 .set('satellite', param.satellite)
                                 .set('metodo', 'RF-DT');
  // print(Clasification_RF)
  
  var sensornameupper =param.satellite.toUpperCase()
  
  if(params.exportar){

    Export.image.toAsset({
      image: Clasification_RF,
      description:'GLACIER-' + sensornameupper + '-' + params.regionGlacier + '-'+ yearsensor[0] + '-'+ params.versionOutput,
      assetId:'projects/mapbiomas-raisg/TRANSVERSALES/'+ params.pais + '/COLECCION5/GLACIAR/clasificacion/'+ 
              'GLACIER-' + sensornameupper + '-' + params.regionGlacier+ '-'+ yearsensor[0]+ '-'+ params.versionOutput,
      scale: 30,
      pyramidingPolicy: {
        '.default': 'mode'
      },
      maxPixels: 1e13,
      region: region.geometry().bounds()
    });
    

   }
  } )


/**
* Despliega en el mapa los mosaicos y polígonos necesarios
* para la visualización
*/
//print(Clasification)



Map.addLayer(
    region.style({ fillColor: '#ff000000', color: 'f59e42'}),
    {}, 'Regions ' + params.pais, false
);

