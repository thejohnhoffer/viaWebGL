attribute vec2 a_tile_pos;
attribute vec2 a_where;

varying vec2 v_tile_pos;


vec2 move(vec2 s) {
  return vec2(s.x*2.-1.,s.y*2.-1.);
}
void main() {
  // Pass the overlay tiles
  v_tile_pos = a_tile_pos;
  gl_Position = vec4(move(a_where), 0., 1.);
}