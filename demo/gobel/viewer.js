var EDGE = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* Fractal Viewer - Set an edge Shader for an SVG image
*/
EDGE.Viewer = function() {

    this.toggle = 0;
    this.img = new Image();
    this.viaGL = new ViaWebGL();
    this.vShader = '../../shaders/vertex/square.glsl';
    this.fFiles = ['sobel3.glsl','none.glsl'].map(function(file){
        return '../../shaders/fragment/'+file;
    });

    this.img.onload = this.init.bind(this);
    this.container.onclick = this.init.bind(this);
    this.img.src = '../../images/mandel/hen.svg';
}

EDGE.Viewer.prototype ={

    init: function(){

        var container = document.getElementById('viaWebGL');
        this.fShader = this.fFiles[this.toggle%this.fFiles.length];
        this.height = container.clientHeight;
        this.width = container.clientWidth;

        this.viaGL.fShader = this.fShader;
        this.viaGL.vShader = this.vShader;
        this.viaGL.height = this.height;
        this.viaGL.width = this.width;

        this.img.height = this.height;
        this.img.width = this.width;

        this.viaGL.init(this.img).then(function(e){
            container.innerHTML = '';
            container.appendChild(e);
        });

        this.toggle ++;
        return this;
    }
}