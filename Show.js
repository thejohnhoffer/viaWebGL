var J = J || {};

J.Show = function(low,top,spot) {

    var shady = top.shaders.map(Bide);
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
    var imp = (x) =>  k.hasOwnProperty(top[x])? k[top[x]]: gl[top[x]];
    offscreen.width = 512;
    offscreen.height = 512;


    // put together needed bits for webGL
    this.scale = [ [k.tex, k.min, imp('min')], [k.tex, k.min, imp('mag')] ];
    this.tiler = [k.tex, 0, ...imp('tiles'), top.shape[0]];
    this.square = [k.ab, k.box, imp('square')];
    this.shape = top.shape.fill(offscreen,0,1);
    this.view = top.shape.slice(1);
    this.spot = spot;
    this.gl = gl;

    Object.assign(this,{alpha:top.alpha});
    this.kind = [2, gl.FLOAT, false, 0, 0];
    this.plan = [imp('mesh'), 0, 4];

    var go = this.Go.bind(this);
    var joiner = new J.Join(low, top, go);
    Promise.all(shady).then(joiner.ready);
};

// Link up the Show with the shaders
J.Show.prototype.Go = function(shaders) {

    var self = this;
    var gl = self.gl;
    var link = Shading(shaders,gl);
    var overlay = gl.createTexture();

    // Find all of the glsl spotwise attributes
    var find = x => self.spot[x].id = gl.getAttribLocation(link,x);
    Object.keys(self.spot).map(find);
    gl.viewport(...self.view);

    // Essential position buffer for the showing
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(...self.square);
    gl.useProgram(link);

    // The webgl animation
    return function(){

        // Set pointers for GLSL
        for (var where in self.spot) {
          var id = self.spot[where].id;
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
    }
}