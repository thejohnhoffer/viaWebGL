/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* openSeadragonGL - Set Shaders in OpenSeaDragon with viaWebGL
*/
openSeadragonGL = function(openSD) {

    /* OpenSeaDragon API calls
    ~*~*~*~*~*~*~*~*~*~*~*~*/
    this.io = {
        'tile-loaded': function(e) {
            // Unpack png images to a tile's typed array
            var decoder = new Promise(function(resolve, reject) {
                // Decode the image array
                var img  = window.UPNG.decode(e.image._array);
                
                // Signal 16-bit png
                if (img.ctype == 0 && img.depth == 16) {

                  // Assign the 16-bit array to the tile
                  img.data = img.data.slice(0, 2 * img.width * img.height)
                  e.tile._array = img.data;
                }
                resolve();
            });
           
            // Notify openseadragon when decoded 
            decoder.then(e.getCompletionCallback())
        },
        'tile-drawing': function(e) {
            // Get shape of tile
            var w = e.rendered.canvas.width;
            var h = e.rendered.canvas.height;

            // Render a webGL canvas to an input canvas
            var output = this.viaGL.loadArray(w, h,
                                              e.tile._array);
            e.rendered.drawImage(output, 0, 0);
        }
    };
    this.defaults = {
        'tile-loaded': function(callback, e) {
            callback(e);
        },
        'tile-drawing': function(callback, e) {
            if (e.tile.loaded !==1) {
                e.tile.loaded = 1;
                callback(e);
            }
        }
    };
    this.openSD = openSD;
    this.viaGL = new ViaWebGL();
};

openSeadragonGL.prototype = {
    // Map to viaWebGL and openSeadragon
    init: function() {
        var open = this.merger.bind(this);
        this.openSD.addHandler('open',open);
        return this;
    },
    // User adds events
    addHandler: function(key,custom) {
        if (key in this.defaults){
            this[key] = this.defaults[key];
        }
        if (typeof custom == 'function') {
            this[key] = custom;
        }
    },
    // Merge with viaGL
    merger: function(e) {
        // Take GL height and width from OpenSeaDragon
        this.width = this.openSD.source.getTileWidth();
        this.height = this.openSD.source.getTileHeight();
        // Add all viaWebGL properties
        for (var key of this.and(this.viaGL)) {
            this.viaGL[key] = this[key];
        }
        this.viaGL.init().then(this.adder.bind(this));
    },
    // Add all seadragon properties
    adder: function() {
        var THIS = this;

        // Add all openSeadragon event handlers
        this.openSD.addHandler('tile-loaded', function(e) {
            var io = THIS.io['tile-loaded'].bind(THIS);
            THIS['tile-loaded'].call(THIS, io, e);
        });
        this.openSD.addHandler('tile-drawing', function(e) {
            var io = THIS.io['tile-drawing'].bind(THIS);
            THIS['tile-drawing'].call(THIS, io, e);
        });

        // Indicate all tiles need draw
        var world = this.openSD.world;
        for (var i = 0; i < world.getItemCount(); i++) {
          var tiled_image = world.getItemAt(i);
          tiled_image._needsDraw = true;
        }
        this.openSD.world.update();
    },
    // Joint keys
    and: function(obj) {
      return Object.keys(obj).filter(Object.hasOwnProperty,this);
    },
    // Add your own button to OSD controls
    button: function(terms) {

        var name = terms.name || 'tool';
        var prefix = terms.prefix || this.openSD.prefixUrl;
        if (!terms.hasOwnProperty('onClick')){
            terms.onClick = this.shade;
        }
        terms.onClick = terms.onClick.bind(this);
        terms.srcRest = terms.srcRest || prefix+name+'_rest.png';
        terms.srcHover = terms.srcHover || prefix+name+'_hover.png';
        terms.srcDown = terms.srcDown || prefix+name+'_pressed.png';
        terms.srcGroup = terms.srcGroup || prefix+name+'_grouphover.png';
        // Replace the current controls with the same controls plus a new button
        this.openSD.clearControls().buttons.buttons.push(new OpenSeadragon.Button(terms));
        var toolbar = new OpenSeadragon.ButtonGroup({buttons: this.openSD.buttons.buttons});
        this.openSD.addControl(toolbar.element,{anchor: OpenSeadragon.ControlAnchor.TOP_LEFT});
    },
    // Switch Shaders on or off
    shade: function() {

        this.viaGL.on++;
        this.openSD.world.resetItems();
    }
}
