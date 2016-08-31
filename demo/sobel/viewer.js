var J = J || {};
//-----------------------------------
//
// J.Viewer - test webGL overlay atop OpenSeaDragon
//
//-----------------------------------

J.Viewer = function() {
    // Add an shading button
    this.shade = new Image();
    this.shade.id = 'shade';
}

J.Viewer.prototype.init = function() {

    // Open a seaDragon with two layers
    var openSD = OpenSeadragon({
        tileSources: '../../images/babel/babel.dzi',
        id: this.container || 'viaWebGL',
        prefixUrl: '../../images/icons/',
    });
    console.log(openSD.navImages);

    // Add shading to Seadragon
    this.shade.onload = function(){
        document.body.appendChild(this.shade);
        var corner = OpenSeadragon.ControlAnchor.TOP_LEFT;
        openSD.addControl(this.shade.id,{anchor: corner});
    }.bind(this);
    this.shade.src = '../../images/icons/shade_rest.png';

    // Make a link to webGL
    var seaGL = new SeaDragonGL();
    seaGL.vShader = '../../shaders/vertex/square.glsl';
    seaGL.fShader = '../../shaders/fragment/sobel3.glsl';
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


//    seaGL['tile-loaded'] = load;
    seaGL['tile-drawing'] = draw;
    seaGL.init(openSD);
}