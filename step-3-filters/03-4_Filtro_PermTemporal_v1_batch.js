var listrc = [
              // [1001,'COLOMBIA'],
              [1002,'VENEZUELA'],
              // [1003,'COLOMBIA'],
              [1004,'ECUADOR'],
              [1005,'PERU'],
              [1006,'PERU'],
              [1007,'PERU'],
              [1008,'PERU'],
              [1009,'PERU'],
              [1010,'PERU'],
              [1011,'PERU'],
              [1012,'BOLIVIA'],
              [1013,'PERU'],
              [1014,'BOLIVIA'],
              [1015,'BOLIVIA'],
              ]
              
for(var rc = 0; rc<listrc.length; rc++){
  
var param = { 
    regionGlacier: listrc[rc][0],  //Region de Clasificacion
    pais: listrc[rc][1], 
    year: [2020],  // Solo visualizacion
    version_input: 43,
    version_output: 44,
    exportOpcion: {   // Opciones para exportar
      DriveFolder: 'DRIVE-EXPORT',  // carpeta a exportar archivo drive
      exportClasifToDrive:  false, // exporta clasificaciones a drive (true or false)
      exportEstadistica: false, // Exporta Areas (true or false)
    },
};

print(param.regionGlacier)
 
var YearBase= 1985;

//--------------------------------------------

var dirinput =  'projects/mapbiomas-raisg/TRANSVERSALES/'+ param.pais + '/COLECCION5/GLACIAR/clasificacion-ft';
var dirout  =   'projects/mapbiomas-raisg/TRANSVERSALES/'+ param.pais + '/COLECCION5/GLACIAR/clasificacion-ft';
var AssetMosaic='projects/nexgenmap/MapBiomas2/LANDSAT/PANAMAZON/mosaics-2';

var AssetRegions = 'projects/mapbiomas-raisg/DATOS_AUXILIARES/VECTORES/clasificacion-regiones-glacier-5';
var AssetRegionsRaster = 'projects/mapbiomas-raisg/DATOS_AUXILIARES/RASTERS/clasificacion-regiones-glacier-5';

var region = ee.FeatureCollection(AssetRegions).filterMetadata('id_regionC', 'equals', param.regionGlacier)
var regionRaster = ee.Image(AssetRegionsRaster).eq(param.regionGlacier).selfMask()

var prefixo_out = param.pais+ '-' + param.regionGlacier + '-' 
////*************************************************************
// Do not Change from these lines
////*************************************************************

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};

//var mosaicRegion = param.regionGlacier.toString().slice(0, 3);
var mosaic = ee.ImageCollection(AssetMosaic)
            // .filterMetadata('region_code', 'equals', '703')
            .select(['swir1_median', 'nir_median', 'red_median']);
            
var Clasificacion_TD = ee.ImageCollection(dirinput)
                      .filterMetadata('code_region', 'equals', param.regionGlacier)
                      .filterMetadata('version', 'equals', param.version_input)
                      .mosaic()
                      
// print(Clasificacion_TD)
//-----
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

// get band names list 
var bandNames = ee.List(
    years.map(
        function (year) {
            return 'classification_' + String(year);
        }
    )
);

// print(bandNames)


var baselineGlacier = Clasificacion_TD.select('classification_'+YearBase);
var integrated = Clasificacion_TD.updateMask(baselineGlacier.eq(34)).select(bandNames);

// print(integrated)

// var year = 1986
// var yearANT = year-1
// var deforestaionYear = integrated.slice(1).select('classification_'+ year)
//                       .where(baselineGlacier.select('classification_'+ yearANT).eq(25), 25);
// print(deforestaionYear)
// print(ee.List(years).slice(1))

// var remapClass = function (year, image) {
//       print(deforestaionYear)
//       var deforestaionYear = integrated.select(ee.Number(year).subtract(1985))
//                             .where(ee.Image(image).select(ee.Image(image).bandNames().length().subtract(1)).eq(25), 25);
      
//       return ee.Image(image).addBands(deforestaionYear);
//   };
  
