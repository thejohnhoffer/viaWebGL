var SOBEL = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~
// SOBEL Viewer - Set a Sobel Shader for OpenSeaDragon
*/

SOBEL.Viewer = function() {
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

    // Just get terms from this viewer
    var terms = JSON.parse(JSON.stringify(this));

    // Open a seaDragon with two layers
    var openSD = OpenSeadragon({
        tileSources: this.source,
        prefixUrl: this.iconPrefix,
        id: this.container
    });

    // Add a custom button
    DEMO.seaButton(openSD, {
        tooltip: 'Toggle shaders',
        prefix: this.iconPrefix,
        name: 'shade'
    });

    // Make a link to webGL
    var seaGL = new SeaDragonGL(terms);
    seaGL['tile-drawing'] = this['tile-drawing'];
    seaGL.init(openSD);
}