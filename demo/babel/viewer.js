var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function(baseLayer) {
}

J.Viewer.prototype.init = function() {

    // Open a seaDragon with two layers
    var openSD = OpenSeadragon({
        tileSources: '../../zoomable/babel/babel.dzi',
        id: this.container || 'viaWebGL',
        prefixUrl: '../../images/'
    });

    // Make a link to webGL
    var seaGL = new SeaDragonGL();
    seaGL.vShader = '../../shaders/square.glsl';
    seaGL.fShader = '../../shaders/edge.glsl';

    var load = function(callback, e) {
        // via webGL
        callback(e);
    }

    seaGL['tile-loaded'] = load;

    seaGL.init(openSD);
}