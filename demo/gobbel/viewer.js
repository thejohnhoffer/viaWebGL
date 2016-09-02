var EDGE = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* Fractal Viewer - Set an edge Shader for an SVG image
*/
EDGE.Viewer = function() {

    this.toggle = 0;
    this.img = new Image();
    this.viaGL = new ViaWebGL();
    this.img.src = '../../images/mandel/hen.svg';
    this.viaGL.vShader = '../../shaders/vertex/square.glsl';
    this.fFiles = ['none.glsl','sobel3.glsl'].map(function(file){
        return '../../shaders/fragment/'+file;
    });
}

EDGE.Viewer.prototype ={

    init: function(){

        var container = document.getElementById('viaWebGL');
        this.viaGL.fShader = this.fFiles[this.toggle%this.fFiles.length];
        this.img.height = this.viaGL.height = container.clientHeight;
        this.img.width = this.viaGL.width = container.clientWidth;

        this.img.onload = this.init.bind(this);
        container.onclick = this.init.bind(this);

        this.viaGL.init(this.img).then(function(e){
            container.innerHTML = '';
            container.appendChild(e);
        });

        this.toggle ++;
        return this;
    }
}