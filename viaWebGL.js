
// Set up the rendering of WebGL
ViaWebGL = function(top) {

    this.standard = function(e) {
        return e;
    }

    var hide = document.createElement('canvas');
    hide.height = top.size;
    hide.width = top.size;

    // Actually get the context and set the shaders
    var gl = hide.getContext('webgl') || hide.getContext('experimental-webgl');
    var shaders = [top.vShader, top.fShader].map(this.Getting);

    J.copy(this, {top: top, shaders: shaders, gl: gl});
};

ViaWebGL.prototype.init = function(top,shaders,gl) {

    var gl = this.gl;
    var top = this.top;
    var shaders = this.shaders;

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
    k.where_pointer = k.float.concat([k.stride*0]);
    k.tile_pointer = k.float.concat([k.stride*2]);

    // Preset attributes and texture
    k.preset = {
        kind: k.float,
        name:'a_position'
    };
    k.set = [
        {name:'a_where', pointer: k.where_pointer},
        {name:'a_where_tile', pointer: k.tile_pointer}
    ]
    // Overwrite the presets with specifics
    var assign = function(str) {
        return k.set.map(function(each) {
            return J.copy(each,k.preset);
        });
    }

    // Apply broad presets to each texture
    this.attributes = assign('attributes');
    this.texture = {
        drawArrays: k.drawArrays,
        texImage2D: [k.tex].concat(k.format),
        bindTexture: [k.tex, gl.createTexture()],
        pixelStorei: [gl.UNPACK_FLIP_Y_WEBGL, 1],
        texParameteri: [k.fill_min, k.fill_mag, k.wrap_S, k.wrap_T]
    };

    // Once loaded, Link shaders to ViaWebGL
    var ready = function(k,shaders) {

        var link = this.Shading(shaders,gl);

        // Find glsl locations of attributes
        for (var which of this.attributes) {
          which.name = gl.getAttribLocation(link,which.name);
          which.pointer = which.pointer || k.where_pointer;
        }
        // Essential position buffer for ViaWebGL
        gl.bindBuffer(k.ab, gl.createBuffer());
        gl.bufferData.apply(gl, k.bufferData);
        gl.useProgram(link);
    };

    Promise.all(shaders).then(ready.bind(this,k));

    // save the context and the core drawing method
    this.drawArrays = k.drawArrays;
    this.gl = gl;
}

/* * * * * * * * * * * *
  Start of the API calls
*/

// Takes in an image or canvas and gives back a canvas
ViaWebGL.prototype.getCanvas = function(tile) {

    // render the tile
    this.TickTock([tile]);
    // return the canvas
    return this.gl.canvas;
};

// Takes in an image and gives back a rendered source
ViaWebGL.prototype.getSource = function(image) {

    // Render the image into a data source
    return this.getCanvas(image).toDataURL();
};

ViaWebGL.prototype.viaLoad = function(e) {

    // Set the imageSource as a data URL
    e.image.src = this.getSource(e.image);
    // allow for the callback to happen
    e.image.onload = e.getCompletionCallback;
};

ViaWebGL.prototype.viaDraw = function(e) {

    // Get a webGL canvas from the input canvas
    var canv = this.getCanvas(e.rendered.canvas);
    // Render that canvas to the input context
    e.rendered.drawImage(canv, 0,0);
};

ViaWebGL.prototype.event = function(event,custom) {

    var callbacks = {
      'tile-loaded': this.viaLoad.bind(this),
      'tile-drawing': this.viaDraw.bind(this),
    }
    var call = function(e) {
        custom(e,callbacks[event]);
    }
    return [event, call];
}

/*
* End of the API calls
* * * * * * * * * * */

// Promise to get a file then be done
ViaWebGL.prototype.Getting = function(where) {
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
ViaWebGL.prototype.Shading = function(files, gl) {

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

// The webgl animation
ViaWebGL.prototype.TickTock = function(image) {

    var gl = this.gl;
    var tex = this.texture;

    // Set Attributes for GLSL
    this.attributes.forEach(function(which){

        var where = [which.name].concat(which.pointer);
        gl.enableVertexAttribArray(which.name);
        gl.vertexAttribPointer.apply(gl, where);
    });

    // Set Texture for GLSL
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture.apply(gl, tex.bindTexture);
    gl.pixelStorei.apply(gl, tex.pixelStorei);

    // Apply texture parameters
    tex.texParameteri.map(function(x){
        gl.texParameteri.apply(gl, x);
    });
    // Send the image into the texture.
    var output = tex.texImage2D.concat(image);
    gl.texImage2D.apply(gl, output);

    // Draw everything needed to canvas
    gl.drawArrays.apply(gl, tex.drawArrays);
};