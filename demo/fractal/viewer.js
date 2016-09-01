var EDGE = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* Fractal Viewer - Set an edge Shader for an SVG image
*/
EDGE.Viewer = function() {
    // Needed constants
    this.vShader = '../../shaders/vertex/square.glsl';
    this.fFiles = ['outline.glsl','none.glsl'];
    this.fPath = '../../shaders/fragment/';
    this.frag = 0;
}

EDGE.Viewer.prototype.init = function() {

    var img = new Image();
    var container = document.getElementById('viaWebGL');
    var fShader = this.fPath + this.fFiles[this.frag];
    var height = window.innerHeight;
    var width = window.innerWidth;
    container.onclick = function(){
        container.innerHTML = '';
        this.frag = (this.frag+1)%2;
        this.init();
    }.bind(this);

    var viaGL = new ViaWebGL();
    viaGL.vShader = this.vShader;
    viaGL.fShader = fShader;
    viaGL.height = height;
    viaGL.width = width;

    img.onload = function(){
        viaGL.init(img).then(function(e){
            container.appendChild(e);
        });
    };
    img.src = '../../images/mandel/brot.svg'

    return this;
}