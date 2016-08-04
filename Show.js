var J = J || {};

// Begins the rendering of WebGL
J.Show = function(top) {

    var context = function(s){
        Object.assign(top.offscreen, top.sizes);
        return top.offscreen.getContext(s,top.context_keys);
    }
    var gl = context('webgl') || context('experimental-webgl');
    var shady = top.shaders.map(Timing);

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
    k.tiler = [k.tex, 0, ...k.color, null];
    k.near_min = [k.tex, k.min, gl.NEAREST];
    k.near_mag = [k.tex, k.mag, gl.NEAREST];

    // put together needed bits for webGL
    this.plan = top.strip? k.square_strip: k.square_tri;
    this.scale = [ k.near_min, k.near_mag ];
    this.square = k.square_static;
    this.shape = top.shape;
    this.alpha = top.alpha;
    this.kind = k.floating;
    this.tiler = k.tiler;
    this.spot = spot;
    this.gl = gl;

    Promise.all(shady).then(this.Ready.bind(this));
};

// Link up the Show with the shaders
J.Show.prototype.Ready = function(shaders) {

    var gl = this.gl;
    var link = Shading(shaders,gl);
    this.tex = gl.createTexture();

    // Find glsl spotwise attributes
    for (var where in this.spot) {
      this.spot[where].id = gl.getAttribLocation(link,where);
      this.spot[where].kind = this.kind;
    }
    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...this.square);
    gl.useProgram(link);
};

J.Show.prototype.processImage = function(tile) {

    // put the tile in the tiler
    this.tiler.fill(tile,-1);
    // Request an animation frame
//    var callback = this.TickTock.bind(this);
//    window.requestAnimationFrame(callback);
    // output the canvas
    this.TickTock();
    return this.gl.canvas.toDataURL();
};


// The webgl animation
J.Show.prototype.TickTock = function() {

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

var lib = new J.Show(hi);