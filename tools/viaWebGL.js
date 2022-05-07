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

    // Define vertex input buffer
    this.one_point_size = 2 * Float32Array.BYTES_PER_ELEMENT;
    this.points_list_size = 4 * this.one_point_size;
    this.points_buffer = new Float32Array([
        0, 1, 0, 0, 1, 1, 1, 0
    ]);

    // Make texture and gl context
    this.gl = document.createElement('canvas').getContext('webgl2');
    this.texture = this.gl.createTexture();
    this.buffer = this.gl.createBuffer();

    // Intialize useless defaults
    this.vShader = 'vShader.glsl';
    this.fShader = 'fShader.glsl';
    this.height = 0;
    this.width = 0;

    // Assign from incoming terms
    for (var key in incoming) {
        this[key] = incoming[key];
    }
};

ViaWebGL.prototype = {

    init: function() {

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
        this.gl.viewport(0, 0, width, height);
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
            // Prevent cache of shaders
            bid.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
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

        // Get GLSL locations
        var u_tile = gl.getUniformLocation(program, 'u_tile');
        var a_uv = gl.getAttribLocation(program, 'a_uv');
        var u8 = gl.getUniformLocation(program, 'u8');

        // Assign uniform values
        gl.uniform1ui(u8, 255);
        gl.uniform1i(u_tile, 0);

        // Assign vertex inputs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.points_buffer, gl.STATIC_DRAW);

        // Enable vertex buffer
        gl.enableVertexAttribArray(a_uv);
        gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, 0, this.one_point_size,
                               0 * this.points_list_size)

        // Set Texture for GLSL
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture),
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        // Assign texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    },
    // Turns array into a rendered canvas
    loadArray: function(width, height, pixels, format='u16') {

        // Allow for custom drawing in webGL
        this['gl-drawing'].call(this);
        var gl = this.gl;

        // Send the tile into the texture.
        if (format == 'u16') {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8UI, width, height, 0,
                        gl.RG_INTEGER, gl.UNSIGNED_BYTE, pixels);
        }
        else if (format == 'u32') {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8UI, width, height, 0,
                        gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, pixels);
        }

        // Draw four points
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        return this.gl.canvas;
    }
}
