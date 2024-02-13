/**
 * 
 * @param {*} image 
 * @param {*} endmembers 
 */
exports.getFractions = function (image) {
  
    var endmembers= [
        [119.0, 475.0, 169.0, 6250.0, 2399.0, 675.0], /*gv*/
        [1514.0, 1597.0, 1421.0, 3053.0, 7707.0, 1975.0], /*npv*/
        [1799.0, 2479.0, 3158.0, 5437.0, 7707.0, 6646.0], /*soil*/
        [4031.0, 8714.0, 7900.0, 8989.0, 7002.0, 6607.0], /*cloud*/
        [9599.1, 9648.5, 9942.6, 9041.6, 519.8, 527.2] /*snow*/
         ]

    var outBandNames = ['gv', 'npv', 'soil', 'cloud','snow'];

    var fractions = ee.Image(image)
        .select(['blue_median_dry', 'green_median_dry', 'red_median_dry', 'nir_median_dry', 'swir1_median_dry', 'swir2_median_dry'])
        .unmix(endmembers)
        .max(0)
        .multiply(100)
        .byte();

    fractions = fractions.rename(outBandNames);

    var summed = fractions.expression('b("gv") + b("npv") + b("soil") + b("snow")');

    var shade = summed
                  .subtract(100)
                  .abs()
                  .byte()
                  .rename("shade");

    image = image.addBands(fractions);
    image = image.addBands(shade);

    return image;
};


exports.getFractions2 = function (image) {
  
    var endmembers= [
        [119.0, 475.0, 169.0, 6250.0, 2399.0, 675.0], /*gv*/
        [1514.0, 1597.0, 1421.0, 3053.0, 7707.0, 1975.0], /*npv*/
        [1799.0, 2479.0, 3158.0, 5437.0, 7707.0, 6646.0], /*soil*/
        [4031.0, 8714.0, 7900.0, 8989.0, 7002.0, 6607.0], /*cloud*/
        [16022.00,8704.08,9149.50,7926.17,924.93,644.73], /*snow accum*/ 
        [5718.66,4310.91,4328.19,3910.82,459.15,339.55] /*snow abla*/
         ]

    var outBandNames = ['gv', 'npv', 'soil', 'cloud','snow','snow2'];

    var fractions = ee.Image(image)
        .select(['blue_median_dry', 'green_median_dry', 'red_median_dry', 'nir_median_dry', 'swir1_median_dry', 'swir2_median_dry'])
        .unmix(endmembers)
        .max(0)
        .multiply(100)
        .byte();

    fractions = fractions.rename(outBandNames);

    var summed = fractions.expression('b("gv") + b("npv") + b("soil") + b("snow")+ b("snow2")');

    var shade = summed
                  .subtract(100)
                  .abs()
                  .byte()
                  .rename("shade");

    image = image.addBands(fractions);
    image = image.addBands(shade);

    return image;
};
