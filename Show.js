var J = J || {};

J.Show = function(see,draw,dots) {

    var find = [null,'webgl', 'experimental-webgl'],
    shady = [Bide(draw.shade0), Bide(draw.shade1)];
    offscreen = document.createElement('canvas'),
    gl = find.reduce((all,now) => all = all || offscreen.getContext(now)),
    tiler = [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
    scale = [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER],
    square = [Float32Array.from('00100111')],
    join = function (x) {
      return [gl[this[0]],x,gl[draw[this[1]]]];
    };

    // put together needed bits for webGL
    this.image = [...tiler,draw.overlay];
    this.square = square.map(join.bind(['ARRAY_BUFFER','square']));
    this.scale = scale.map(join.bind(['TEXTURE_2D', 'scale']));
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [gl[draw.mesh], 0, 4];
    this.dots = dots;

    this.shape = draw.shape.fill(offscreen,0,1);
    var out = {'gl':gl,'el':see,'Go':this.Go.bind(this)};
    Promise.all(shady).then(this.Shade.bind(out));
};

J.Show.prototype.Shade = function(shaders) {

    // Link the shaders to the canvas
    var linked = this.Go(shaders,this.gl);
    this.el.canvasOverlay({onRedraw: linked});
    console.log('40');

}

// Link up the Show with the shaders
J.Show.prototype.Go = function(shaders,gl) {

    var self = this;
    var link = Shading(shaders,gl);
    return function(){

        var ctx = this.context2d();
        // Essential position buffer for the showing
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(...self.square[0]);
        gl.useProgram(link);

        // Get the pointers for GLSL
        for (var where in self.dots) {
          var token = gl.getAttribLocation(link,where);
          gl.vertexAttribPointer(token,...self.kind);
          gl.enableVertexAttribArray(token);
        }

        // Needed for the colored tiling
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        self.scale.map(x => gl.texParameteri(...x));

        // Upload the image into the texture.
        gl.texImage2D(...self.image);
        // Draw everything needed to canvas
        gl.drawArrays(...self.plan);
        ctx.drawImage(...self.shape);
    }
}