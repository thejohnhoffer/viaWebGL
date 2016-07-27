var J = J || {};

J.ShowCanvas = function(see,draw) {

    var Go = function() {
        var ctx = this.context2d();
        ctx.globalAlpha = draw.alpha;
        ctx.drawImage(...draw.shape);
    }

    see.canvasOverlay({onRedraw: Go});
};