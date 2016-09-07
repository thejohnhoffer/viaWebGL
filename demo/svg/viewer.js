var EDGE = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* Fractal Viewer - Set an edge Shader for an SVG image
*/
EDGE.Viewer = function() {

    this.img = new Image();
    this.viaGL = new ViaWebGL();
    this.img.onload = this.init.bind(this);
    this.img.src = '../images/fractal.svg';
    this.viaGL.vShader = '../shaders/vertex/square.glsl';
    this.viaGL.fShader = '../shaders/fragment/sobel3.glsl';
    this.viaGL.container = document.getElementById('viaWebGL');
    this.img.height = this.viaGL.container.clientHeight;
    this.img.width = this.viaGL.container.clientWidth;
}

EDGE.Viewer.prototype ={

    init: function(){

        this.viaGL.onclick = 'toggle';
        this.viaGL.init(this.img);
    }
}