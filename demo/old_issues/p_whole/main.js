
window.onload = function(e){

    // Make the two layers
    var sourcer = function(x) {
        return {
            tileSource: '../../images/babel/babel.dzi',
            x: x
        }
    }

    // Open a seadragon with two layers
    var openSD = OpenSeadragon({
        maxZoomPixelRatio: 10,
        tileSources: [sourcer(0),sourcer(.5)],
        prefixUrl: '../../images/icons/',
        id: 'viaWebGL'
    });

    openSD.addHandler('tile-loaded', function(e) {
        if (e.tiledImage.getBounds().x) {
            e.tiledImage.setOpacity(1);
        }
    });
}