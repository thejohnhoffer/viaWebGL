
// Set up the rendering of WebGL
ViaWebGL = function(incoming) {

    /*~*~*~*~*~*~*~*~*~*~*~*~*~
    ~ Canvas and GL API calls ~
    */

    var empty = function(e) { return e; };
    this['gl-loaded'] = this['gl-drawing'] = empty;

    // Turns image or canvas into a rendered canvas
    this['toCanvas'] = function(tile) {

        // render the tile
        this.drawer(tile);
        // return the canvas
        return this.gl.canvas;
    };

    /*~*~*~*~*~*~*~*~*~*~*~*~*/

    this.vShader = 'vShader.glsl';
    this.fShader = 'fShader.glsl';
    // Assign from incoming terms
    for (var key in incoming) {
        this[key] = incoming[key];
    }

};

// Set up hidden canvas and get shaders
ViaWebGL.prototype.init = function() {

    var hidden = document.createElement('canvas');
    hidden.width = this.width || this.tileSize || 512;
    hidden.height = this.height || this.tileSize || 512;
    var gl = hidden.getContext('experimental-webgl');
    this.gl = gl || hidden.getContext('webgl');

    // Load the shaders when ready and return the promise
    var promised = [this.vShader, this.fShader].map(this.getter);
    Promise.all(promised).then(this.run('shader')).then(this.run('loader'));
}

// Once loaded, Link shaders to ViaWebGL
ViaWebGL.prototype.loader = function(program) {

    // Allow for custom loading
    this.gl.useProgram(program);
    this['gl-loaded'].call(this, program);

    // input terms
    var count = 4;
    var gl = this.gl;
    var pos = this.pos || 'a_pos';
    var filter = this.filter || gl.NEAREST;
    var wrap = this.wrap || gl.CLAMP_TO_EDGE;
    var tile_pos = this.tile_pos || 'a_tile_pos';
    var uniform = this.tile_pos || 'u_tile_size';

    // Unchangeable square array buffer fills viewport with texture
    var boxes = [[-1, 1,-1,-1, 1, 1, 1,-1], [0, 1, 0, 0, 1, 1, 1, 0]];
    var buffer = new Float32Array([].concat.apply([], boxes));
    var bytes = buffer.BYTES_PER_ELEMENT;

    // Get uniform term
    uniform = gl.getUniformLocation(program, uniform);
    gl.uniform2f(uniform, gl.canvas.height, gl.canvas.width);

    // Get attribute terms
    this.att = [pos, tile_pos].map(function(name, number) {

        var index = Math.min(number, boxes.length-1);
        var vec = Math.floor(boxes[index].length/count);
        var vertex = gl.getAttribLocation(program, name);

        return [vertex, vec, gl.FLOAT, 0, vec*bytes, count*index*vec*bytes];
    });

    // Get texture
    this.tex = {
        texParameteri: [
            [gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap],
            [gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap],
            [gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter],
            [gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter]
        ],
        texImage2D: [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        bindTexture: [gl.TEXTURE_2D, gl.createTexture()],
        drawArrays: [gl.TRIANGLE_STRIP, 0, count],
        pixelStorei: [gl.UNPACK_FLIP_Y_WEBGL, 1]
    };

    // Essential position buffer code for ViaWebGL
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
};

// The webgl animation
ViaWebGL.prototype.drawer = function(tile) {

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
};

// Bind a method strongly to this object
ViaWebGL.prototype.run = function(method){
    return this[method].bind(this);
}

// Promise to get a file then be done
ViaWebGL.prototype.getter = function(where) {
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
}

// Make one vertex shader and one fragment shader
ViaWebGL.prototype.shader = function(files) {

    var gl = this.gl;
    var program = gl.createProgram();
    var err = function(kind,status,value,sh) {
        if (!gl['get'+kind+'Parameter'](value, gl[status+'_STATUS'])){
            console.log((sh||'LINK')+':\n'+gl['get'+kind+'InfoLog'](value));
        }
        return value;
    }
    files.map(function(given,i) {
        // Make first file shade vertex and second shade fragments
        var sh = ['VERTEX_SHADER', 'FRAGMENT_SHADER'][i];
        var shader = gl.createShader(gl[sh]);
        gl.shaderSource(shader, given);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        err('Shader','COMPILE',shader,sh);
    });
    gl.linkProgram(program);
    return err('Program','LINK',program);
};