
// Set up the rendering of WebGL
SeaDragonGL = function(top) {

    this.handlers = {};
    this.viaGL = new ViaWebGL(top);
};

SeaDragonGL.prototype = {

    init: function(openSD) {

        for (var key in this.handlers) {
            openSD.addHandler(key, this.handlers[key]);
        }
        // Transfer terms to the viaWebGL machine
        var terms = ['gl-loaded','gl-drawer','width','height','size'];
        terms = terms.concat('wrap','filter','vShader','fShader','pos','tile_pos');
        for (var key of terms.filter(this.hasOwnProperty,this)) {
            this.viaGL[key] = this[key];
        }
        // Start the machine
        this.viaGL.init();
    },

    load: function(openSD) {
        for (var key in this.handlers) {
            openSD.addHandler(key, this.handlers[key]);
        }
        return this['gl-loaded'];
    },

    draw: function(openSD) {

        return this['gl-drawing'];
    },

    /* * * * * * * * * * * *
      OpenSeaDragon API calls
    */

    set 'tile-loaded' (fun) {
        this.event('loaded',fun);
    },

    set 'tile-drawing' (fun) {
        this.event('drawing',fun);
    },

    event: function(event,custom) {

        var callback = this[event].bind(this);
        this.handlers['tile-'+event] = function(e) {
            custom(e, callback);
        }
    },

    loaded: function(e) {

        // Set the imageSource as a data URL
        e.image.src = this.viaGL.getSource(e.image);
        // allow for the callback to happen
        e.image.onload = e.getCompletionCallback;
    },

    drawing: function(e) {

        // Get a webGL canvas from the input canvas
        var canv = this.viaGL.getCanvas(e.rendered.canvas);
        // Render that canvas to the input context
        e.rendered.drawImage(canv, 0,0);
    }
}