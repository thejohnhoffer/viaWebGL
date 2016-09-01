var SOBEL = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~
/* SOBEL Viewer - Set a Sobel Shader for OpenSeaDragon
*/
SOBEL.Viewer = function() {
    // Needed constants
    this.tileSize = 512;
    this.container = 'viaWebGL';
    this.iconPrefix = '../../images/icons/';
    this.source = '../../images/babel/babel.dzi';
    this.vShader = '../../shaders/vertex/square.glsl';
    this.fShader = '../../shaders/fragment/sobel3.glsl';
    this['tile-loaded'] = function(callback, e) {
        callback(e);
    };
    this['tile-drawing'] = function(callback, e) {
        if (e.tile.loaded !==1) {
            e.tile.loaded = 1;
            callback(e);
        }
    }
}

SOBEL.Viewer.prototype.init = function() {

    // Open a seaDragon with two layers
    this.openSD = OpenSeadragon({
        tileSources: this.source,
        prefixUrl: this.iconPrefix,
        id: this.container
    });

    // Make a link to webGL
    var seaGL = new SeaDragonGL();
    seaGL['tile-drawing'] = this['tile-drawing'];
    seaGL.vShader = this.vShader;
    seaGL.fShader = this.fShader;
    seaGL.init(this.openSD);
    return this;
}