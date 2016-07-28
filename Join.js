var J = J || {};

// Join webgl top with low seadragon
J.Join = function(low,top,go) {

    this.ready = function(shaders) {

        var link = go(shaders);
        var moveloop = function(){

          window.requestAnimationFrame(moveloop);
          link();
        };
        moveloop();

        if (top.debug) {
            var id = 'seer_' + 'test';
            var idiv = document.createElement('div');
            Object.assign(idiv,{className:'seer', id: id});
            document.body.appendChild(idiv);
            idiv.appendChild(top.shape[0]);
            return;
        }

        // Actually join to canvas
        new J.ShowCanvas(low,top);
    }

};