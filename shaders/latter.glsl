precision mediump float;
uniform sampler2D u_tiler;
varying vec2 v_tile_pos;

//
// FLOAT COMPARE FUNCTIONS WITH DELTA
//
bool equals(vec4 id1, vec4 id2) {
  return all(equal(id1,id2));
}

//
// calculate the color of sampler at an offset from position
//
vec4 offset(sampler2D sam, vec2 pos, vec2 off) {
  // calculate the color of sampler at an offset from position
  return texture2D(sam, vec2(pos.x + off.x/512., pos.y + off.y/512.));
}

//
// Check whether nearby positions are the same
//
vec4 borders(sampler2D sam, vec2 pos) {
  // calculate the color of sampler at an offset from position
  vec4 here_id = offset(sam,pos,vec2(0.0,0.0));
  bool left = equals(here_id, offset(sam,pos,vec2(-1.0,0.0)));
  bool right = equals(here_id, offset(sam,pos,vec2(1.0,0.0)));
  bool down = equals(here_id, offset(sam,pos,vec2(0.0,-1.0)));
  bool top = equals(here_id, offset(sam,pos,vec2(0.0,1.0)));

  // If any are false, return false TODO: optimize
  if (!left || !right || !down || !top) {
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
  return texture2D(sam,pos);
}


void main() {
  gl_FragColor = borders(u_tiler, v_tile_pos);
}