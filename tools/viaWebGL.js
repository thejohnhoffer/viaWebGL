/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* viaWebGL
/* Set shaders on Image or Canvas with WebGL
/* Built on 2016-9-9
/* http://via.hoff.in
*/
ViaWebGL = function(incoming) {

    /* Custom WebGL API calls
    ~*~*~*~*~*~*~*~*~*~*~*~*/
    this['gl-drawing'] = function(e) { return e; };
    this['gl-loaded'] = function(e) { return e; };
    this.ready = function(e) { return e; };

    var gl = this.maker();
    this.flat = document.createElement('canvas').getContext('2d');
    this.tile_size = 'u_tile_size';
    this.vShader = 'vShader.glsl';
    this.fShader = 'fShader.glsl';
    this.wrap = gl.CLAMP_TO_EDGE;
    this.tile_pos = 'a_tile_pos';
    this.filter = gl.NEAREST;
    this.pos = 'a_pos';
    this.height = 128;
    this.width = 128;
    this.on = 0;
    this.gl = gl;
    // Assign from incoming terms
    for (var key in incoming) {
        this[key] = incoming[key];
    }
};

ViaWebGL.prototype = {

    init: function(source) {
        var ready = this.ready;
        // Allow for mouse actions on click
        if (this.hasOwnProperty('container') && this.hasOwnProperty('onclick')) {
            this.container.onclick = this[this.onclick].bind(this);
        }
        if (source && source.height && source.width) {
            this.ready = this.toCanvas.bind(this,source);
            this.height = source.height;
            this.width = source.width;
        }
        this.source = source;
        this.updateShape(this.height, this.width);

        // Load the shaders when ready and return the promise
        var step = [[this.vShader, this.fShader].map(this.getter)];
        step.push(this.toProgram.bind(this), this.toBuffers.bind(this));
        return Promise.all(step[0]).then(step[1]).then(step[2]).then(this.ready);

    },

    updateShape: function(width, height) {

        this.width = width;
        this.height = height;
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
        this.gl.viewport(0, 0, this.width, this.height);
    },

    // Make a canvas
    maker: function(options){
        return this.context(document.createElement('canvas'));
    },
    context: function(a){
        return a.getContext('experimental-webgl') || a.getContext('webgl');
    },
    // Get a file as a promise
    getter: function(where) {
        return new Promise(function(done){
            // Return if not a valid filename
            if (where.slice(-4) != 'glsl') {
                return done(where);
            }
            var bid = new XMLHttpRequest();
            var win = function(){
                if (bid.status == 200) {
                    return done(bid.response);
                }
                return done(where);
            };
            bid.open('GET', where, true);
            bid.onerror = bid.onload = win;
            bid.send();
        });
    },
    // Link shaders from strings
    toProgram: function(files) {
        var gl = this.gl;
        var program = gl.createProgram();
        var ok = function(kind,status,value,sh) {
            if (!gl['get'+kind+'Parameter'](value, gl[status+'_STATUS'])){
                console.log((sh||'LINK')+':\n'+gl['get'+kind+'InfoLog'](value));
            }
            return value;
        }
        // 1st is vertex; 2nd is fragment
        files.map(function(given,i) {
            var sh = ['VERTEX_SHADER', 'FRAGMENT_SHADER'][i];
            var shader = gl.createShader(gl[sh]);
            gl.shaderSource(shader, given);
            gl.compileShader(shader);
            gl.attachShader(program, shader);
            ok('Shader','COMPILE',shader,sh);
        });
        gl.linkProgram(program);
        return ok('Program','LINK',program);
    },
    // Load data to the buffers
    toBuffers: function(program) {

        // Allow for custom loading
        this.gl.useProgram(program);
        this['gl-loaded'].call(this, program);

        // Align viewport with image texture
        var image_corners = [0, 1, 0, 0, 1, 1, 1, 0];
        var full_corners = [-1, 1, -1, -1, 1, 1, 1, -1];
        var buffer = new Float32Array(full_corners.concat(image_corners));

        // Simple constants
        var gl = this.gl;
        var point_size = 2;
        var vertex_count = 4;
        var bytes = buffer.BYTES_PER_ELEMENT;
        var point_bytes = point_size * bytes;

        // Get uniform term
        var tile_size = gl.getUniformLocation(program, this.tile_size);
        gl.uniform2f(tile_size, gl.canvas.height, gl.canvas.width);

        // Get attribute terms
        this.att = [this.pos, this.tile_pos].map(function(name, index) {

            var vertex = gl.getAttribLocation(program, name);
            var offset = index * vertex_count * point_bytes;

            return [vertex, point_size, gl.FLOAT, 0, point_bytes, offset];
        });

        // Get texture
        this.tex = {
            texParameteri: [
                [gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrap],
                [gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrap],
                [gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter],
                [gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter]
            ],
            bindTexture: [gl.TEXTURE_2D, gl.createTexture()],
            drawArrays: [gl.TRIANGLE_STRIP, 0, vertex_count],
            pixelStorei: [gl.UNPACK_FLIP_Y_WEBGL, 1]
        };

        // Build the position and texture buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
    },
    // Turns array into a rendered canvas
    loadArray: function(width, height, pixels) {

        // Update shape for image or canvas
        this.updateShape(width, height);

        // Allow for custom drawing in webGL
        this['gl-drawing'].call(this);
        var gl = this.gl;

        // Set Attributes for GLSL
        this.att.map(function(x){

            gl.enableVertexAttribArray(x.slice(0,1));
            gl.vertexAttribPointer.apply(gl, x);
        });

        // Set Texture for GLSL
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture.apply(gl, this.tex.bindTexture);
        gl.pixelStorei.apply(gl, this.tex.pixelStorei);

        // Apply texture parameters
        this.tex.texParameteri.map(function(x){
            gl.texParameteri.apply(gl, x);
        });
        // Send the tile into the texture.
        var output = [gl.TEXTURE_2D, 0, gl.R16UI,
                      this.width, this.height, 0,
                      gl.RED_INTEGER, gl.UNSIGNED_SHORT,
                      pixels];
        gl.texImage2D.apply(gl, output);

        // Draw everything needed to canvas
        gl.drawArrays.apply(gl, this.tex.drawArrays);

        // Apply to container if needed
        if (this.container) {
            this.container.appendChild(this.gl.canvas);
        }
        return this.gl.canvas;
    },
    toggle: function() {
        this.on ++;
        this.container.innerHTML = '';
        this.container.appendChild(this.toCanvas(this.source));

    }
}
