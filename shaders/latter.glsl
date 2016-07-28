precision mediump float;
uniform sampler2D u_tiler;
varying vec2 v_tile_pos;

void main() {
  gl_FragColor = texture2D(u_tiler, v_tile_pos);
}