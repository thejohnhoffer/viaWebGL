var EDGE = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* Fractal Viewer - Set an edge Shader for an SVG image
*/
EDGE.Viewer = function() {

    this.img = new Image();
    this.viaGL = new ViaWebGL();
    this.img.onload = this.init.bind(this);
    this.img.src = '../../images/fractal.svg';
    this.viaGL.vShader = '../../shaders/vertex/square.glsl';
    this.viaGL.fShader = '../../shaders/fragment/sobel3.glsl';
    this.container = document.getElementById('viaWebGL');
    this.img.height = this.container.clientHeight;
    this.img.width = this.container.clientWidth;
}

EDGE.Viewer.prototype ={

    init: function(){

        var container = this.container;
        container.onclick = this.init.bind(this);

        this.viaGL.init(this.img).then(function(e){
            container.innerHTML = '';
            container.appendChild(e);
        });

        this.viaGL.toggle ++;
        return this;
    }
}