/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* openSeadragonGL - Set Shaders in OpenSeaDragon with viaWebGL
*/
openSeadragonGL = function(openSD) {

    /* OpenSeaDragon API calls
    ~*~*~*~*~*~*~*~*~*~*~*~*/
    this.io = {
        'tile-loaded': function(e) {
            // Set the imageSource as a data URL and then complete
            var output = this.viaGL.toCanvas(e.image);
            e.image.onload = e.getCompletionCallback();
            e.image.src = output.toDataURL();
        },
        'tile-drawing': function(e) {
            // Get input and output to tile
            var input = e.rendered.__input;
            var output = e.rendered.canvas;

            // Store original canvas
            if (input === undefined) {

                var input = document.createElement('canvas');
                input.width = output.width;
                input.height = output.height;

                // Copy original to rendered input
                var input_context = input.getContext('2d');
                input_context.drawImage(output, 0, 0);
                e.rendered.__input = input;
            }

            // Render a webGL canvas to an input canvas
            var output = this.viaGL.toCanvas(input);
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
    adder: function(e) {
        for (var key of this.and(this.defaults)) {
            var handler = this[key].bind(this);
            var io = this.io[key].bind(this);
            // Add all openSeadragon event handlers
            this.openSD.addHandler(key, function(e) {
                handler.call(this, io, e);
            });
        }

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
