var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function() {
}

J.Viewer.prototype.init = function() {

    // Open a seaDragon with two layers
    var openSD = OpenSeadragon({
        tileSources: '../../images/babel/babel.dzi',
        id: this.container || 'viaWebGL',
        prefixUrl: '../../images/icons/'
    });

    // Make a link to webGL
    var seaGL = new SeaDragonGL();
    seaGL.vShader = '../../shaders/vertex/square.glsl';
    seaGL.fShader = '../../shaders/fragment/none.glsl';
    seaGL.tileSize = 512;

    var load = function(callback, e) {
        // via webGL
        callback(e);
    }

    var draw = function(callback, e) {

        if (e.tile.loaded !==1) {
            e.tile.loaded = 1;
            callback(e);
        }
    }

    seaGL['tile-drawing'] = draw;
//    seaGL['tile-loaded'] = load;
    seaGL.init(openSD);
}