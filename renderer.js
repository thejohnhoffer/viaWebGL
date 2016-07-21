var J = J || {};

J.offscreen_renderer = function(viewer) {

  this._viewer = viewer;
  this._canvas = this._viewer._offscreen_buffer;
  this._controller = this._viewer._controller;

  this._gl = null;

  this._program = null;
  this._texture_order = [];
  this._texture_info = {};

  this._square_buffer = null;
  this._uv_buffer = null;

  this._width = this._canvas.width;
  this._height = this._canvas.height;

  this._merge_table_changed = true;

};

J.offscreen_renderer.prototype.init = function(vs_id, fs_id) {

  var canvas = this._canvas;
  var gl = canvas.getContext('experimental-webgl') || canvas.getContext('webgl');

  if (!gl) {
    return false;
  }

  gl.viewport(0, 0, this._width, this._height);
  gl.clearColor(0,0,0,1.);
  gl.clearDepth(0);

  // enable transparency
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // create shaders
  this._program = linkShaders(gl, vs_id, fs_id);
  var h = this._program;
  if (!h) {
    return false;
  }
  gl.useProgram(h);

  // List uniform variables and attributes
  var uniforms = ['uTextureSampler','uColorMapSampler','uMergeTableKeySampler','uMergeTableValueSampler','uLockTableSampler','uImageSampler'];
  uniforms = uniforms.concat(['uOpacity','uHighlightedId','uActivatedId','uSplitMode','uAdjustMode','uMaxColors','uBorders']);
  uniforms = uniforms.concat(['uOnlyLocked','uMergeTableEnd','uMergeTableLength','uLockTableLength','uShowOverlay']);
  var attributes = ['aPosition','aTexturePosition'];

  // Store uniform variables and atributes
  uniforms.map(s => this['h_'+s] = gl.getUniformLocation(h,s) );
  attributes.map(s => this['h_'+s] = gl.getAttribLocation(h,s) );

  // Specify names of textures with corresponding samplers
  this._texture_order = ['_segmentation_texture','_colormap_texture','_merge_table_keys','_merge_table_values','_lock_table','_image_texture'];
  this._texture_order.map( (v,i) => this._texture_info[v] = {filter: 'NEAREST', flip :true} );
  this._tex_map = this._texture_order.map( (v,i) => [ v, 'h_'+uniforms[i], 'TEXTURE'+i.toString() ] );

  // create geometry
  this._square_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._square_buffer);
  var vertices = new Float32Array([
    -1, -1., 0.,
     1., -1., 0.,
    -1.,  1., 0.,
    1.,  1., 0.
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  this._gl = gl;

  this.init_buffers();

  return true;

};

J.offscreen_renderer.prototype.init_buffers = function() {

  var gl = this._gl;

  this._texture_info['_lock_table'].flip = false;
  this._texture_info['_merge_table_keys'].flip = false;
  this._texture_info['_image_texture'].filter = 'LINEAR';

  for ( tex in this._texture_info) {

    var val = this._texture_info[tex]
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, val.flip);

    this[tex] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this[tex]);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[val.filter]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[val.filter]);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  // u-v
  this._uv_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._uv_buffer);
  var uvs = new Float32Array([
    0., 0.,
    1., 0.,
    0., 1.,
    1., 1.
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

};

J.offscreen_renderer.prototype.draw = function(i, s, c, x, y) {

  var gl = this._gl;

  gl.viewport(0, 0, this._width, this._height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  if (this._controller._gl_colormap_changed) {

    // update colormap texture buffer
    gl.bindTexture(gl.TEXTURE_2D, this._colormap_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this._viewer._max_colors, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, this._viewer._gl_colormap);

    this._controller._gl_colormap_changed = false;

  }

  // create segmentation texture buffer
  gl.bindTexture(gl.TEXTURE_2D, this._segmentation_texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, s);


  // create image texture buffer
  gl.bindTexture(gl.TEXTURE_2D, this._image_texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);


  //
  // MERGE TABLE
  //
  var merge_table_length = this._controller._merge_table_length;
  var merge_table_end = this._controller._merge_table_end;

  if (this._controller._gl_merge_table_changed) {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    gl.bindTexture(gl.TEXTURE_2D, this._merge_table_keys);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, merge_table_length, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this._controller._gl_merge_table_keys);

    gl.bindTexture(gl.TEXTURE_2D, this._merge_table_values);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, merge_table_length, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this._controller._gl_merge_table_values);

    this._controller._gl_merge_table_changed = false;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  }

  //
  // LOCK TABLE
  //
  var lock_table_length = this._controller._lock_table_length;

  if (this._controller._gl_lock_table_changed) {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    gl.bindTexture(gl.TEXTURE_2D, this._lock_table);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lock_table_length, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this._controller._gl_lock_table);

    this._controller._gl_lock_table_changed = false;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  }

  // now really draw
  gl.enableVertexAttribArray(this.h_aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, this._square_buffer);
  gl.vertexAttribPointer(this.h_aPosition, 3, gl.FLOAT, false, 0, 0);

  // some values
  gl.uniform1f(this.h_uActivatedId, this._viewer._controller._activated_id);
  gl.uniform1f(this.h_uHighlightedId, this._viewer._controller._highlighted_id);
  gl.uniform1f(this.h_uOpacity, this._viewer._overlay_opacity);
  gl.uniform1f(this.h_uMaxColors, this._viewer._max_colors);
  gl.uniform1i(this.h_uBorders, this._viewer._overlay_borders);
  gl.uniform1i(this.h_uOnlyLocked, this._viewer._only_locked);

  gl.uniform1i(this.h_uSplitMode, this._viewer._controller._split_mode);
  gl.uniform1i(this.h_uAdjustMode, this._viewer._controller._adjust_mode);

  gl.uniform1i(this.h_uMergeTableEnd, merge_table_end);
  gl.uniform1i(this.h_uMergeTableLength, merge_table_length);
  gl.uniform1i(this.h_uLockTableLength, lock_table_length);
  gl.uniform1i(this.h_uShowOverlay, this._viewer._overlay_show);

  // Add all the textures to the shaders
  this._tex_map.forEach(function(tm,i){
    gl.activeTexture(gl[tm[2]]);
    gl.bindTexture(gl.TEXTURE_2D, this[tm[0]]);
    gl.uniform1i(this[tm[1]], i);
  },this)

  gl.enableVertexAttribArray(this.h_aTexturePosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, this._uv_buffer);
  gl.vertexAttribPointer(this.h_aTexturePosition, 2, gl.FLOAT, false, 0, 0);  

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  c.drawImage(this._canvas,0,0,512,512,x*512,y*512,512,512);

};