
// Set up the rendering of WebGL
SeaDragonGL = function(top) {

    this.handlers = {};
    this.viaGL = new ViaWebGL(top);
    this['gl-loaded'] = this['gl-drawing'] = function(e) {
        return e;
    };
};

SeaDragonGL.prototype = {

    // Allow for custom function to load webGL
    get 'gl-loaded' () {
        seaGL = this;
        // Use this from viaWebGL
        return function(program) {
            for (var key in seaGL.handlers) {
                seaGL.openSD.addHandler(key, seaGL.handlers[key]);
            }
            seaGL.loader.call(this, program);
        }
    },

    set 'gl-loaded' (fun) {
        this.loader = fun;
    },

    set 'loaded' (fun) {
        this.event('tile-loaded',fun);
    },

    set 'drawing' (fun) {
        this.event('tile-drawing',fun);
    },

    init: function(openSD) {

        // Give certain properties to viaWebGL
        this.openSD = openSD;
        this.viaGL['gl-loaded'] = this['gl-loaded'];
        this.viaGL['gl-drawing'] = this['gl-drawing'];
        var input = ['wrap','filter','vShader','fShader','pos','tile_pos','width','height','size'];
        for (var key of input.filter(this.hasOwnProperty,this)) {
            this.viaGL[key] = this[key];
        }

        // Start the machine
        this.viaGL.init();
    },

    /* * * * * * * * * * * *
      OpenSeaDragon API calls
    */

    event: function(event,custom) {

        var callback = this[event].bind(this);
        this.handlers[event] = function(e) {
            custom(e, callback);
        }
    },

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
}