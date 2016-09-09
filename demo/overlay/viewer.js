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

    // Open a seadragon with two layers
    var openSD = OpenSeadragon({
        tileSources: [src+'?l=0', src+'?l=1'],
        prefixUrl: this.iconPrefix,
        id: 'viaWebGL'
    });

    // Make a link to webGL
    var seaGL = new openSeadragonGL(openSD);
    seaGL.vShader = '../shaders/vertex/square.glsl';
    seaGL.fShader = '../shaders/fragment/sobel3.glsl';

    var load = function(callback, e) {

        var source = e.tiledImage.source;
        if (e.tile.url.slice(-1) == '1') {
            // Make the entire top tile transparent
            e.tiledImage.setOpacity(.6);
            // via webGL
            callback(e);
        }
    }

    var draw = function(callback, e) {

        if (e.tile.loaded !==1) {
            load(callback, e);
            e.tile.loaded = 1;
        }
    }

    seaGL.addHandler('tile-drawing',draw);

    // Add a custom button
    seaGL.button({
        tooltip: 'Toggle shaders',
        prefix: this.iconPrefix,
        name: 'shade'
    });


    seaGL.init();
}
