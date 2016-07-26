var J = J || {};

J.Show = function(given) {

  var canvas = given[0].appendChild(document.createElement('canvas'));
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  canvas.className = 'seer';
  var got = given[1];

  this.standard = {
      square : [gl.ARRAY_BUFFER,Float32Array.from('00100111'),gl.STATIC_DRAW],
      kind : [2, gl.FLOAT, false, 0, 0],
      plan : [gl.TRIANGLE_STRIP, 0, 4],
      take : given[2]
  }
  // Wait a bit to load both shaders
  var shady = [Bide(got.sh0), Bide(got.sh1)];
  Promise.all(shady).then(sh => this.Start.call(this.standard,gl,sh));
};

// Link up the Show with the shaders
J.Show.prototype.Start = function(gl,sh) {

    var linker = Shade(gl,sh);
    var buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(...this.square);
    gl.useProgram(linker);

    for (t in this.take) {
      var token = [gl.getAttribLocation(linker,this.take[t]), ...this.kind];
      gl.enableVertexAttribArray(token[0]);
      gl.vertexAttribPointer(...token);
    }

    gl.drawArrays(...this.plan);
}
