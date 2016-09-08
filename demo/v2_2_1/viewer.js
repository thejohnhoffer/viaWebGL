var DOJO = DOJO || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

DOJO.Viewer = function(terms) {

    // preset tile source
    this.base = new DOJO.Sourcer(terms);
}

DOJO.Viewer.prototype.init = function() {

    // Make the two layers
    var lowLayer = this.base.make({});
    var topLayer = this.base.make({
        segment: '&segmentation=y&segcolor=y',
        alpha: 0.6,
        layer: 1
    });

    // Open a seadragon with two layers
    var openSD = OpenSeadragon({
        tileSources: [lowLayer, topLayer],
        smoothTileEdgesMinZoom: Infinity,
        crossOriginPolicy: 'Anonymous',
        prefixUrl: '../images/icons/',
        id: 'viaWebGL'
    });

    // Make a link to webGL
    var seaGL = new openSeadragonGL(openSD);
    seaGL.vShader = '../shaders/vertex/square.glsl';
    seaGL.fShader = '../shaders/fragment/outline.glsl';

    var load = function(callback, e) {

        var source = e.tiledImage.source;
        if (source.layer == 1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(source.alpha);
            // via webGL
            callback(e);
        }
    }

    var draw = function(callback, e) {

        if (e.tile.loaded !==1) {
            load(callback, e);
            e.tile.loaded = 1;
        }
    }

//    seaGL.addHandler('tile-loaded',load);
    seaGL.addHandler('tile-drawing',draw);

    seaGL.init();
}
