var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function(name) {

    // Put a seadragon into the body
    this.div = {id: name};
    var div = document.createElement('div');
    document.body.appendChild(Object.assign(div,this.div));
    // Give all the tile sources their own unique values
    this.eachTile = [
        {
            segment : '',
            layer : 0
        },
        {
            segment : '&segmentation=y&segcolor=y',
            layer : 1
        }
    ];
    // preset defaults
    this.tile = {
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
        alpha: 0.6,
        shaded : 0,
        size : 512,
        mip : 1
    };
};

J.Viewer.prototype.start = function() {

    // Open a seaDragon with two layers
    var open = OpenSeadragon({
        tileSources :           this.tiler(),
        prefixUrl :             'lib/images/',
        crossOriginPolicy :     'Anonymous',
        timeout :               120000,
        showNavigationControl : true,
        navigatorSizeRatio :    0.25,
        minZoomImageRatio :     0.5,
        maxZoomPixelRatio :     10,
        id : this.div.id,
        loaded : false
    });

    // Make a link to webGL
    var via = new viaWebGL({
        vShader : 'shaders/former.glsl',
        fShader : 'shaders/latter.glsl',
        attributes : ['a_where','a_where_in_tile'],
        sizes : {width: this.tile.tileSize, height: this.tile.tileSize},
        shape : [0,0,this.tile.width, this.tile.height]
    });

    // Bind the event handlers
    this.handle(open,via);
}

J.Viewer.prototype.handle = function(open,via) {

    // After Loading each tile
    var onLoad = function(e) {

        if (e.tiledImage.source.layer == 1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(e.tiledImage.source.alpha);
            // Change the image via webGL
            via.passImage(e);
        }
    }
    // Before Drawing each tile
    var onDraw = function(e) {

        if (e.tiledImage.source.layer == 1 && e.tile.loaded !==1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(e.tiledImage.source.alpha);
            // Change the context via webGL
            via.passCanvas(e);
            e.tile.loaded = 1;
        }
    }
//    open.addHandler('tile-loaded',onLoad);
    open.addHandler('tile-drawing',onDraw);
}

J.Viewer.prototype.tiler = function() {

    // Apply general presets to each tile
    for (var n in this.eachTile) {
        Object.assign(this.eachTile[n], this.tile);
    }
    return this.eachTile;
};
