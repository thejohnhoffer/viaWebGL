var SOBEL = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* SOBEL Viewer - Set a Sobel Shader for OpenSeaDragon
*/
SOBEL.Viewer = function() {
    // Needed constants
    this.tile_mode = 'tile-drawing';
    this.iconPrefix = '../images/icons/';
    this.source = '../images/babel/babel.dzi';
    this.vShader = '../shaders/vertex/square.glsl';
    this.fShader = '../shaders/fragment/sobel3.glsl';
}

SOBEL.Viewer.prototype.init = function() {

    // Open a seadragon with two layers
    this.openSD = OpenSeadragon({
        tileSources: this.source,
        prefixUrl: this.iconPrefix,
        id: 'viaWebGL'
    });

    // Make a link to webGL
    var seaGL = new openSeadragonGL(this.openSD);
    seaGL.addHandler(this.tile_mode);
    seaGL.vShader = this.vShader;
    seaGL.fShader = this.fShader;

    // Add a custom button
    seaGL.button({
        tooltip: 'Toggle shaders',
        prefix: this.iconPrefix,
        name: 'shade'
    });

    seaGL.init();
    return this;
}