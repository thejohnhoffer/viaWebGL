var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function(parsed) {

    // preset tile source
    var lowLayer = J.copy({
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
        shaded : 0,
        size : 512,
        layer : 0,
        mip : 1
    },parsed);
    // Add more needed openSeaDragon properties to each layer's tiles
    var max_max = Math.ceil(Math.log2(lowLayer.width/lowLayer.size));
    lowLayer.maxLevel = Math.min(lowLayer.mip, max_max);
    lowLayer.tileSize = lowLayer.size;

    var topLayer = J.copy({},lowLayer);
    this.layers = [lowLayer, topLayer];
    this.layers[1].segment = '&segmentation=y&segcolor=y';
    this.layers[1].layer ++;
}

J.Viewer.prototype.init = function() {

    // Make a link to webGL
    var via = new ViaWebGL({
        vShader : 'shaders/former.glsl',
        fShader : 'shaders/latter.glsl',
        size : this.layers[0].tileSize
    });
    via.init();

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

    var event = 'tile-loaded';
//    var event = 'tile-drawing';
    open.addHandler(event,{
        'tile-loaded': function(e) {

            if (e.tiledImage.source.layer == 1) {
                // Make the entire top tile transparent
                e.tiledImage.setOpacity(e.tiledImage.source.alpha);
                // Change the image via webGL
                via.viaLoad(e);
            }
        },
        'tile-drawing': function(e) {

            if (e.tiledImage.source.layer == 1 && e.tile.loaded !==1) {
                // Make the entire top tile transparent
                e.tiledImage.setOpacity(e.tiledImage.source.alpha);
                // Change the context via webGL
                via.viaDraw(e);
                e.tile.loaded = 1;
            }
        }
    }[event]);
}