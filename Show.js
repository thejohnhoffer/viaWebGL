var J = J || {};

J.Show = function(low,top) {

    // Allow for webGL or canvas fallback
    this.offscreen = Object.assign(document.createElement('canvas'), top.sizes);
    this.joiner = new J.Join(low, top, this.Go.bind(this), this.offscreen);
    if (top.canvas) return this.joiner.ready(0);

    // Run WebGL if possible
    this.GL(top);

};

J.Show.prototype.GL = function(top) {

    var shady = top.shaders.map(Timing);
    var context = (s) => this.offscreen.getContext(s,top.context_keys);
    var gl = context('webgl') || context('experimental-webgl');

    // Begin all needed for WebGL
    var spot = {
        a_where : {},
        a_tile_pos  : {}
    }
    var k = {
        square_strip: [gl.TRIANGLE_STRIP, 0, 4],
        floating: [2, gl.FLOAT, false, 0, 0],
        color : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        box: Float32Array.from('00100111').map(x=>-x),
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D,
    };
    k.square_static = [k.ab, k.box, gl.STATIC_DRAW];
    k.tiler = [k.tex, 0, ...k.color, top.image];
    k.near_min = [k.tex, k.min, gl.NEAREST];
    k.near_mag = [k.tex, k.mag, gl.NEAREST];

    // put together needed bits for webGL
    this.scale = [ k.near_min, k.near_mag ];
    this.square = k.square_static;
    this.plan = k.square_strip;
    this.shape = top.shape;
    this.alpha = top.alpha;
    this.kind = k.floating;
    this.tiler = k.tiler;
    this.spot = spot;
    this.gl = gl;

    Promise.all(shady).then(this.joiner.ready);
}

// Link up the Show with the shaders
J.Show.prototype.Go = function(shaders) {

    var self = this;
    var gl = self.gl;
    var link = Shading(shaders,gl);
    var overlay = gl.createTexture();

    // Find glsl spotwise attributes
    for (var where in self.spot) {
      self.spot[where].id = gl.getAttribLocation(link,where);
      self.spot[where].kind = self.kind;
    }

    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...self.square);
    gl.viewport(...self.shape);
    gl.useProgram(link);

    // The webgl animation
    return function(){

        // Set pointers for GLSL
        for (var where in self.spot) {
          var id = self.spot[where].id;
          var kind = self.spot[where].kind;
          gl.vertexAttribPointer(id,...kind);
          gl.enableVertexAttribArray(id);
        }

        // Needed to update the colored tiling
        gl.bindTexture(gl.TEXTURE_2D, overlay);
        self.scale.map(x => gl.texParameteri(...x));
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);

        // Upload the image into the texture.
        gl.texImage2D(...self.tiler);
        // Draw everything needed to canvas
        gl.drawArrays(...self.plan);
    }
}