// var Fifper = ee.List(years).slice(1).iterate(remapClass, baselineGlacier)
// Fifper = ee.Image(Fifper);

// print('Fifper',Fifper) 
// Map.addLayer(Fifper,{},'Fifper')

var yearsAPPLY = years
// print(yearsAPPLY)
var Filperv2 = Clasificacion_TD.select('classification_1985')
for(var i = 1;i<yearsAPPLY.length;i++){
  var clasyear = Clasificacion_TD.select('classification_'+yearsAPPLY[i])
  clasyear = Clasificacion_TD.select('classification_'+yearsAPPLY[i])
                             .where(Filperv2.select('classification_'+yearsAPPLY[i-1]).eq(25),25)
  Filperv2 = Filperv2.addBands(clasyear.rename('classification_'+yearsAPPLY[i]))
  //print(yearsAPPLY[i-1])
}

// print(Filperv2)
                    
var classIds = [25];
var t0 = 1985;
var t1 = 2023;

function DeglaciacionCalc (integrated,classIds,t0,t1) {

  // rename the classIds pixels to the corresponding year
  var remapClass = function (year, image) {
  
      var deforestaionYear = integrated
          .select(ee.Number(year).subtract(t0))
          .remap(classIds, ee.List.repeat(year, classIds.length));
  
      return ee.Image(image).addBands(deforestaionYear);
  };
  
  // Get deforestation
  var deforestation = ee.Image(ee.List.sequence(t0, t1)
      .iterate(remapClass, ee.Image().select()))
      .reduce(ee.Reducer.min())
      .rename('year');
  
  
  deforestation = deforestation.mask(deforestation.neq(t0)).selfMask()

return deforestation
}

var Deglaciacion = DeglaciacionCalc(integrated,classIds,t0,t1)


//----
// for(var y = 0; y<param.year.length;y++) {

//     var vis = {
//         'bands': 'classification_'+param.year[y],
//         'min': 0,
//         'max': 34,
//         'palette': palettes.get('classification2')
//     };
    
//     Map.addLayer(mosaic.filterMetadata('year', 'equals', param.year[y])
//                       .mosaic().updateMask(regionRaster), {
//           'bands': ['swir1_median', 'nir_median', 'red_median'],
//           'gain': [0.08, 0.06, 0.08],
//           'gamma': 0.65
//       }, 'mosaic-'+param.year[y], false);
    
//     Map.addLayer(Clasificacion_TD, vis, 'original'+param.year[y]);
//     //Map.addLayer(Fifper, vis, 'Fifper'+param.year[y]);
//     Map.addLayer(Filperv2, vis, 'Filperv2-'+param.year[y]);
//     //Map.addLayer(filtered, vis, 'filtered'+param.year[y]);
// }

var visdeglac = {
    'palette': 'ffff00,ff0000',
    'min': 1985,
    'max': 2020,
    'format': 'PNG'
    };
// Map.addLayer(Deglaciacion, visdeglac, 'Deglaciacion', false);



var filtered = Filperv2
          .set('code_region', param.regionGlacier)
          .set('pais', param.pais)
          .set('version', param.version_output)
          .set('descripcion', 'filtro Permtemporal')
          .set('paso', 'P03')
          
print(filtered)

// EXPORTS 
  Export.image.toAsset({
      'image': filtered,
      'description': prefixo_out+param.version_output,
      'assetId': dirout+'/' +prefixo_out+param.version_output,
      'pyramidingPolicy': {
          '.default': 'mode'
      },
      'region': region.geometry().bounds(),
      'scale': 30,
      'maxPixels': 1e13
  });
  
  // Exportar a Google Drive
  if(param.exportOpcion.exportClasifToDrive){
    Export.image.toDrive({
      image: filtered.toInt8(),
      description: prefixo_out + 'DRIVE-'+param.version_output,
      folder: param.exportOpcion.DriveFolder,
      scale: 30,
      maxPixels: 1e13,
      region: region.geometry().bounds()
    });
  }
}
  