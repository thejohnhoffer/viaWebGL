
// Set up the rendering of WebGL
SeaDragonGL = function(incoming) {

    /*~*~*~*~*~*~*~*~*~*~*~*~*~
    ~ OpenSeaDragon API calls ~
    */
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
    }
}