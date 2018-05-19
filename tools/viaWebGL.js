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

    var gl = this.maker();
    this.vertex_count = 4;
    this.texture = gl.createTexture();
    this.vShader = 'vShader.glsl';
    this.fShader = 'fShader.glsl';
    this.wrap = gl.CLAMP_TO_EDGE;
    this.filter = gl.NEAREST;
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
        this.source = source;
        this.width = source.width;
        this.height = source.height;
        this.updateShape(this.height, this.width);

        // Load the shaders when ready and return the promise
        var step = [[this.vShader, this.fShader].map(this.getter)];
        step.push(this.toProgram.bind(this), this.toBuffers.bind(this));
        return Promise.all(step[0]).then(step[1]).then(step[2]);

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
        return a.getContext('webgl2');
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
        var gl = this.gl;
        gl.useProgram(program);
        this['gl-loaded'].call(this, program);

        // Align viewport with image texture
        var full_corners = [-1, 1, -1, -1, 1, 1, 1, -1];
        var buffer = new Float32Array(full_corners);

        // Simple constants
        var point_size = 2;
        var bytes = buffer.BYTES_PER_ELEMENT;
        var point_bytes = point_size * bytes;

        // Get uniform locations
        var tile_size = gl.getUniformLocation(program, 'u_tile_size');
        var tile_sampler = gl.getUniformLocation(program, 'u_tile');
        var u8 = gl.getUniformLocation(program, 'u8');

        // Assign uniform values
        gl.uniform2f(tile_size, gl.canvas.height, gl.canvas.width);
        gl.uniform1i(tile_sampler, 0);
        gl.uniform1ui(u8, 255);

        // Assign attributes
        var pos = gl.getAttribLocation(program, 'a_pos');
        var offset = 0 * this.vertex_count * point_bytes;

        this.position_attributes = [pos, point_size, gl.FLOAT,
                                    0, point_bytes, offset];

        // Get texture
        this.texture_parameters = [
            [gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrap],
            [gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrap],
            [gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter],
            [gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter]
        ];

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
        var pos = this.position_attributes
        gl.enableVertexAttribArray(pos[0]);
        gl.vertexAttribPointer.apply(gl, pos);

        // Set Texture for GLSL
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture),
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        // Apply texture parameters
        gl.texParameteri.apply(gl, this.texture_parameters);

        // Send the tile into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8UI,
                      this.width, this.height, 0,
                      gl.RG_INTEGER, gl.UNSIGNED_BYTE,
                      pixels);

        // Draw everything needed to canvas
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertex_count);

        return this.gl.canvas;
    }
}
