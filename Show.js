var J = J || {};

J.Show = function(see,draw,dot) {

    var shady = draw.shaders.map(Bide),
    find = [null,'webgl', 'experimental-webgl'],
    offscreen = document.createElement('canvas'),
    gl = find.reduce((all,now) => all = all || offscreen.getContext(now)),
    k = {
        color : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        box: Float32Array.from('00100111'),
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D,
    },
    imp = (x) =>  k.hasOwnProperty(draw[x])? k[draw[x]]: gl[draw[x]];

    // put together needed bits for webGL
    this.scale = [ [k.tex, k.min, imp('min')], [k.tex, k.min, imp('mag')] ];
    this.tiles = [k.tex, 0, ...imp('tiles'), draw.overlay];
    this.square = [k.ab, k.box, imp('square')];

    Object.assign(this,{alpha:draw.alpha, shape:draw.shape});
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [imp('mesh'), 0, 4];

    var Go = this.Go.bind(this),
    out = {dot:dot,gl:gl,see:see,Go:Go};
    Promise.all(shady).then(this.Shade.bind(out));
};

J.Show.prototype.Shade = function(shaders) {

    // Link the shaders to the canvas
    var linked = this.Go(shaders,this.dot,this.gl);
    this.see.canvasOverlay({onRedraw: linked});
}

// Link up the Show with the shaders
J.Show.prototype.Go = function(shaders,dot,gl) {

    var self = this,
    link = Shading(shaders,gl),
    find = x => dot[x].id = gl.getAttribLocation(link,x);
    Object.keys(dot).map(find);

    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...self.square);
    gl.useProgram(link);

    // The following runs on redraw
    return function(){

        var ctx = this.context2d();
        ctx.globalAlpha = self.alpha;

        // Set pointers for GLSL
        for (var where in dot) {
          var id = dot[where].id;
          gl.vertexAttribPointer(id,...self.kind);
          gl.enableVertexAttribArray(id);
        }

        // Needed to update the colored tiling
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