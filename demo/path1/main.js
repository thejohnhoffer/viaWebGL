// Drag an image to move it around. Drag the background to pan. 
window.onload = function(e){

    var babel = function(xy) {
        var obj = {
            tileSource: '../../images/babel/babel.dzi',
            x: xy,
            y: xy
        }
        return obj;
    };

    var viewer = OpenSeadragon({
        id: "viaWebGL",
        prefixUrl: "../../images/icons/",
        tileSources: [babel(0), babel(.5)]
    });

//    viewer.addHandler('open', function() {
//        viewer.viewport.fitBounds(new OpenSeadragon.Rect(-1, -1, 3, 3));
//    });

//    var drag = null;
}