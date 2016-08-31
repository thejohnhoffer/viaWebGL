
// Set up the rendering of WebGL
SeaDragonGL = function(incoming) {

    this.terms = {GL:[], SD:[]};
    this.viaGL = new ViaWebGL(incoming);

    /*~*~*~*~*~*~*~*~*~*~*~*~*~
    ~ OpenSeaDragon API calls ~
    */

    this.interface = {
        'tile-loaded': function(e) {

            // Set the imageSource as a data URL
            e.image.src = this.viaGL.toCanvas(e.image).toDataURL();
            // allow for the callback to happen
            e.image.onload = e.getCompletionCallback;
        }.bind(this),

        'tile-drawing': function(e) {

            var input = e.rendered.canvas;
            // Get a webGL canvas from the input canvas
            var output = this.viaGL.toCanvas(input);
            // Render that canvas to the input context
            e.rendered.drawImage(output, 0, 0, input.width, input.height);
        }.bind(this)
    };

    /*~*~*~*~*~*~*~*~*~*~*~*~*/

    this.terms.SD.push('tile-loaded','tile-drawing');
    this.terms.GL.push('gl-loaded','gl-drawing','wrap','filter','tileSize');
    this.terms.GL.push('width','height','vShader','fShader','pos','tile_pos');
};

SeaDragonGL.prototype = {

    init: function(openSD) {

        // Transfer terms to the viaWebGL machine and the openSeadragon
        this.openSD = openSD;
        this.tileSize = this.tileSize || 512;
        ['GL','SD'].map(this.send.bind(this));

        // Go via webGL
        this.viaGL.init();
    },

    // Send terms from this to target
    send: function(term, order) {

        var action = order ? this.seaTerm: this.glTerm;
        var these = this.terms[term].filter(this.hasOwnProperty,this);
        these.map(action.bind(this));
    },

    seaTerm: function(key) {
        var custom = this[key];
        var interface = this.interface[key];
        this.openSD.addHandler(key, function(e) {
            custom.call(this, interface, e);
        });
    },

    glTerm: function(key) {
        this.viaGL[key] = this[key];
    }
}