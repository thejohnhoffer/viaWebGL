var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function(baseLayer) {

    // preset tile source
    this.baseLayer = J.copy({
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
    }, baseLayer);
}

J.Viewer.prototype.init = function() {

    var lowLayer = {};
    for (var key in this.baseLayer){
        // Use any values from this if applicable to layers
        lowLayer[key] = this[key] || this.baseLayer[key];
    }

    // Add more needed openSeaDragon properties to each layer's tiles
    var max_max = Math.ceil(Math.log2(lowLayer.width/lowLayer.tileSize));
    lowLayer.maxLevel = Math.min(lowLayer.mip, max_max);

    // Copy slight changes for top Layer
    var topLayer = J.copy(lowLayer, {layer: 1});
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
    seaGL.vShader = this.vShader;
    seaGL.fShader = this.fShader;

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