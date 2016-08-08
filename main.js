var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Viewer = function (set_tile) {

    // Update the tilesources with input
    var tile_set = getInput(set_tile);
    var tileSource = this.bfly.bind(tile_set);
    // put a section in the DOM for seadragon
    var div = document.createElement('div');
    var idiv = {className:tile_set.class, id: tile_set.id};
    document.body.appendChild(Object.assign(div,idiv));

    // Open a seaDragon with two layers
    this.portal = OpenSeadragon({
        tileSources : [0,1].map(tileSource),
        prefixUrl :         'lib/images/',
        crossOriginPolicy : 'Anonymous',
        timeout :               120000,
        showNavigationControl : true,
        navigatorSizeRatio :    0.25,
        minZoomImageRatio :     0.5,
        maxZoomPixelRatio :     10,
        id : tile_set.id,
        loaded : 0
    });

    // Give the settings for webGL
    this.via = new viaWebGL({
        vShader : 'shaders/former.glsl',
        fShader : 'shaders/latter.glsl',
        attributes : ['a_where','a_where_in_tile'],
        shape : [0,0,tile_set.width, tile_set.height],
        sizes : {width: tile_set.tileSize, height: tile_set.tileSize}
    });
    this.tile_set = tile_set;

};

J.Viewer.prototype.handle = function(i) {

    var via = this.via;
    var tile_set = this.tile_set;
    // After Loading each tile
    var onLoad = function(e) {

        if (e.tiledImage.source.layer ==1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(tile_set.alpha);
            // Change the image via webGL
            via.passImage(e);
        }
    }
    // Before Drawing each tile
    var onDraw = function(e) {

        if (e.tiledImage.source.layer ==1 && e.tile.loaded !== 1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(tile_set.alpha);
            // Change the context via webGL
            via.passCanvas(e);
            e.tile.loaded = 1;
        }
    }
//    this.portal.addHandler('tile-loaded',onLoad);
    this.portal.addHandler('tile-drawing',onDraw);
}

J.Viewer.prototype.bfly = function(i) {

    // Give each layer its own name
    ts = Object.assign({layer: i},this);
    // Set the lower bounds on halvings and set the source for the tiles
    ts.maxLevel = Math.min(ts.mip, Math.ceil(Math.log2(ts.width/ts.tileSize)));
    // Set how to ask the server for a tile
    ts.getTileUrl = function( level, x, y ) {
            return "http://" + ts.server + "/data/?datapath=" + ts.datapath + "&start=" + x*ts.tileSize +
                "," + y*ts.tileSize + "," + ts.z + "&mip=" + (ts.maxLevel - level) + "&size=" +
                ts.tileSize + "," + ts.tileSize + ","+ts.depth + ['','&segmentation=y&segcolor=y'][i];
    };
    return ts;
};

window.onload = function(e){

    // Tilesource
     var view = new J.Viewer({
        shaded : 0,
        class : 'seer',
        id : 'viaWebGL',
        server :   'localhost:2001',
        datapath : '/Volumes/NeuroData/mojo',
        height :   1024,
        width :    1024,
        tileSize : 512,
        minLevel : 0,
        depth :    1,
        z :        0,
        alpha: 0.6,
        mip : 1
    });
    view.handle();
};