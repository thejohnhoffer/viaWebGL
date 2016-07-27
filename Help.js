// ----------------------------------
//
// Promise to get or post a file
//
// ----------------------------------

function Bide(where, what) {
    return new Promise((done) => {
        var bid = new XMLHttpRequest();
        var cry = () => console.log("A bug on the web");
        var win = () => bid.status == 200 ? done(bid.response) : cry();
        bid.open(what? 'POST' : 'GET', where);
        bid.onerror = cry;
        bid.onload = win;
        bid.send(what);
    });
}

// ----------------------------------
//
// Make one vertex shader then one fragment shader
//
// ----------------------------------

function Shading(files, gl) {

  var shaderWork = gl.createProgram();
  var make = function(gl, str, it) {

    var kind = it%2==0? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    var shader = gl.createShader(kind);
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    var good = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    return good? shader : console.log(gl.getShaderInfoLog(shader));
  };

  for (var i in files) {
    files[i] = make(gl, files[i], i);
    gl.attachShader(shaderWork, files[i]);
  }
  gl.linkProgram(shaderWork);

  if (gl.getProgramParameter(shaderWork, gl.LINK_STATUS)) return shaderWork;

  files.map((f) => console.log(gl.getShaderInfoLog(f)));
  console.log(gl.getProgramInfoLog(shaderWork));
  return console.log("Could not start shaders");
};