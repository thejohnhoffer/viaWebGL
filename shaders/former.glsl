attribute vec2 a_where_in_tile;
attribute vec2 a_where;

varying vec2 v_where_in_tile;

// Offset for origin
vec2 move(vec2 s) {
  return vec2(s.x*2., s.y*2.)-1.;
}
void main() {
  // Pass the overlay tiles
  v_where_in_tile = a_where_in_tile;
  gl_Position = vec4(move(a_where), 0., 1.);
}