var J = J || {};

J.Show = function(see,draw) {

    var find = [null,'webgl', 'experimental-webgl'],
    canvas = see.canvas.appendChild(document.createElement('canvas')),
    gl = find.reduce((all,now) => all = all || canvas.getContext(now)),
    tiler = [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
    scale = [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER],
    square = Float32Array.from('00100111'),
    join = function (x) {
      return [this[0],x,gl[draw[this[1]]]];
    }

    // put together needed bits for webGL
    this.image = [...tiler,draw.overlay];
    this.shady = [Bide(draw.shade0), Bide(draw.shade1)];
    this.square = join.call([gl.ARRAY_BUFFER,'style'],square);
    this.scale = scale.map(join.bind([gl.TEXTURE_2D, 'scale']));
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [gl[draw.mesh], 0, 4];

    canvas.className = 'seer';
    this.seer = see;
    this.gl = gl;
    return this;
};

J.Show.prototype.Shade = function(dots) {

    // Load both shaders
    this.dots = dots;
    Promise.all(this.shady).then(this.Shaded.bind(this));
}

J.Show.prototype.Shaded = function(shaders) {

    // Link the shaders to the canvas
    var linked = Shading(shaders,this.gl),
    doRedraw = this.Go.bind(this,this.gl,linked);
    this.seer.canvasOverlay({onRedraw: doRedraw});
}

// Link up the Show with the shaders
J.Show.prototype.Go = function(gl,link) {

    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...this.square);
    gl.useProgram(link);

    // Get the pointers for GLSL
    for (var where in this.dots) {
      var token = gl.getAttribLocation(link,where);
      gl.vertexAttribPointer(token,...this.kind);
      gl.enableVertexAttribArray(token);
    }

    // Needed for the colored tiling
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    this.scale.map(x => gl.texParameteri(...x));

    // Upload the image into the texture.
    gl.texImage2D(...this.image);
    // Draw everything needed
    gl.drawArrays(...this.plan);
}