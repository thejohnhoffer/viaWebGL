attribute vec4 a_where;
attribute vec2 a_where_tile;
varying vec2 v_where_tile;

void main() {
  // Pass the overlay tiles
  v_where_tile = a_where_tile;
  gl_Position = a_where;
}