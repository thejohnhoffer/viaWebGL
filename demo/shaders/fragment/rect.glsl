precision mediump float;
uniform vec2 u_tile_where;
uniform vec2 u_tile_shape;
uniform sampler2D u_tile;
varying vec2 v_tile_pos;

void main() {

  vec2 where = u_tile_where + u_tile_shape*v_tile_pos;

  gl_FragColor = vec4(0., where.y, where.x, 1.);
}