var J = J || {};

J.Show = function(see,draw,dot) {

    var shady = draw.shaders.map(Bide);
    var offscreen = document.createElement('canvas');
    var context = (s) => offscreen.getContext(s,{preserveDrawingBuffer:true});
    var gl = context('webgl') || context('experimental-webgl');
    var k = {
        color : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        box: Float32Array.from('00100111').map(x=>-x),
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D,
    };
    var imp = (x) =>  k.hasOwnProperty(draw[x])? k[draw[x]]: gl[draw[x]];
    offscreen.width = 512;
    offscreen.height = 512;
//    var id = 'seer_' + 'test';
//    var idiv = document.createElement('div');
//    Object.assign(idiv,{className:'seer', id: id});
//    document.body.appendChild(idiv);
//    idiv.appendChild(offscreen);


    // put together needed bits for webGL
    this.scale = [ [k.tex, k.min, imp('min')], [k.tex, k.min, imp('mag')] ];
    this.tiler = [k.tex, 0, ...imp('tiles'), draw.shape[0]];
    this.square = [k.ab, k.box, imp('square')];
    this.shape = draw.shape.fill(offscreen,0,1);
    this.view = draw.shape.slice(1);
    this.dot = dot;
    this.gl = gl;

    Object.assign(this,{alpha:draw.alpha});
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [imp('mesh'), 0, 4];

    var go = this.Go.bind(this);
    var joiner = new J.Join(see, draw, go);
    Promise.all(shady).then(joiner.ready);
};

// Link up the Show with the shaders
J.Show.prototype.Go = function(shaders) {

    var self = this;
    var gl = self.gl;
    var link = Shading(shaders,gl);
    var overlay = gl.createTexture();
    var find = x => self.dot[x].id = gl.getAttribLocation(link,x);
    Object.keys(self.dot).map(find);

    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...self.square);
    gl.useProgram(link);

    // The webgl animation
    return function(){

//      var ctx = this.context2d();
        gl.viewport(...self.view);

        // Set pointers for GLSL
        for (var where in self.dot) {
          var id = self.dot[where].id;
          gl.vertexAttribPointer(id,...self.kind);
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
//        ctx.drawImage(...self.shape);
    }
}