var J = J || {};

// Begins the rendering of WebGL
J.viaWebGL = function(top) {

    var context = function(s){
        Object.assign(top.offscreen, top.sizes);
        return top.offscreen.getContext(s,top.context_keys);
    }
    var gl = context('webgl') || context('experimental-webgl');
    var shady = top.shaders.map(this.Getting);

    // Begin all needed for WebGL
    var spot = {
        a_where : {},
        a_tile_pos  : {}
    }
    var k = {
        square_tri: [gl.TRIANGLES, 0, 6],
        floating: [2, gl.FLOAT, false, 0, 0],
        square_strip: [gl.TRIANGLE_STRIP, 0, 4],
        box_strip: Float32Array.from('00100111'),
        box_tri: Float32Array.from('001001011011'),
        color : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D,
    };
    k.box = top.strip? k.box_strip: k.box_tri;
    k.square_static = [k.ab, k.box, gl.STATIC_DRAW];
    k.clamp_T = [gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE];
    k.clamp_S = [gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE];
    k.near_min = [k.tex, k.min, gl.NEAREST];
    k.near_mag = [k.tex, k.mag, gl.NEAREST];
    k.tiler = [k.tex, 0, ...k.color, null];

    // put together needed bits for webGL
    this.plan = top.strip? k.square_strip: k.square_tri;
    this.scale = [ k.near_min, k.near_mag, k.clamp_S, k.clamp_T];
    this.square = k.square_static;
    this.shape = top.shape;
    this.alpha = top.alpha;
    this.kind = k.floating;
    this.tiler = k.tiler;
    this.spot = spot;
    this.gl = gl;

    Promise.all(shady).then(this.Ready.bind(this));
};

// Link up the viaWebGL with the shaders
J.viaWebGL.prototype.Ready = function(shaders) {

    var gl = this.gl;
    var shader0 = [shaders[0],gl.VERTEX_SHADER];
    var shader1 = [shaders[1],gl.FRAGMENT_SHADER];
    var link = this.Shading([shader0,shader1],gl);
    this.tex = gl.createTexture();

    // Find glsl spotwise attributes
    for (var where in this.spot) {
      this.spot[where].id = gl.getAttribLocation(link,where);
      this.spot[where].kind = this.kind;
    }
    // Essential position buffer for the viaWebGLing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...this.square);
    gl.useProgram(link);
};

J.viaWebGL.prototype.passCanvas = function(e) {

    // put the tile in the tiler
    this.tiler.fill(e.rendered.canvas,-1);
    // render the canvas
    this.TickTock();

    // draw the image
    var canv = this.gl.canvas;
    e.rendered.drawImage(canv, 0,0);
};

J.viaWebGL.prototype.passImage = function(e) {

    // put the tile in the tiler
    this.tiler.fill(e.image,-1);
    // render the canvas
    this.TickTock();

    // draw the image
    var canv = this.gl.canvas;
    e.image.src = canv.toDataURL();
    // allow for the callback to happen
    e.image.onload = e.getCompletionCallback;
};


// The webgl animation
J.viaWebGL.prototype.TickTock = function() {

    var gl = this.gl;
    // Set pointers for GLSL
    for (var where in this.spot) {
      var id = this.spot[where].id;
      var kind = this.spot[where].kind;
      gl.vertexAttribPointer(id,...kind);
      gl.enableVertexAttribArray(id);
    }

    // Needed to update the colored tiling
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    this.scale.map(x => gl.texParameteri(...x));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);

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
J.viaWebGL.prototype.Getting = function(where) {
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

J.viaWebGL.prototype.Shading = function(files, gl) {

  var shaderWork = gl.createProgram();
  var make = function(given) {

    var shader = gl.createShader(given[1]);
    gl.shaderSource(shader, given[0]);
    gl.compileShader(shader);
    gl.attachShader(shaderWork, shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.log(gl.getShaderInfoLog(shader));
    }
  };

  files.map(make);
  gl.linkProgram(shaderWork);

  if (gl.getProgramParameter(shaderWork, gl.LINK_STATUS)) return shaderWork;

  var logger = function(f) {
    console.log(gl.getShaderInfoLog(f));
  }

  files.map(logger);
  console.log(gl.getProgramInfoLog(shaderWork));
  return console.log("Could not start shaders");
};