
// Begins the rendering of WebGL
viaWebGL = function(top) {

    var context = function(s){
        Object.assign(top.offscreen, top.sizes);
        return top.offscreen.getContext(s,top.context_keys);
    }
    var gl = context('webgl') || context('experimental-webgl');
    var shady = top.shaders.map(this.Getting);

    // WebGL constants
    var k = {
        square_tri: [gl.TRIANGLES, 0, 6],
        float: [2, gl.FLOAT, false, 0, 0],
        box_tri: Float32Array.from('001001011011'),
        image : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D
    };
    k.square_static = [k.ab, k.box_tri, gl.STATIC_DRAW];
    k.clamp_T = [gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE];
    k.clamp_S = [gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE];
    k.near_mag = [k.tex, k.mag, gl.NEAREST];
    k.near_min = [k.tex, k.min, gl.NEAREST];
    k.tiler = [k.tex, 0, ...k.image, null];

    // Set the attributes
    this.attributes = ['a_where','a_where_in_tile'].map(function(n){
        return {name : n};
    });

    // Make the textures
    this.textures = [0].map(function(n){
        return {
            buffer: gl.createTexture(),
            scale: [ k.near_min, k.near_mag, k.clamp_S, k.clamp_T]
        };
    });

    // put together needed bits for webGL
    this.square = k.square_static;
    this.plan = k.square_tri;
    this.shape = top.shape;
    this.alpha = top.alpha;
    this.tiler = k.tiler;
    this.kind = k.float;
    this.gl = gl;

    Promise.all(shady).then(this.Ready.bind(this));
};

// Link up the viaWebGL with the shaders
viaWebGL.prototype.Ready = function(shaders) {

    var gl = this.gl;
    var link = this.Shading(shaders,gl);

    // Find glsl lovagions of attributes
    for (let which of this.attributes) {
      which.id = gl.getAttribLocation(link,which.name);
      which.kind = this.kind;
    }
    // Essential position buffer for the viaWebGLing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...this.square);
    gl.useProgram(link);
};

// Takes in an Image and gives back a Data URL
viaWebGL.prototype.Image = function(image) {

    // render the image
    this.TickTock(image);
    // return the image
    var canv = this.gl.canvas;
    return canv.toDataURL();
};

// Takes in a Canvas and gives back a Canvas
viaWebGL.prototype.Canvas = function(canvas) {

    // render the canvas
    this.TickTock(canvas);
    // return the canvas
    return this.gl.canvas;
};

viaWebGL.prototype.passImage = function(e) {

    // Set the imageSource as a data URL
    e.image.src = this.Image(e.image);
    // allow for the callback to happen
    e.image.onload = e.getCompletionCallback;
};

viaWebGL.prototype.passCanvas = function(e) {

    // Get a webGL canvas from the input canvas
    var canv = this.Canvas(e.rendered.canvas);
    // Render that canvas to the input context
    e.rendered.drawImage(canv, 0,0);
};


// The webgl animation
viaWebGL.prototype.TickTock = function(image) {

    var gl = this.gl;
    this.tiler.fill(image,-1);

    // Set Attributes for GLSL
    for (const which of this.attributes) {

        gl.vertexAttribPointer(which.id,...which.kind);
        gl.enableVertexAttribArray(which.id);
    }
    // Set Textures for GLSL
    for (const which of this.textures) {

        gl.bindTexture(gl.TEXTURE_2D, which.buffer);
        which.scale.map(x => gl.texParameteri(...x));
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    }

    // Upload the image into the texture.
    gl.texImage2D(...this.tiler);
    // Draw everything needed to canvas
    gl.drawArrays(...this.plan);
};

// ----------------------------------
//
// Promise to get a file
//
// ----------------------------------
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

// ----------------------------------
//
// Make one vertex shader and one fragment shader
//
// ----------------------------------

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