var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function(baseLayer) {

    // preset tile source
    J.copy(baseLayer, {
        getTileUrl : function( level, x, y ) {
            return 'http://' + this.server + '/data/?datapath=' + this.datapath + '&start=' +
                x*this.size + ',' + y*this.size + ',' + this.z + '&mip=' + (this.maxLevel - level) +
                '&size=' + this.size + ',' + this.size + ',' + this.depth + this.segment
        },
        datapath : '/Volumes/NeuroData/mojo',
        server :   'localhost:2001',
        height :   1024,
        width :    1024,
        minLevel : 0,
        depth :    1,
        z :        0,
        segment : '',
        alpha: 0.6,
        size : 512,
        layer : 0,
        mip : 1
    });
    // Add more needed openSeaDragon properties to each layer's tiles
    var max_max = Math.ceil(Math.log2(baseLayer.width/baseLayer.size));
    baseLayer.maxLevel = Math.min(baseLayer.mip, max_max);
    baseLayer.tileSize = baseLayer.size;

    // More for top Layer
    var topLayer = J.copy({layer: 1}, baseLayer);
    topLayer.segment = '&segmentation=y&segcolor=y';
    this.layers = [baseLayer, topLayer];
}

J.Viewer.prototype.init = function() {

    // Make a link to webGL
    var via = new ViaWebGL({
        vShader : 'shaders/former.glsl',
        fShader : 'shaders/latter.glsl',
        size : this.layers[0].tileSize
    });

    // Open a seaDragon with two layers
    var open = OpenSeadragon({
        tileSources :           this.layers,
        prefixUrl :             'lib/images/',
        crossOriginPolicy :     'Anonymous',
        timeout :               120000,
        showNavigationControl : true,
        navigatorSizeRatio :    0.25,
        minZoomImageRatio :     0.5,
        maxZoomPixelRatio :     10,
        id : 'viaWebGL',
        loaded : false
    });

    var load = function(e,callback) {

        var source = e.tiledImage.source;
        if (source.layer == 1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(source.alpha);
            // via webGL
            callback(e);
        }
    }

    var draw = function(e,callback) {

        if (e.tile.loaded !==1) {
            load(e,callback);
            e.tile.loaded = 1;
        }
    }

    via.init();
    var drawing = via.event('tile-drawing', draw);
    var loaded = via.event('tile-loaded', load);
    open.addHandler.apply(open,drawing);
}