var DOJO = DOJO || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

DOJO.Viewer = function(terms) {

}

DOJO.Viewer.prototype.init = function() {

    // Make the two layers
    var src = '../../images/pac/';

    // Open a seadragon with two layers
    var openSD = OpenSeadragon({
        tileSources: [
            {
                type: 'image',
                url:  src+'0.png',
                top: false
            },
            {
                type: 'image',
                url:  src+'1.png',
                top: true
            }
        ],
        crossOriginPolicy: 'Anonymous',
        prefixUrl: '../../images/icons/',
        id: 'viaWebGL'
    });

    openSD.addHandler('tile-drawing', function(e) {
        if (e.tiledImage.source.top) {
            e.tiledImage.setOpacity(.8);
        }
    });

}
