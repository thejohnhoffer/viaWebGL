var J = J || {};

J.Show = function(see) {

    var find = [null,'webgl', 'experimental-webgl'],
    canvas = see.canvas.appendChild(document.createElement('canvas')),
    gl = find.reduce((all,now) => all = all || canvas.getContext(now)),
    square = Float32Array.from('00100111');

    this.square = [gl.ARRAY_BUFFER,square,gl.STATIC_DRAW];
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [gl.TRIANGLE_STRIP, 0, 4];

    canvas.className = 'seer';
    this.seer = see;
    this.gl = gl;
    return this;
};

J.Show.prototype.Shade = function(draw,shade_tokens) {

    // Wait a bit to load both shaders
    this.take = shade_tokens;
    var shady = [Bide(draw.shade0), Bide(draw.shade1)];
    Promise.all(shady).then(this.Shaded.bind(this));
}

J.Show.prototype.Shaded = function(shaders) {

    var doRedraw = this.Go.bind(this,shaders,Shade(shaders,this.gl));
    this.seer.canvasOverlay({onRedraw: doRedraw});
}

// Link up the Show with the shaders
J.Show.prototype.Go = function(sh,link) {

    var gl = this.gl;
    buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(...this.square);
    gl.useProgram(link);

    for (t in this.take) {
      var token = [gl.getAttribLocation(link,this.take[t]), ...this.kind];
      gl.enableVertexAttribArray(token[0]);
      gl.vertexAttribPointer(...token);
    }

    gl.drawArrays(...this.plan);
}