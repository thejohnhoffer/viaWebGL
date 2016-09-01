var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function() {
    this.iconPrefix = '../../images/icons/';
    this.source = '../../images/babel/babel.dzi';
    this.vShader = '../../shaders/vertex/square.glsl';
    this.fShader = '../../shaders/fragment/sobel3.glsl';
    this.container = 'viaWebGL';
    this.tileSize = 512;
}

J.Viewer.prototype.init = function() {

    // Open a seaDragon with two layers
    var openSD = OpenSeadragon({
        tileSources: this.source,
        prefixUrl: this.iconPrefix,
        id: this.container
    });

    // Add a custom button
    J.seaButton(openSD, {
        name: 'shade',
        tooltip: 'Toggle shaders',
        prefix: this.iconPrefix
    });

    // Make a link to webGL
    var seaGL = new SeaDragonGL();
    seaGL.vShader = this.vShader;
    seaGL.fShader = this.fShader;
    seaGL.tileSize = this.tileSize;

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

//    seaGL['tile-loaded'] = load;
    seaGL['tile-drawing'] = draw;
    seaGL.init(openSD);
}