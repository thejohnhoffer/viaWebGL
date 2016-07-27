attribute vec2 a_tile;
attribute vec2 a_where;

varying vec2 v_tile;
 
void main() {
  // Pass the overlay tiles
  v_tile = a_tile;
  gl_Position = vec4(a_where, 0, 1);
}