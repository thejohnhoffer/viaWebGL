var J = J || {};
//-----------------------------------
//
// J.Start - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Start = function(e) {
}

J.Start.prototype.Start = function (lo,hi) {


    var via = new J.viaWebGL(hi);
    // After loading all tiles
    var onOpen = function(e) {
        e.eventSource.world.getItemAt(1).setOpacity(hi.alpha);
    }

    // After Loading each tile
    var onLoad = function(e) {
        if (e.tiledImage.source.layer ==1) {
            // Change the image via webGL
            via.passImage(e);
        }
    }
    // Before Drawing each tile
    var onDraw = function(e) {
        if (e.tiledImage.source.layer ==1 && e.tile.shaded !== 1) {
            // Change the context via webGL
            via.passCanvas(e);
            e.tile.shaded = 1;
        }
    }

    // Open a dragon with two layers
    var portal = OpenSeadragon(lo);
    var handlers = [['open', onOpen],['tile-loaded',onLoad]];
//    var handlers = [['open', onOpen],['tile-drawing',onDraw]];
    var handle = function(handler){
        portal.addHandler(...handler);
    }
    handlers.map(handle);

};

J.Start.prototype.Lay = function(sea_set) {

//    var tiles =
    // Creat tileSources, changing the inputs if passed as url terms
    var ts = [sea_set,sea_set].map(this.tileSet);

    // put a section in the DOM
    var id = 'seer_' + ts[0].z;
    var idiv = {className:'seer', id: id};
    var div = document.createElement('div');
    document.body.appendChild(Object.assign(div,idiv));
    return {source: ts, id: id};
};

J.Start.prototype.tileSet = function(settings,i) {

    ts = Object.assign({layer: i},settings);

    // set the lower bounds on halvings and set the source for the tiles
    ts.maxLevel = Math.min(ts.mip, Math.ceil(Math.log2(ts.width/ts.tileSize)));

    ts.getTileUrl = function( level, x, y ) {
            return "http://" + ts.server + "/data/?datapath=" + ts.datapath + "&start=" + x*ts.tileSize +
                "," + y*ts.tileSize + "," + ts.z + "&mip=" + (ts.maxLevel - level) + "&size=" +
                ts.tileSize + "," + ts.tileSize + ","+ts.depth + ['','&segmentation=y&segcolor=y'][i];
    };
    return ts;
};

window.onload = function(e){

    self = new J.Start();
    // Give default tilesource
    var sea_settings = {
        shaded : 0,
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

    var tile = self.Lay(getInput(sea_settings));

    // Output of the Tilesource Layout
    var layOut = [
        // lo: Lower layer in Seadragon
        {   prefixUrl :             "lib/images/",
            crossOriginPolicy : 'Anonymous',
            timeout :               120000,
            showNavigationControl : true,
            navigatorSizeRatio :    0.25,
            minZoomImageRatio :     0.5,
            maxZoomPixelRatio :     10,
            tileSources : tile.source,
            id : tile.id
        },
        // hi: webgl
        {   alpha: 0.6,
            strip: true,
            debug : tile.source[0].debug,
            canvas : tile.source[0].canvas,
            context_keys : {preserveDrawingBuffer:true},
            shape : [0,0,tile.source[0].width, tile.source[0].height],
            sizes : {width: tile.source[0].tileSize, height: tile.source[0].tileSize},
            shaders : ['shaders/former.glsl','shaders/latter.glsl'],
            offscreen: document.createElement('canvas')
        }
    ];
    self.Start(...layOut);
};