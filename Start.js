//-----------------------------------
//
// J.Start - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Start = function(e) {
    // Terms to Lay the lower layer
    var laid = new this.Lay({
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
    var ts = laid.tileSources;

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
            id : laid.id
        },
        // top: Upper layer with webgl or canvas
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
    laid.Start(...layout);
}

//-----------------------------------
//
// Lay - Create an Overlay and Tilesource
//
//-----------------------------------
J.Start.prototype.Lay = function(preterms) {

    // Change the inputs if passed as url terms
    var ts = {};
    ts.show = new J.Show();
    var terms = this.fixTerms( preterms, decodeURI(document.location.search.substring(1)) );
    Object.keys(preterms).forEach((term) => ts[term] = terms[term] || preterms[term]);
    ts.maxLevel = Math.min(ts.mip, Math.ceil(Math.log2(ts.width/ts.tileSize)));

    // put a section in the DOM
    this.id = 'seer_' + preterms.z;
    idiv = document.createElement('div');
    Object.assign(idiv,{className:'seer', id: this.id});
    document.body.appendChild(idiv);
    this.tileSources = ts;
};

J.Start.prototype.Lay.prototype.Start = function (sea,top) {

    // Make a image downloading call for the seadragon tilesource
    sea.tileSources.getTileUrl = this.getTile.bind(sea.tileSources);
    // Cover the Seadragon with colors
    var low = new OpenSeadragon(sea);

    // Allow webGL offscreen tick function to be joined to canvas by a joiner
    var offscreen = Object.assign(document.createElement('canvas'), top.sizes);
    var tick = sea.tileSources.show.Tick.bind(sea.tileSources.show);
    offscreen.width = 512;
    offscreen.height = 512;
    offscreen.style.width = 512;
    offscreen.style.height = 512;
    // Join the webgl offscreen to the seadragon canvas
    sea.tileSources.show.joiner = new J.Join(low, top, tick, offscreen);
    // Run WebGL joined to the seadragon canvas
    sea.tileSources.show.GL(top,offscreen);

};


J.Start.prototype.Lay.prototype.getTile = function( level, x, y ) {

    x *= this.tileSize;
    y *= this.tileSize;
    var halves = Math.pow(1/2, level);
    var mip = this.maxLevel - level;

    var source = "http://" + this.server + "/data/?datapath=" + this.datapath + "&start=" +
                 x + "," + y + "," + this.z + "&mip=" + mip + "&size=" + this.tileSize +
                 "," + this.tileSize + ","+this.depth;

    Timing(source+"&segmentation=y&segcolor=y",'arraybuffer').then(ab => {
        // Make high layer
        this.show.ok = 0;
        this.show.setTile(new Uint8Array(ab),x,y,halves);
    });

    return source;
};

J.Start.prototype.Lay.prototype.fixTerms = function( before, after ) {

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