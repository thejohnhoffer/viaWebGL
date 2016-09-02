var EDGE = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
/* Fractal Viewer - Set an edge Shader for an SVG image
*/
EDGE.Viewer = function() {

    this.toggle = 0;
    this.img = new Image();
    this.viaGL = new ViaWebGL();
    this.src = '../../images/mandel/brot.svg';
    this.vShader = '../../shaders/vertex/square.glsl';
    this.container = document.getElementById('viaWebGL');
    this.fFiles = ['none.glsl','sobel3.glsl'].map(function(file){
        return '../../shaders/fragment/'+file;
    });
}

EDGE.Viewer.prototype ={

    init: function(){
        this.toggle ++;
        this.container.innerHTML = '';
        this.fShader = this.fFiles[this.toggle%this.fFiles.length];
        this.height = this.container.clientHeight;
        this.width = this.container.clientWidth;
        this.show(this.container);
        return this;
    },
    show: function(container){
        var img = this.img;
        var viaGL = this.viaGL;
        var container = this.container;
        viaGL.fShader = this.fShader;
        viaGL.vShader = this.vShader;
        viaGL.height = this.height;
        viaGL.width = this.width;

        img.onload = function(){
            viaGL.init(img).then(function(e){
                container.appendChild(e);
            });
        }
        img.src = this.src;
    }
}