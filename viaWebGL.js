
// Begins the rendering of WebGL
viaWebGL = function(top) {

    // Update the default with any matching incoming context attribute
    var basic = { context_keys: {preserveDrawingBuffer:true} };
    top.context_keys = top.context_keys || basic.context_keys;
    // Define the webGL context
    var context = function(s){
        var hide = Object.assign(document.createElement('canvas'), top.sizes);
        return hide.getContext(s,top.context_keys);
    }
    // Actually get the context and set the shaders
    var gl = context('webgl') || context('experimental-webgl');
    var shaders = [top.vShader, top.fShader].map(this.Getting);

    // WebGL Shorthand
    var k = {
        box: new Float32Array(Array.from('00100111').map(Number)),
        png : [0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        float: [2, gl.FLOAT, false, 0, 0],
        method: [gl.TRIANGLE_STRIP, 0, 4],
        wrap : gl.CLAMP_TO_EDGE,
        filter : gl.NEAREST,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D
    };
    k.background = [k.ab, k.box, gl.STATIC_DRAW];
    k.wrap_T = [k.tex, gl.TEXTURE_WRAP_T, k.wrap];
    k.wrap_S = [k.tex, gl.TEXTURE_WRAP_S, k.wrap];
    k.fill_mag = [k.tex, gl.TEXTURE_MAG_FILTER, k.filter];
    k.fill_min = [k.tex, gl.TEXTURE_MIN_FILTER, k.filter];

    // Set the attributes
    this.attributes = top.attributes.map(function(n){
        return {name : n};
    });

    // Make the textures
    this.textures = [0].map(function(n){
        return {
            kind: k.float,
            source: [k.tex, ...k.png],
            buffer: [k.tex, gl.createTexture()],
            pixMode: [gl.UNPACK_FLIP_Y_WEBGL, 1],
            params: [k.fill_min, k.fill_mag, k.wrap_S, k.wrap_T]
        };
    });

    // Once loaded, Link shaders to viaWebGL
    var ready = function(k,shaders) {

        var link = this.Shading(shaders,gl);

        // Find glsl locations of attributes
        for (var which of this.attributes) {
          which.id = gl.getAttribLocation(link,which.name);
          which.kind = which.kind || k.float;
        }
        // Essential position buffer for the viaWebGLing
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(...k.background);
        gl.useProgram(link);
    };

    Promise.all(shaders).then(ready.bind(this,k));

    // save the context and the core drawing method
    this.method = k.method;
    this.gl = gl;
};

// Promise to get a file
viaWebGL.prototype.Getting = function(where) {
    return new Promise(function(done){
        var bid = new XMLHttpRequest();
        var win = function(){
            if (bid.status == 200) {
                done(bid.response);
                return 0;
            }
            console.log("A bug on the web");
        };
        bid.open('GET', where, true);
        bid.onerror = win;
        bid.onload = win;
        bid.send();
    });
}

// Make one vertex shader and one fragment shader
viaWebGL.prototype.Shading = function(files, gl) {

    var kinds = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
    var shaderWork = gl.createProgram();
    files.map(function(given,index) {

        var kind = kinds[index];
        var shader = gl.createShader(kind);
        gl.shaderSource(shader, given);
        gl.compileShader(shader);
        gl.attachShader(shaderWork, shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            // Shoot out any compiling errors
            console.log(gl.getShaderInfoLog(shader));
        }
    });
    gl.linkProgram(shaderWork);

    if (!gl.getProgramParameter(shaderWork, gl.LINK_STATUS)) {
        // Shoot out any linking errors
        console.log(gl.getProgramInfoLog(shaderWork));
        console.log("Could not start shaders");
    }
    return shaderWork;
};

// The webgl animation
viaWebGL.prototype.TickTock = function(image) {

    var gl = this.gl;

    // Set Attributes for GLSL
    this.attributes.forEach(function(which){

        var ok = [which.id, ...which.kind];
        gl.vertexAttribPointer(...ok);
        gl.enableVertexAttribArray(which.id);
    });

    // Set Textures for GLSL
    this.textures.forEach(function(which) {

        gl.bindTexture(...which.buffer);
        gl.pixelStorei(...which.pixMode);

        // Apply texture parameters
        which.params.map(function(x){
            gl.texParameteri(...x);
        });
        // Send the image into the texture.
        gl.texImage2D(...[...which.source,image]);
    });

    // Draw everything needed to canvas
    gl.drawArrays(...this.method);
};

/* * * * * * * * * * * *
  Start of the API calls
*/

// Takes in an image or canvas and gives back a canvas
viaWebGL.prototype.getCanvas = function(tile) {

    // render the tile
    this.TickTock(tile);
    // return the canvas
    return this.gl.canvas;
};

// Takes in an image and gives back a rendered source
viaWebGL.prototype.getSource = function(image) {

    // Render the image into a data source
    return this.getCanvas(image).toDataURL();
};

viaWebGL.prototype.passImage = function(e) {

    // Set the imageSource as a data URL
    e.image.src = this.getSource(e.image);
    // allow for the callback to happen
    e.image.onload = e.getCompletionCallback;
};

viaWebGL.prototype.passCanvas = function(e) {

    // Get a webGL canvas from the input canvas
    var canv = this.getCanvas(e.rendered.canvas);
    // Render that canvas to the input context
    e.rendered.drawImage(canv, 0,0);
};

/*
* End of the API calls
* * * * * * * * * * */