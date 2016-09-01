
// Set up the rendering of WebGL
SeaDragonGL = function(incoming) {

    /*~*~*~*~*~*~*~*~*~*~*~*~*~
    ~ OpenSeaDragon API calls ~
    */

    this.interface = {
        'tile-loaded': function(e) {

            // Set the imageSource as a data URL
            e.image.src = this.viaGL.toCanvas(e.image).toDataURL();
            // allow for the callback to happen
            e.image.onload = e.getCompletionCallback;
        },

        'tile-drawing': function(e) {

            var input = e.rendered.canvas;
            // Get a webGL canvas from the input canvas
            var output = this.viaGL.toCanvas(input);
            // Render that canvas to the input context
            e.rendered.drawImage(output, 0, 0, input.width, input.height);
        }
    };

    // Defaults
    this.tileSize = 512;
    // Assign from incoming terms
    for (var key in incoming) {
        this[key] = incoming[key];
    }
};

SeaDragonGL.prototype = {
    // Map to viaWebGL and openSeadragon
    init: function(openSD) {

        this.openSD = openSD;
        this.viaGL = new ViaWebGL();

        var GL = ['wrap','filter','tileSize','width','height','pos','tile_pos'];
        GL.push('gl-loaded','gl-drawing','vShader','fShader');
        var SD = ['tile-loaded','tile-drawing'];

        for (var key in this) {
            if (SD.indexOf(key) > 0) {
                this.seadragonHandler(key);
            }
            if (GL.indexOf(key) > 0) {
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