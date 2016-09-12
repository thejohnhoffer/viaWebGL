// Drag an image to move it around. Drag the background to pan. 
window.onload = function(e){

    var babel = function(xy) {
        var obj = {
            tileSource: {
                Image: {
                    xmlns: "http://schemas.microsoft.com/deepzoom/2008",
                    Url: '../../images/babel/babel_files/',
                    TileSize: "512",
                    Format: "jpg",
                    Size: {
                        Width:  "30000",
                        Height: "21952"
                    }
                }
            },
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

    viewer.addHandler('open', function() {
        viewer.viewport.fitBounds(new OpenSeadragon.Rect(-1, -1, 3, 3));
    });

//    var drag = null;
}