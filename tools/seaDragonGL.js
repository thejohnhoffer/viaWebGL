/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* SeaDragonGL - Set Shaders in OpenSeaDragon with viaWebGL
*/
SeaDragonGL = function(openSD) {

    /* OpenSeaDragon API calls
    ~*~*~*~*~*~*~*~*~*~*~*~*/
    this.interface = {
        'tile-loaded': function(e) {
            // Set the imageSource as a data URL and then complete
            e.image.src = this.viaGL.toCanvas(e.image).toDataURL();
            e.image.onload = e.getCompletionCallback;
        },
        'tile-drawing': function(e) {
            // Render a webGL canvas to an input canvas
            var input = e.rendered.canvas;
            e.rendered.drawImage(this.viaGL.toCanvas(input), 0, 0, input.width, input.height);
        }
    };
    this['tile-loaded'] = function(callback, e) {
        callback(e);
    };
    this['tile-drawing'] = function(callback, e) {
        if (e.tile.loaded !==1) {
            e.tile.loaded = 1;
            callback(e);
        }
    };
    this.openSD = openSD;
};

SeaDragonGL.prototype = {
    // Map to viaWebGL and openSeadragon
    init: function() {
        // Map both objects
        this.viaGL = new ViaWebGL();
        this.openSD.addHandler('open',this.merge.bind(this));
        return this;
    },
    // Merge viaGL and openSeadragon
    merge: function(e) {
        // Take GL height and width from OpenSeaDragon
        this.height = this.openSD.source.getTileHeight();
        this.width = this.openSD.source.getTileWidth();
        // Add all ViaWebGL properties shared by this seadragonGL
        for (var key of Object.keys(this.viaGL).filter(Object.hasOwnProperty,this)) {
            this.viaGL[key] = this[key];
        }
        this.viaGL.init();
    },
    // Set up OpenSeadragon events
    addHandler: function(key,custom) {
        if (['tile-loaded','tile-drawing'].indexOf(key) >= 0) {
            if (typeof custom == 'function') {
                this[key] = custom;
            }
            this.seadragonHandler(key);
        }
    },
    // Set up OpenSeadragon events
    seadragonHandler: function(key) {
        var handler = this[key];
        var interface = this.interface[key].bind(this);
        this.openSD.addHandler(key, function(e) {
            handler.call(this, interface, e);
        });
    },
    // Add your own button to OSD controls
    button: function(terms) {

        var name = terms.name || 'tool';
        var prefix = terms.prefix || '';
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
    buttons: {
        shade: function() {
            console.log('hi');
        }
    }
}