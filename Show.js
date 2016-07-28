var J = J || {};

J.Show = function(see,draw,dot) {

    var shady = draw.shaders.map(Bide),
    offscreen = document.createElement('canvas'),
    context = (s) => offscreen.getContext(s,{preserveDrawingBuffer:true}),
    gl = context('webgl') || context('experimental-webgl'),
    k = {
        color : [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE],
        box: Float32Array.from('00100111').map(x=>-x),
        min: gl.TEXTURE_MIN_FILTER,
        mag: gl.TEXTURE_MAG_FILTER,
        ab : gl.ARRAY_BUFFER,
        tex: gl.TEXTURE_2D,
    },
    imp = (x) =>  k.hasOwnProperty(draw[x])? k[draw[x]]: gl[draw[x]];
    offscreen.width = 512;
    offscreen.height = 512;
    var id = 'seer_' + 'test';
    var idiv = document.createElement('div');
    Object.assign(idiv,{className:'seer', id: id});
    document.body.appendChild(idiv);
    idiv.appendChild(offscreen);


    // put together needed bits for webGL
    this.scale = [ [k.tex, k.min, imp('min')], [k.tex, k.min, imp('mag')] ];
    this.tiler = [k.tex, 0, ...imp('tiles'), draw.overlay];
    this.square = [k.ab, k.box, imp('square')];
    this.shape = draw.shape.fill(offscreen,0,1);
    this.view = draw.shape.slice(1);

//    Object.assign(this,{alpha:draw.alpha, shape:[offscreen,0,0,512,512]});
    Object.assign(this,{alpha:draw.alpha});
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [imp('mesh'), 0, 4];

    var Go = this.Go.bind(this),
    out = {dot:dot,gl:gl,see:see,Go:Go};
    Promise.all(shady).then(this.Shade.bind(out));
};

J.Show.prototype.Shade = function(shaders) {

    var self = this;
    var link = self.Go(shaders,self.dot,self.gl);
    var animloop = function(){

      window.requestAnimationFrame(animloop);
      link();
    };
    animloop();

    // Link the shaders to the canvas
//    var linked = this.Go(shaders,this.dot,this.gl);
//    this.see.canvasOverlay({onRedraw: linked});
}

// Link up the Show with the shaders
J.Show.prototype.Go = function(shaders,dot,gl) {

    var self = this;
    var link = Shading(shaders,gl);
    var find = x => dot[x].id = gl.getAttribLocation(link,x);
    Object.keys(dot).map(find);


    var overlay = gl.createTexture();
    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...self.square);
    gl.useProgram(link);

    // The following runs on redraw
    return function(){

//        var ctx = this.context2d();
        // Adjust the viewport to the current canvas
//        self.view.fill(this.canvas().width,3,4);
//        self.view.fill(this.canvas().height,4,5);
        gl.viewport(...self.view);

        // Set pointers for GLSL
        for (var where in dot) {
          var id = dot[where].id;
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