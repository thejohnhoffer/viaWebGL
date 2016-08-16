
// Set up the rendering of WebGL
SeaDragonGL = function(top) {

    this.standard = function(e) {
        return e;
    }

    this.viaGL = new ViaWebGL(top);
    this.handlers = {};
};

SeaDragonGL.prototype.init = function(openSD) {

    var handlers = this.handlers;
    var onLoad = this.onLoad || this.standard;
    var onDraw = this.onDraw || this.standard;

    // Allow for custom function to load webGL
    this.viaGL.onLoad = function(gl,program) {

        for (var key in handlers) {
            openSD.addHandler(key, handlers[key]);
        }
        onLoad(gl,program);
    }
    // Allow for custom function to draw in webGL
    this.viaGL.onDraw = onDraw;
    // Start the machine
    this.viaGL.init();
};

/* * * * * * * * * * * *
  OpenSeaDragon API calls
*/

SeaDragonGL.prototype.event = function(event,custom) {

    var callback = this[event].bind(this);
    this.handlers[event] = function(e) {
        custom(e, callback);
    }
}

SeaDragonGL.prototype['tile-loaded'] = function(e) {

    // Set the imageSource as a data URL
    e.image.src = this.viaGL.getSource(e.image);
    // allow for the callback to happen
    e.image.onload = e.getCompletionCallback;
};

SeaDragonGL.prototype['tile-drawing'] = function(e) {

    // Get a webGL canvas from the input canvas
    var canv = this.viaGL.getCanvas(e.rendered.canvas);
    // Render that canvas to the input context
    e.rendered.drawImage(canv, 0,0);
};