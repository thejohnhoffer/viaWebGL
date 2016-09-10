var DOJO = DOJO || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

DOJO.Viewer = function(terms) {
    this.iconPrefix = '../images/icons/';
}

DOJO.Viewer.prototype.init = function() {

    // Make the two layers
    var src = '../images/babel/babel.dzi';
    var anything = {
        top: true,
        minLevel: 0,
        tileSize: 512,
        height: 512*47,
        width:  512*64,
        getTileUrl: function() {
            return '../images/anything.png';
        }
    }

    // Open a seadragon with two layers
    var openSD = OpenSeadragon({
        tileSources: [src+'?l=0', anything],
        prefixUrl: this.iconPrefix,
        id: 'viaWebGL'
    });

    // Make a link to webGL
    var seaGL = new openSeadragonGL(openSD);
    seaGL.vShader = '../shaders/vertex/rect.glsl';
    seaGL.fShader = '../shaders/fragment/rect.glsl';

    // Draw per tile
    var draw = function(callback, e) {

        var image = e.tiledImage;
        var source = image.source;
        if (source.top) {
            var via = this.viaGL;
            via.bounds = e.tile.bounds;
            var y = via.bounds.y + via.bounds.height;
            via.flip_y = image.getBounds().height - y;
            image.setOpacity(.8);
            callback(e);
        }
    }

    // Load for glsl
    var GLloaded = function(program) {
        this.wherer = this.gl.getUniformLocation(program, 'u_tile_where');
        this.shaper = this.gl.getUniformLocation(program, 'u_tile_shape');
    }

    // Draw for glsl
    var GLdrawing = function() {
        this.gl.uniform2f(this.wherer, this.bounds.x, this.flip_y);
        this.gl.uniform2f(this.shaper, this.bounds.width, this.bounds.height);
    }

    seaGL.addHandler('tile-drawing',draw);
    seaGL.addHandler('gl-loaded',GLloaded);
    seaGL.addHandler('gl-drawing',GLdrawing);

    // Add a custom button
    seaGL.button({
        tooltip: 'Toggle shaders',
        prefix: this.iconPrefix,
        name: 'shade'
    });


    seaGL.init();
}
