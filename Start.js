//-----------------------------------
//
// J.Start - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Start = function(e) {
    // Terms to Lay the lower layer
    var ts = this.Lay({
        server :   'localhost:2001',
        datapath : '/Volumes/NeuroData/mojo',
        debug  :   false,
        height :   1024,
        width :    1024,
        depth :    1,
        z :        0,
        tileSize : 512,
        minLevel : 0,
        mip : 1
    });

    // Output of the Tilesource Layout
    var layout = [
        // sea: Lower layer in Seadragon
        {   prefixUrl :             "lib/images/",
            navigatorSizeRatio :    0.25,
            minZoomImageRatio :     0.5,
            maxZoomPixelRatio :     10,
            showNavigationControl : true,
            timeout :               120000,
            tileSources : ts,
            id : ts.id
        },
        // top: Upper layer with webgl
        {   alpha: 0.6,
            strip: true,
            debug : ts.debug,
            canvas : ts.canvas,
            shape : [0,0,ts.width,ts.height],
            context_keys : {preserveDrawingBuffer:true},
            sizes : {width: ts.tileSize, height: ts.tileSize},
            shaders : ['shaders/former.glsl','shaders/latter.glsl']
        }
    ];
    this.Start(...layout);
}

//-----------------------------------
//
// Lay - Create an Overlay and Tilesource
//
//-----------------------------------
J.Start.prototype.Lay = function(preterms) {

    var ts = {};
    // Change the inputs if passed as url terms
    var terms = this.fixTerms( preterms, decodeURI(document.location.search.substring(1)) );
    Object.keys(preterms).forEach((term) => ts[term] = terms[term] || preterms[term]);
    ts.maxLevel = Math.min(ts.mip, Math.ceil(Math.log2(ts.width/ts.tileSize)));

    // put a section in the DOM
    ts.id = 'seer_' + preterms.z;
    idiv = document.createElement('div');
    Object.assign(idiv,{className:'seer', id: ts.id});
    document.body.appendChild(idiv);
    return ts;
};

J.Start.prototype.Start = function (sea,top) {

    // Make a image downloading call for the seadragon tilesource
    sea.tileSources.getTileUrl = this.getTile(sea.tileSources);
    // Cover the Seadragon with colors
    var portal = new OpenSeadragon(sea);

    // Allow webGL offscreen tick function to be joined to canvas by a joiner
    var offscreen = Object.assign(document.createElement('canvas'), top.sizes);
};


J.Start.prototype.getTile = function(tile) {

    // makes image url for either tilesource
    return function( level, x, y ) {

        x *= tile.tileSize;
        y *= tile.tileSize;
        level = tile.maxLevel - level;

        return "http://" + tile.server + "/data/?datapath=" + tile.datapath + "&start=" +
                     x + "," + y + "," + tile.z + "&mip=" + level + "&size=" + tile.tileSize +
                     "," + tile.tileSize + ","+tile.depth;
    };

}

J.Start.prototype.fixTerms = function( before, after ) {

    // return a string if preset is string and int if preset is int
    var clean = text => text ? text.replace(new RegExp('\/$'),'') : true;
    var read = ask => typeof before[ask[0]] === 'string' ? clean(ask[1]) : parseInt(ask[1],10);
    // Check whether the asking string has answer or has only a true/false flag
    var check = (obj, ask) => obj[ask[0]] = ask.length > 1 ? read(ask) : true;
    var deal = (obj, str) => { check(obj,str.split('=')); return obj;}
    // Deal the array into a single object
    return after.split('&').reduce(deal,{});
};

window.onload = (e) => new J.Start(e);