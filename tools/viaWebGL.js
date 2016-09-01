
// Set up the rendering of WebGL
ViaWebGL = function(incoming) {

    /* Canvas and GL API calls
    ~*~*~*~*~*~*~*~*~*~*~*~*/
    this['gl-drawing'] = function(e) { return e; };
    this['gl-loaded'] = function(e) { return e; };

    // Turns image or canvas into a rendered canvas
    this['toCanvas'] = function(tile) {

        this.drawer(tile);
        return this.gl.canvas;
    };
    var gl = this.makeContext();
    this.tile_size = 'u_tile_size';
    this.vShader = 'vShader.glsl';
    this.fShader = 'fShader.glsl';
    this.wrap = gl.CLAMP_TO_EDGE;
    this.tile_pos = 'a_tile_pos';
    this.filter = gl.NEAREST;
    this.tileSize = 512;
    this.pos = 'a_pos';
    // Assign from incoming terms
    for (var key in incoming) {
        this[key] = incoming[key];
    }
};

ViaWebGL.prototype = {
    // Load the shaders
    init: function() {

        this.gl = this.makeContext({
            width: this.width || this.tileSize,
            height: this.height || this.tileSize
        });
        // Load the shaders when ready and return the promise
        var goals = [this.vShader, this.fShader].map(this.getter);
        var goal = [this.shader.bind(this), this.loader.bind(this)];
        Promise.all(goals).then(goal[0]).then(goal[1]);
        return this;
    },
    // Link the shaders
    loader: function(program) {

        // Allow for custom loading
        this.gl.useProgram(program);
        this['gl-loaded'].call(this, program);

        // Unchangeable square array buffer fills viewport with texture
        var boxes = [[-1, 1,-1,-1, 1, 1, 1,-1], [0, 1, 0, 0, 1, 1, 1, 0]];
        var buffer = new Float32Array([].concat.apply([], boxes));
        var bytes = buffer.BYTES_PER_ELEMENT;
        var gl = this.gl;
        var count = 4;

        // Get uniform term
        this.tile_size = gl.getUniformLocation(program, this.tile_size);
        gl.uniform2f(this.tile_size, gl.canvas.height, gl.canvas.width);

        // Get attribute terms
        this.att = [this.pos, this.tile_pos].map(function(name, number) {

            var index = Math.min(number, boxes.length-1);
            var vec = Math.floor(boxes[index].length/count);
            var vertex = gl.getAttribLocation(program, name);

            return [vertex, vec, gl.FLOAT, 0, vec*bytes, count*index*vec*bytes];
        });
        // Get texture
        this.tex = {
            texParameteri: [
                [gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrap],
                [gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrap],
                [gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter],
                [gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter]
            ],
            texImage2D: [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
            bindTexture: [gl.TEXTURE_2D, gl.createTexture()],
            drawArrays: [gl.TRIANGLE_STRIP, 0, count],
            pixelStorei: [gl.UNPACK_FLIP_Y_WEBGL, 1]
        };
        // Build the position and texture buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
    },
    // The webgl draw call
    drawer: function(tile) {

        // Allow for custom drawing in webGL
        this['gl-drawing'].call(this,tile);
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
        var output = this.tex.texImage2D.concat([tile]);
        gl.texImage2D.apply(gl, output);

        // Draw everything needed to canvas
        gl.drawArrays.apply(gl, this.tex.drawArrays);
    },
    // Promise to get a file then be done
    getter: function(where) {
        return new Promise(function(done){
            var bid = new XMLHttpRequest();
            var win = function(){
                if (bid.status == 200) {
                    return done(bid.response);
                }
                console.log("A bug on the web");
            };
            bid.open('GET', where, true);
            bid.onerror = bid.onload = win;
            bid.send();
        });
    },
    // Make two shaders from data
    shader: function(files) {

        var gl = this.gl;
        var program = gl.createProgram();
        var err = function(kind,status,value,sh) {
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
            err('Shader','COMPILE',shader,sh);
        });
        gl.linkProgram(program);
        return err('Program','LINK',program);
    },
    // Return a gl rendering context
    makeContext: function(options){
        var a = document.createElement('canvas');
        for (key in options) {
            a[key] = options[key];
        }
        return a.getContext('experimental-webgl') || a.getContext('webgl');
    }
}