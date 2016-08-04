// ----------------------------------
//
// Promise to get or post a file
//
// ----------------------------------

function Timing(where) {
    return new Promise(function(done){
        var bid = new XMLHttpRequest();
        var win = function(){
            if (bid.status == 200) {
                done(bid.response);
                return 0;
            }
            console.log("A bug on the web");
        };
        bid.open('GET', where, true);
        bid.onerror = win;
        bid.onload = win;
        bid.send();
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

  var logger = function(f) {
    console.log(gl.getShaderInfoLog(f));
  }

  files.map(logger);
  console.log(gl.getProgramInfoLog(shaderWork));
  return console.log("Could not start shaders");
};