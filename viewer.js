var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function(baseLayer) {

    // preset tile source
    this.baseLayer = J.outclass(baseLayer, {
        getTileUrl : function( level, x, y ) {
            var width = this.getTileWidth(level);
            var height = this.getTileHeight(level);
            return 'http://' + this.server + '/data/?datapath=' + this.datapath + '&start=' +
                x*width + ',' + y*height + ',' + this.z + '&mip=' + (this.maxLevel - level) +
                '&size=' + width + ',' + height + ',' + this.depth + this.segment
        },
        datapath : '/Volumes/NeuroData/mojo',
        server :   'localhost:2001',
        tileSize : 512,
        height :   1024,
        width :    1024,
        minLevel : 0,
        depth :    1,
        z :        0,
        segment : '',
        alpha: 0.6,
        layer : 0,
        mip : 1
    });
}

J.Viewer.prototype.init = function() {

    // Write the terms of this onto one layer
    var lowLayer = J.outclass(this, this.baseLayer);

    // Add more needed openSeaDragon properties to each layer's tiles
    var max_max = Math.ceil(Math.log2(lowLayer.width/lowLayer.tileSize));
    lowLayer.maxLevel = Math.min(lowLayer.mip, max_max);

    // Write small changes onto the top layer
    var topLayer = J.outclass({layer: 1}, lowLayer);
    topLayer.segment = '&segmentation=y&segcolor=y';

    // Open a seaDragon with two layers
    var openSD = OpenSeadragon({
        tileSources: [lowLayer, topLayer],
        id: this.container || 'viaWebGL',
        crossOriginPolicy: 'Anonymous',
        showNavigationControl: true,
        navigatorSizeRatio: 0.25,
        prefixUrl: 'lib/images/',
        minZoomImageRatio: 0.5,
        maxZoomPixelRatio: 10,
        timeout: 120000,
        loaded: false
    });

    // Make a link to webGL
    var seaGL = new SeaDragonGL();
    seaGL.vShader = 'shaders/square.glsl';
    seaGL.fShader = 'shaders/border.glsl';

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

    var loud = function(e) {
        console.log(e);
    }

    seaGL['gl-drawing'] = loud;

    seaGL['tile-drawing'] = draw;

    seaGL.init(openSD);
}
