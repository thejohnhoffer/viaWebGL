var SCOPE = {};
//-----------------------------------
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------
window.onload = function(e){

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
        maxZoomPixelRatio: 10,
        prefixUrl: '../../images/icons/',
        id: 'viaWebGL'
    });

    openSD.addHandler('tile-loaded', function(e) {
      console.log(e.tiledImage.source)
        if (e.tiledImage.source.top) {
            e.tiledImage.setOpacity(.5);
        }
    });
};