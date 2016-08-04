var J = J || {};
//-----------------------------------
//
// J.Start - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Start = function(e) {
    // Give default Values for both layers
    var layIn = [
        {
            server :   'localhost:2001',
            datapath : '/Volumes/NeuroData/mojo',
            height :   1024,
            width :    1024,
            tileSize : 512,
            minLevel : 0,
            depth :    1,
            z :        0,
            mip : 1
        },
        {
            endText : '&segmentation=y&segcolor=y'
        }
    ];
    var tile = this.Lay(...layIn);

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
    this.Start(...layOut);
}

J.Start.prototype.Start = function (lo,hi) {

    // After loading all tiles
    var onOpen = function(e) {
        e.eventSource.world.getItemAt(1).setOpacity(hi.alpha);
    }
    // Before drawing each tile
    var onDraw = function(e) {
          e.image.src = library.processImage(e.image);
          e.image.onload = e.getCompletionCallback;
    }
    // Open a dragon with two layers
    var portal = OpenSeadragon(lo);
    var handlers = [['open', onOpen],['tile-loaded',onDraw]];
    var handle = function(handler){
        portal.addHandler(...handler);
    }
    handlers.map(handle);

};

J.Start.prototype.Lay = function(lo,hi) {

    // Creat tileSources, changing the inputs if passed as url terms
    var ts = [lo,Object.assign({},lo,hi)].map(this.tileTerms);

    // put a section in the DOM
    var id = 'seer_' + ts[0].z;
    var idiv = {className:'seer', id: id};
    var div = document.createElement('div');
    document.body.appendChild(Object.assign(div,idiv));
    return {source: ts, id: id};
};

J.Start.prototype.tileTerms = function(preterms) {

    var getTile = function(tile) {
        // how to GET either tilesource
        return function( level, x, y ) {
            return "http://" + tile.server + "/data/?datapath=" + tile.datapath + "&start=" + x*tile.tileSize +
                "," + y*tile.tileSize + "," + tile.z + "&mip=" + (tile.maxLevel - level) + "&size=" +
                tile.tileSize + "," + tile.tileSize + ","+tile.depth + (tile.endText || '');
        };
    }

    // Change any preset terms set in input address
    var fixTerms = function( before, after ) {
        // read as bool, string, or int
        var read = function(ask) {
            if (!ask[1]) {
                return true;
            }
            // read as string if the preset is a string
            if (typeof before[ask[0]] === 'string') {
                var clean = new RegExp('\/$');
                return ask[1].replace(clean,'');
            }
            return parseInt(ask[1],10);
        }
        // Assign each term to a key
        var deal = function(obj, str) {
            var ask = str.split('=');
            obj[ask[0]] = read(ask);
            return obj;
        }
        // Deal the terms into a single object
        return after.split('&').reduce(deal,{});
    }

    var ts = fixTerms( preterms, decodeURI(document.location.search.substring(1)) );
    Object.keys(preterms).forEach(function(term){ts[term] = ts[term] || preterms[term]});

    // set the lower bounds on halvings and set the source for the tiles
    ts.maxLevel = Math.min(ts.mip, Math.ceil(Math.log2(ts.width/ts.tileSize)));
    ts.getTileUrl = getTile(ts);
    return ts;
};

window.onload = function(e){
    new J.Start(e);
};