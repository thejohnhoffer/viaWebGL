var J = J || {};

J.Join = function(see,draw,go) {

    this.ready = function(shaders) {

        var link = go(shaders);
        var moveloop = function(){

          window.requestAnimationFrame(moveloop);
          link();
        };
        moveloop();

        new J.ShowCanvas(see,draw);
    }

};