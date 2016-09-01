/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* SeaDragonGL - Set Shaders in OpenSeaDragon with viaWebGL
*/
SeaDragonGL = function(incoming) {

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
    // Assign from incoming terms
    for (var key in incoming) {
        this[key] = incoming[key];
    }
};

SeaDragonGL.prototype = {
    // Map to viaWebGL and openSeadragon
    init: function(openSD) {
        // Map both objects
        this.openSD = openSD;
        this.viaGL = new ViaWebGL();
        this.openSD.addHandler('open',this.merge.bind(this));
        return this;
    },
    // Merge viaGL and openSeadragon
    merge: function(e) {
        // Take GL height and width from OpenSeaDragon
        this.height = this.openSD.source.getTileHeight();
        this.width = this.openSD.source.getTileWidth();

        for (var key in this) {
            if (['tile-loaded','tile-drawing'].indexOf(key) > 0) {
                this.seadragonHandler(key);
            }
            if (Object.keys(this.viaGL).indexOf(key) > 0) {
                this.viaGL[key] = this[key];
            }
        }
        this.viaGL.init();
    },
    // Set up OpenSeadragon events
    seadragonHandler: function(key) {
        var custom = this[key];
        var interface = this.interface[key].bind(this);
        this.openSD.addHandler(key, function(e) {
            custom.call(this, interface, e);
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