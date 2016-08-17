
// Set up the rendering of WebGL
ViaWebGL = function(incoming) {

    this['gl-loaded'] = this['gl-drawing'] = function(e) {
        return e;
    }
    this.vShader = 'vShader.glsl';
    this.fShader = 'fShader.glsl';
    // Assign from the top
    for (var key in incoming) {
        this[key] = incoming[key];
    }
};

ViaWebGL.prototype.init = function() {

    var hidden = document.createElement('canvas');
    hidden.width = this.width || this.tileSize || 512;
    hidden.height = this.height || this.tileSize || 512;
    var gl = hidden.getContext('experimental-webgl');
    this.gl = gl || hidden.getContext('webgl');

    // Load the shaders when ready and return the promise
    var promised = [this.vShader, this.fShader].map(this.getter);
    Promise.all(promised).then(this.is('shader')).then(this.is('loader'));
}

// Once loaded, Link shaders to ViaWebGL
ViaWebGL.prototype.loader = function(program) {

    // Allow for custom loading
    this['gl-loaded'].call(this, program);

    // input terms
    var count = 4;
    var gl = this.gl;
    var pos = this.pos || 'a_pos';
    var filter = this.filter || gl.NEAREST;
    var wrap = this.wrap || gl.CLAMP_TO_EDGE;
    var tile_pos = this.tile_pos || 'a_tile_pos';

    // fixed terms exclusively for position attributes
    var boxes = [[-1, 1,-1,-1, 1, 1, 1,-1], [0, 1, 0, 0, 1, 1, 1, 0]];
    var buffer = new Float32Array([].concat.apply([], boxes));
    var bytes = buffer.BYTES_PER_ELEMENT;

    // Find shader attribute locations in the position buffer
    this.att = [pos, tile_pos].map(function(a,i) {

        var index = Math.min(i,boxes.length-1);
        var vertex = gl.getAttribLocation(program,a);
        var vec = Math.floor(boxes[index].length/count);

        return [vertex, vec, gl.FLOAT, false, vec*bytes, count*index*vec*bytes];
    });

    // fixed texture terms
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
    gl.useProgram(program);
};

// The webgl animation
ViaWebGL.prototype.drawer = function(tile) {

    // Allow for custom drawing in webGL
    this['gl-drawing'].call(this,tile);

    var gl = this.gl;
    var att = this.att;
    var tex = this.tex;

    // Set Attributes for GLSL
    att.map(function(x){

        gl.enableVertexAttribArray(x.slice(0,1));
        gl.vertexAttribPointer.apply(gl, x);
    });

    // Set Texture for GLSL
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture.apply(gl, tex.bindTexture);
    gl.pixelStorei.apply(gl, tex.pixelStorei);

    // Apply texture parameters
    tex.texParameteri.map(function(x){
        gl.texParameteri.apply(gl, x);
    });
    // Send the tile into the texture.
    var output = tex.texImage2D.concat([tile]);
    gl.texImage2D.apply(gl, output);

    // Draw everything needed to canvas
    gl.drawArrays.apply(gl, tex.drawArrays);
};

/* * * * * * * * * * * *
  Start of the API calls
*/

// Turns image or canvas into a rendered canvas
ViaWebGL.prototype.getCanvas = function(tile) {

    // render the tile
    this.drawer(tile);
    // return the canvas
    return this.gl.canvas;
};

// Turns image or canvas into a rendered source
ViaWebGL.prototype.getSource = function(image) {

    // Render the image into a data source
    return this.getCanvas(image).toDataURL();
};

/*
* End of the API calls
* * * * * * * * * * */

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

// Bind a method strongly to this object
ViaWebGL.prototype.is = function(method){
    return this[method].bind(this);
}