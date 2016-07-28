var J = J || {};

J.ShowCanvas = function(low,top,source) {

    var Go = function() {
        var ctx = this.context2d();
        ctx.globalAlpha = top.alpha;
        ctx.drawImage(source,...top.shape);
    }

    low.canvasOverlay({onRedraw: Go});
};