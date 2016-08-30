
// Set up the rendering of WebGL
SeaDragonGL = function(incoming) {

    this.terms = {GL:[], SD:[]};
    this.viaGL = new ViaWebGL(incoming);

    /*~*~*~*~*~*~*~*~*~*~*~*~*~
    ~ OpenSeaDragon API calls ~
    */

    this.callbacks = {

        'tile-loaded': function(e) {

            // Set the imageSource as a data URL
            e.image.src = this.viaGL.getSource(e.image);
            // allow for the callback to happen
            e.image.onload = e.getCompletionCallback;
        },

        'tile-drawing': function(e) {

            // Get a webGL canvas from the input canvas
            var canv = this.viaGL.getCanvas(e.rendered.canvas);
            // Render that canvas to the input context
            e.rendered.drawImage(canv, 0,0);
        }
    };

    /*~*~*~*~*~*~*~*~*~*~*~*~*/

    this.terms.SD.push('tile-loaded','tile-drawing');
    this.terms.GL.push('gl-loaded','gl-drawing','wrap','filter','tileSize');
    this.terms.GL.push('width','height','vShader','fShader','pos','tile_pos');
};

SeaDragonGL.prototype = {

    init: function(openSD) {

        // Transfer terms to the viaWebGL machine and the openSeadragon
        this.tileSize = this.tileSize || 512;
        this.store(this.viaGL,'GL');
        this.store(openSD,'SD');

        // Go via webGL
        this.viaGL.init();
    },

    link: {
        SD: function(self,openSD,key) {
            openSD.addHandler(key, function(e) {
                self[key].call(this, self.callbacks[key].bind(self), e);
            });
        },
        GL: function(self,viaGL,key) {
            viaGL[key] = self[key];
        }
    },

    store: function(argument,term) {
        var filtered = this.terms[term].filter(this.hasOwnProperty,this);
        filtered.map(this.link[term].bind(0,this,argument));
    }
}