
// Set up the rendering of WebGL
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

    this.Start(top,shaders,gl);

};

viaWebGL.prototype.Start = function(top,shaders,gl) {

    // WebGL Shorthand
    var k = {
        box: new Float32Array([-1, 1, 0, 1,
                               -1,-1, 0, 0,
                                1, 1, 1, 1,
                                1,-1, 1, 0]),
        format : [0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        drawArrays: [gl.TRIANGLE_STRIP, 0, 4],
        wrap : gl.CLAMP_TO_EDGE,
        filter : gl.NEAREST,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D
    };
    k.stride = k.box.BYTES_PER_ELEMENT;
    k.float = [2, gl.FLOAT, false, k.stride*4];
    k.bufferData = [k.ab, k.box, gl.STATIC_DRAW];
    k.wrap_T = [k.tex, gl.TEXTURE_WRAP_T, k.wrap];
    k.wrap_S = [k.tex, gl.TEXTURE_WRAP_S, k.wrap];
    k.fill_mag = [k.tex, gl.TEXTURE_MAG_FILTER, k.filter];
    k.fill_min = [k.tex, gl.TEXTURE_MIN_FILTER, k.filter];
    k.tile_pointer = k.float.concat([k.stride*2]);
    k.where_pointer = k.float.concat([0]);

    // Preset attributes and textures
    k.attributes = top.attribute || {
        kind: k.float
    };
    k.textures = top.texture || {
        texImage2D: [k.tex, ...k.format],
        bindTexture: [k.tex, gl.createTexture()],
        pixelStorei: [gl.UNPACK_FLIP_Y_WEBGL, 1],
        texParameteri: [k.fill_min, k.fill_mag, k.wrap_S, k.wrap_T]
    };

    var assign = function(str) {
        return (top[str] || [{}]).map(function(x) {
            return Object.assign(Object.assign({},k[str]), x);
        });
    }

    // Apply broad presets to each texture
    this.attributes = assign('attributes')
    this.textures = assign('textures')

    // Once loaded, Link shaders to viaWebGL
    var ready = function(k,shaders) {

        var link = this.Shading(shaders,gl);

        //TODO Hacky
        this.attributes[1].pointer = k.tile_pointer;

        // Find glsl locations of attributes
        for (var which of this.attributes) {
          which.name = gl.getAttribLocation(link,which.name);
          which.pointer = which.pointer || k.where_pointer;
        }
        // Essential position buffer for the viaWebGLing
        gl.bindBuffer(k.ab, gl.createBuffer());
        gl.bufferData(...k.bufferData);
        gl.useProgram(link);
    };

    Promise.all(shaders).then(ready.bind(this,k));

    // save the context and the core drawing method
    this.drawArrays = k.drawArrays;
    this.gl = gl;
}

// Promise to get a file then be done
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

/* * * * * * * * * * * *
  Start of the API calls
*/

// Takes in an image or canvas and gives back a canvas
viaWebGL.prototype.getCanvas = function(tile) {

    // render the tile
    this.TickTock([tile]);
    // return the canvas
    return this.gl.canvas;
};

// Takes in an image and gives back a rendered source
viaWebGL.prototype.getSource = function(image) {

    // Render the image into a data source
    return this.getCanvas(image).toDataURL();
};

viaWebGL.prototype.viaLoad = function(e) {

    // Set the imageSource as a data URL
    e.image.src = this.getSource(e.image);
    // allow for the callback to happen
    e.image.onload = e.getCompletionCallback;
};

viaWebGL.prototype.viaDraw = function(e) {

    // Get a webGL canvas from the input canvas
    var canv = this.getCanvas(e.rendered.canvas);
    // Render that canvas to the input context
    e.rendered.drawImage(canv, 0,0);
};

/*
* End of the API calls
* * * * * * * * * * */

// The webgl animation
viaWebGL.prototype.TickTock = function(image) {

    var gl = this.gl;

    // Set Attributes for GLSL
    this.attributes.forEach(function(which){

        var where = [which.name, ...which.pointer];
        gl.enableVertexAttribArray(which.name);
        gl.vertexAttribPointer(...where);
    });

    // Set Textures for GLSL
    this.textures.forEach(function(which) {

        gl.activeTexture(gl['TEXTURE'+which.name]);
        gl.bindTexture(...which.bindTexture);
        gl.pixelStorei(...which.pixelStorei);

        // Apply texture parameters
        which.texParameteri.map(function(x){
            gl.texParameteri(...x);
        });
        // Send the image into the texture.
        gl.texImage2D(...which.texImage2D.concat(image));
    });

    // Draw everything needed to canvas
    gl.drawArrays(...this.drawArrays);
};