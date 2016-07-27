var J = J || {};

J.Show = function(see,draw,dots) {

    var shady = draw.shaders.map(Bide),
    find = [null,'webgl', 'experimental-webgl'],
    offscreen = document.createElement('canvas'),
    gl = find.reduce((all,now) => all = all || offscreen.getContext(now)),
    k = {
        color : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        box: Float32Array.from('00100111'),
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        tex: gl.TEXTURE_2D,
        ab : gl.ARRAY_BUFFER,
    },
    imp = (x) =>  k.hasOwnProperty(draw[x])? k[draw[x]]: gl[draw[x]];

    // put together needed bits for webGL
    this.scale = [ [k.tex, k.min, imp('min')], [k.tex, k.min, imp('mag')] ];
    this.tiles = [k.tex, 0, ...imp('tiles'), draw.overlay];
    this.square = [k.ab, k.box, imp('square')];
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [imp('mesh'), 0, 4];
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
        gl.bufferData(...self.square);
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
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);

        // Upload the image into the texture.
        gl.texImage2D(...self.tiles);
        // Draw everything needed to canvas
        gl.drawArrays(...self.plan);
        ctx.drawImage(...self.shape);
    }
}