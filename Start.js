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
            debug  :   false,
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
    var ts = this.Lay(...layIn);

    // Output of the Tilesource Layout
    var layout = [
        // lo: Lower layer in Seadragon
        {   prefixUrl :             "lib/images/",
            navigatorSizeRatio :    0.25,
            minZoomImageRatio :     0.5,
            maxZoomPixelRatio :     10,
            showNavigationControl : true,
            timeout :               120000,
            tileSources : ts,
            id : ts[0].id
        },
        // hi: webgl
        {   alpha: 0.6,
            strip: true,
            context_keys : {preserveDrawingBuffer:true},
            shaders : ['shaders/former.glsl','shaders/latter.glsl']
        }
    ];
    this.Start(...layout);
}

J.Start.prototype.Start = function (lo,hi) {

    // Begin the magic
    var begin = function(e) {
        e.eventSource.world.getItemAt(1).setOpacity(hi.alpha);
    }
    // Cover the Seadragon with colors
    var portal = OpenSeadragon(lo);
    portal.addHandler('open', begin);

};

J.Start.prototype.Lay = function(lo,hi) {

    // Creat tileSources, changing the inputs if passed as url terms
    var ts = [lo,Object.assign({},lo,hi)].map(this.tileTerms);

    // put a section in the DOM
    ts[0].id = 'seer_' + ts[0].z;
    idiv = document.createElement('div');
    Object.assign(idiv,{className:'seer', id: ts[0].id});
    document.body.appendChild(idiv);
    return ts;
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

    var fixTerms = function( before, after ) {
        // remove any trailing backslash
        var clean = new RegExp('\/$');
        var read = function(ask) {
            var isString = typeof before[ask[0]] === 'string';
            if (isString) return ask[1].replace(clean,'');
            return parseInt(ask[1],10);
        }
        // See if it isn't a true/false flag
        var assign = function (obj, ask) {
            obj[ask[0]] = true;
            if (ask[1]) obj[ask[0]] = read(ask);
            return obj;
        }
        // Assign each term to a key
        var deal = function(obj, str){
            return assign(obj,str.split('='));
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

window.onload = function(e){new J.Start(e)};