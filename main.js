var J = J || {};
//-----------------------------------
//
// J.Start - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Start = function (lo,hi) {


    // Open a dragon with two layers
    var portal = OpenSeadragon(lo);
    // Give the settings for webGL
    var via = new viaWebGL(hi);

    // After Loading each tile
    var onLoad = function(e) {

        if (e.tiledImage.source.layer ==1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(hi.alpha);
            // Change the image via webGL
            via.passImage(e);
        }
    }
    // Before Drawing each tile
    var onDraw = function(e) {

        if (e.tiledImage.source.layer ==1 && e.tile.shaded !== 1) {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(hi.alpha);
            // Change the context via webGL
            via.passCanvas(e);
            e.tile.shaded = 1;
        }
    }

//    portal.addHandler('tile-loaded',onLoad);
    portal.addHandler('tile-drawing',onDraw);

};

J.Lay = function(tile_set) {

    // put a section in the DOM
    var div = document.createElement('div');
    var idiv = {className:tile_set.class, id: tile_set.id};
    document.body.appendChild(Object.assign(div,idiv));

    // Create tileSources
    return [tile_set,tile_set].map(this.tileSet);
};

J.Lay.prototype.tileSet = function(settings,i) {

    // Give each layer its own name
    ts = Object.assign({layer: i},settings);
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

    // Basic tilesource
    var set_tile = {
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
        mip : 1
    }

    // Update the tilesources with input
    var tile_set = getInput(set_tile);
    var tile_sources = new J.Lay(tile_set);


    // All the terms for openSeaDragon
    var seaStart = {
            prefixUrl :             "lib/images/",
            crossOriginPolicy : 'Anonymous',
            timeout :               120000,
            showNavigationControl : true,
            navigatorSizeRatio :    0.25,
            minZoomImageRatio :     0.5,
            maxZoomPixelRatio :     10,
            tileSources : tile_sources,
            id : tile_set.id,
            shaded : 0
    }

    // All the terms for viaWebGL
    var viaStart = {
            alpha: 0.6,
            canvas : tile_set.canvas,
            context_keys : {preserveDrawingBuffer:true},
            shape : [0,0,tile_set.width, tile_set.height],
            sizes : {width: tile_set.tileSize, height: tile_set.tileSize},
            shaders : ['shaders/former.glsl','shaders/latter.glsl'],
            offscreen: document.createElement('canvas')
    }

    new J.Start(seaStart,viaStart);
};