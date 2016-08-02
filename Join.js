var J = J || {};

// Join webgl top with low seadragon
J.Join = function(low,top,tick,offscreen) {

    var self = this;
    this.window = top.shape;
    this.shape = top.shape.slice(-2);

    this.ready = function(shaders) {

        // Link the shaders
        var link = tick(shaders);
        var moveloop = function(){

            // Speedy rendering call forever
            window.requestAnimationFrame(moveloop);
            link();
        };
        moveloop();

        // If debug webGL
        if (top.debug) {
            var id = 'seer_' + 'test';
            var idiv = document.createElement('div');
            Object.assign(idiv,{className:'seer', id: id});
            document.body.appendChild(idiv);
            idiv.appendChild(offscreen);
            return 1;
        }

        // Actually join source to canvas
        self.toCanvas(low,top,offscreen);
    }

};

// Join a source by canvas overlay to a seadragon
J.Join.prototype.toCanvas = function(low,top,source) {

    var self = this;
    var Go = function() {
        var ctx = this.context2d();
        ctx.globalAlpha = top.alpha;
        ctx.drawImage(source || top.image, ...self.window);
    }

    low.canvasOverlay({onRedraw: Go});
};

// Set the shape
J.Join.prototype.setShape = function(x,y,h) {

    var hw = this.shape.map(s=>s*h);
    this.window = [x,y,...hw];
};