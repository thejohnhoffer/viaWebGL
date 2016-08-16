
// Set up the rendering of WebGL
ViaWebGL = function(top) {

    this.standard = function(e) {
        return e;
    }
    this.onLoad = this.standard;
    this.onDraw = this.standard;

    var hide = document.createElement('canvas');
    hide.height = hide.width = top.size;

    // Actually get the context and set the shaders
    this.gl = hide.getContext('webgl') || hide.getContext('experimental-webgl');
    this.promiseShaders = [top.vShader, top.fShader].map(this.getter);
    this.attributes = ['a_pos', 'a_tile_pos'];
};

ViaWebGL.prototype.init = function() {

    var gl = this.gl;
    // WebGL Shorthand
    var k = {
        array: new Float32Array([-1, 1, 0, 1,
                                 -1,-1, 0, 0,
                                  1, 1, 1, 1,
                                  1,-1, 1, 0]),
        format: [0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        drawArrays: [gl.TRIANGLE_STRIP, 0, 4],
        wrap: this.wrap || gl.CLAMP_TO_EDGE,
        filter: this.filter || gl.NEAREST,
        ab: gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D
    };

    k.stride = k.array.BYTES_PER_ELEMENT;
    k.bufferData = [k.ab, k.array, gl.STATIC_DRAW];

    k.wrap_T = [k.tex, gl.TEXTURE_WRAP_T, k.wrap];
    k.wrap_S = [k.tex, gl.TEXTURE_WRAP_S, k.wrap];
    k.fill_mag = [k.tex, gl.TEXTURE_MAG_FILTER, k.filter];
    k.fill_min = [k.tex, gl.TEXTURE_MIN_FILTER, k.filter];

    // fixed texture terms
    this.texture = {
        drawArrays: k.drawArrays,
        texImage2D: [k.tex].concat(k.format),
        bindTexture: [k.tex, gl.createTexture()],
        pixelStorei: [gl.UNPACK_FLIP_Y_WEBGL, 1],
        texParameteri: [k.fill_min, k.fill_mag, k.wrap_S, k.wrap_T]
    };

    // Once loaded, Link shaders to ViaWebGL
    var ready = function(k,shaders) {

        var program = this.shader(shaders,gl);
        // Find glsl locations of attributes
        var join = gl.getAttribLocation.bind(gl,program);
        this.attributes = this.attributes.map(function(a,i) {
            return [join(a), 2, gl.FLOAT, false, k.stride*4, k.stride*2*i];
        });

        // Allow for custom loading in webGL
        this.onLoad.call(this, gl, program);

        // Essential position buffer for ViaWebGL
        gl.bindBuffer(k.ab, gl.createBuffer());
        gl.bufferData.apply(gl, k.bufferData);
        gl.useProgram(program);
    };
    // Load the shaders when ready and return the promise
    return Promise.all(this.promiseShaders).then(ready.bind(this,k));
}

// The webgl animation
ViaWebGL.prototype.drawer = function(tile) {

    var gl = this.gl;
    var tex = this.texture;

    // Set Attributes for GLSL
    this.attributes.forEach(function(which){

        gl.enableVertexAttribArray(which.slice(0,1));
        gl.vertexAttribPointer.apply(gl, which);
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

    // Allow for custom drawing in webGL
    this.onDraw.call(this, gl, tile);

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
ViaWebGL.prototype.shader = function(files, gl) {

    var shaderWork = gl.createProgram();
    files.map(function(given,i) {
        // Make first file shade vertex and second shade fragments
        var kinds = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
        var shader = gl.createShader(kinds[i]);
        gl.shaderSource(shader, given);
        gl.compileShader(shader);
        gl.attachShader(shaderWork, shader);
        // Shoot out any compiling errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log(gl.getShaderInfoLog(shader));
        }
    });
    gl.linkProgram(shaderWork);
    // Shoot out any linking errors
    if (!gl.getProgramParameter(shaderWork, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(shaderWork));
    }
    return shaderWork;
};