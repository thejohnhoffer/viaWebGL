
// Set up the rendering of WebGL
SeaDragonGL = function(top) {

    this.handlers = {};
    this.viaGL = new ViaWebGL(top);
};

SeaDragonGL.prototype = {

    init: function(openSD) {

        var fun = ['tile-loaded','tile-drawing'];
        for (var key of fun.filter(this.hasOwnProperty,this)) {
            openSD.addHandler(key, this.event(key));
        }

        // Transfer terms to the viaWebGL machine
        var terms = ['gl-loaded','gl-drawing','wrap','filter','width','height'];
        terms = terms.concat('size','vShader','fShader','pos','tile_pos');
        for (var key of terms.filter(this.hasOwnProperty,this)) {
            this.viaGL[key] = this[key];
        }
        // Start the machine
        this.viaGL.init();
    },

    /* * * * * * * * * * * *
      OpenSeaDragon API calls
    */

    event: function(key) {

        var custom = this[key];
        var callback = this[key+'-callback'].bind(this);
        return function(e) {
            custom.call(this, callback, e);
        }
    },

    'tile-loaded-callback': function(e) {

        // Set the imageSource as a data URL
        e.image.src = this.viaGL.getSource(e.image);
        // allow for the callback to happen
        e.image.onload = e.getCompletionCallback;
    },

    'tile-drawing-callback': function(e) {

        // Get a webGL canvas from the input canvas
        var canv = this.viaGL.getCanvas(e.rendered.canvas);
        // Render that canvas to the input context
        e.rendered.drawImage(canv, 0,0);
    }
}