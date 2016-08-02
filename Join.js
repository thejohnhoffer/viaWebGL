var J = J || {};

// Join webgl top with low seadragon
J.Join = function(low,top,tick,offscreen) {

    var self = this;
    this.window = top.shape;
    this.shape = top.shape.slice(-2);
    this.alpha = top.alpha;
    this.low = low;

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
        self.ol = self.toCanvas(low,offscreen);
    }

};

// Join a source by canvas overlay to a seadragon
J.Join.prototype.toCanvas = function(low,source) {

    var self = this;
    self.Go = function() {
        var ctx = this.context2d();
        ctx.globalAlpha = self.alpha;
        ctx.drawImage(source, ...self.window);
        this.onRedraw = self.Go;
    }

    return low.canvasOverlay({onRedraw: self.Go});
};

// Set the shape
J.Join.prototype.setShape = function(source,x,y,h,show) {

    var hw = this.shape.map(s=>s*h);
//    if (hw[0] !== 2048) return;
    this.window = [x,y,...hw];
    console.log(this.window);
    show.ok = 1;
};