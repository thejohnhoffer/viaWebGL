precision mediump float;
uniform sampler2D u_tile;
uniform vec2 u_tile_size;
varying vec2 v_tile_pos;

// Sum a vector
float sum3(vec3 v) {
  return dot(v,vec3(1));
}

// Weight of a matrix
float weigh3(mat3 m) {
  return sum3(m[0])+sum3(m[1])+sum3(m[2]);
}

// calculate the outer product
mat3 outer3(vec3 c, vec3 r) {
  return mat3(c[0]*r,c[1]*r,c[2]*r);
}

//
// Sample the color at offset
//
vec4 rgba(float dx, float dy) {
  // calculate the color of sampler at an offset from position
  return texture2D(u_tile, v_tile_pos+vec2(dx,dy));
}
// Sample offset in monochrome
float mono(float dx, float dy) {
  return sum3(rgba(dx, dy).rgb);
}

//
// Check whether nearby positions are the same
//
mat3 borders(mat3 kernel) {
  // Get monochrome of nearest pixels
  mat3 nearby;
  vec2 u = vec2(1./u_tile_size.x, 1./u_tile_size.y);
  nearby[0] = vec3(mono(-u.x,-u.y),mono(0.0,-u.y),mono(+u.x,-u.y));
  nearby[1] = vec3(mono(-u.x, 0.0),mono(0.0, 0.0),mono(+u.x, 0.0));
  nearby[2] = vec3(mono(-u.x,+u.y),mono(0.0,+u.y),mono(+u.x,+u.y));

  // convolve the kernel with the nearest pixels
  return matrixCompMult(nearby,kernel);
}


void main() {
  vec3 mean = vec3(1,2,1);
  vec3 slope = vec3(-1,0,1);
  mat3 sobelX = outer3(mean,slope);
  mat3 sobelY = outer3(slope,mean);
  float edgeX = weigh3(borders(sobelX));
  float edgeY = weigh3(borders(sobelY));

  float mixed = length(vec2(edgeX,edgeY));
  gl_FragColor = vec4(vec3(mixed),1);
}