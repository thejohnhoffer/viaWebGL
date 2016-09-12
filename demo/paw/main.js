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
                url:  src+'0.jpg'
            },
            {
                type: 'image',
                url:  src+'1.jpg'
            }
        ],
        maxZoomPixelRatio: 10,
        prefixUrl: '../../images/icons/',
        id: 'viaWebGL'
    });
};