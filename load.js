
//--------------------------------------------
//
// Globals
//
// Settings without input as url terms as /index.html?...&...
//
var g_z = 0;                                  // &z=
var g_seg = true;                             // &no_seg
var g_width = 1024;                           // &width=
var g_height = 1024;                          // &height=
var server_name = 'viper.krash.net:2001';     // &server=
var data_path = '/home/d/data/ac3x75/mojo';   // &data_path=
var g_depth = 1;                              // &depth=
//-----------
//
// The master viewer (the one that the user is driving)
//
var g_master_viewer = null;
var g_master_seg_viewer = null;
//
// The slave viewer (ones w/o user input)
//
var g_slave_viewers = [];
//
// The previous viewer (z-1)
//
var g_prev_viewer = null;
var g_prev_seg_viewer = null;
//
// The next viewer (z+1)
//
var g_next_viewer = null;
var g_next_seg_viewer = null;

//--------------------------------------
//
// parse_args - Set up the input terms in a dictionary
//
//--------------------------------------
function parse_args() {
  // After the first ? mark, Break the search terms by each joining & sign
  var args = decodeURI(document.location.search.substring(1)).split('&');
  var clean = (str) => str ? str.replace(new RegExp('\/$'),'') : true;
  return args.reduce((obj,str) => {
    ask = str.split('=');
    obj[ask[0]] = clean(ask[1]);
    return obj;
  },{});
};

//-----------------------------------
//
// create_ts - Create a TileSource
//
//    z: the Z position of the tile
//    seg: true to load a segmentation, false to load an image
//
//-----------------------------------
function create_ts(z, seg) {
      var ts = {
          height: g_height,
          width:  g_width,
          tileSize: 512,
          minLevel: 0,
          maxLevel: Math.min(5, Math.ceil(Math.log2(g_width/512))),

          getTileUrl: function( level, x, y ){

              level = this.maxLevel - level;
              x = x*this.tileSize;
              y = y*this.tileSize;

              url = "http://" + server_name +
                     "/data/?datapath=" + data_path +
                     "&start=" + x + "," + y + "," + z +
                     "&mip=" + level +
                     "&size=" + this.tileSize + "," + this.tileSize + ",1"
              if (seg) {
                  url = url + "&segmentation=y&segcolor=y"
              }
              return url
          }
    }
    return ts;

}

//----------------------------------
//
// set_viewer_to_master - make this viewer the master viewer
//
// also unsets the old master and returns it
//----------------------------------
function set_viewer_to_master(viewer) {
  var old_master = g_master_viewer;
  if (old_master) {
    old_master.removeAllHandlers();
    var ov_elem = document.getElementById(old_master.id);
    ov_elem.style['z-index'] = 0
  }
  g_master_viewer = viewer;
  viewer.addHandler('pan', propagate_viewport);
  viewer.addHandler('zoom', propagate_viewport);
  var mv_elem = document.getElementById(g_master_viewer.id)
  mv_elem.style['z-index'] = 1;
  g_master_viewer.setVisible(true);
  return old_master;
}

//----------------------------------
//
// set_viewer_to_seg_master - make this viewer the segmentation master viewer
//
// also unsets the old master and returns it
//----------------------------------
function set_viewer_to_seg_master(viewer) {
  var old_master = g_master_seg_viewer;
  if (old_master) {
    old_master.removeAllHandlers();
    var ov_elem = document.getElementById(old_master.id);
    ov_elem.style['z-index'] = 0
  }
  g_master_seg_viewer = viewer;
  viewer.addHandler('pan', propagate_seg_viewport);
  viewer.addHandler('zoom', propagate_seg_viewport);
  var mv_elem = document.getElementById(g_master_seg_viewer.id)
  mv_elem.style['z-index'] = 2;
  g_master_seg_viewer.setVisible(true);
  return old_master;
}

//----------------------------------
//
// create_viewer - create an OpenSeadragon viewer
//
//     z: the Z position of the viewer
//     visible: true if initially visible, false if hidden
//     seg: true to display segmentation, false to display image
//
//-----------------------------------
function create_viewer(z, visible, seg) {


    // create dom element
    var container_id = null;
    var style = 'background-color:black;position:absolute;top:0px;left:0px;width:100%;height:100%';
    var z_index = 0;
    if (seg) {
      container_id = 'seg_viewer_' + z;
      style = style + ";opacity:0.5";
      z_index = 2;
    } else {
      container_id = 'viewer_' + z;
      z_index = 1;
    }
    if (! visible) {
      z_index = 0;
    }
    style = style + ";z-index:" + z_index;

    $('#viewers').append('<div id="'+container_id+'" class="viewers" style="'+style+'"></div>');

    var ts = create_ts(z, seg);
    var viewer = OpenSeadragon({
        id:            container_id,
        prefixUrl:     "images/",
        navigatorSizeRatio: 0.25,
        //mouseNavEnabled: canNavigate,
        minZoomImageRatio: 0.5,
        maxZoomPixelRatio: 10,
        showNavigationControl: true,
        animationTime: 0,
        imageLoaderLimit: 3,
        tileSources:   ts,
        timeout: 120000
      });


    is_master = visible & ! seg;
    if (is_master) {
      set_viewer_to_master(viewer);
    } else if (visible) {
      set_viewer_to_seg_master(viewer);
    } else {
      g_slave_viewers.push(viewer);
    }
    viewer.innerTracker.keyHandler = null;
    viewer.innerTracker.keyDownHandler = null;

    // viewer.addHandler('animation-finish', this.store_viewpoint.bind(this));
    // viewer.addHandler('tile-drawn', this.propagate_viewpoint.bind(this));


    return viewer;
};


//-------------------------------
//
// propagate_viewport - propagate the viewport settings from the master
//                      to all slaves
//
//-------------------------------
function propagate_viewport() {
  g_slave_viewers.forEach(function(viewer) {
      viewer.viewport.panTo(g_master_viewer.viewport.getCenter(), true);
      viewer.viewport.zoomTo(g_master_viewer.viewport.getZoom(), null, true);
  });

}

//-------------------------------
//
// propagate_seg_viewport - propagate the segmentation viewport to the master
//
//-------------------------------
function propagate_seg_viewport() {
  g_master_viewer.viewport.panTo(g_master_seg_viewer.viewport.getCenter(), true);
  g_master_viewer.viewport.zoomTo(g_master_seg_viewer.viewport.getZoom(), null, true);
}


window.onload = function() {

  var args = parse_args();
  // key defaults overwritten
  window.onkeydown = this.onkey;
  // Change the input variables if passed as arguments
  get_size = (str) => {args[str] ? parseInt(args[str],10) : false }
  server_name = args['server'] || server_name;
  data_path = args['data_path'] || data_path;
  g_height = get_size('height') || g_height;
  g_width = get_size('width') || g_width;
  g_depth = get_size('depth') || g_depth;
  g_seg = args['no_seg'] ? false: true;
  g_z = get_size('z') || g_z;

  data_path = '/home/d/data/ac3x75/mojo';

  console.log(data_path);
  create_viewer(g_z, true, false);
  if (g_seg) {
    create_viewer(g_z, true, true);
  }
  if (g_z > 0) {
      g_prev_viewer = create_viewer(g_z - 1, false, false);
      if (g_seg) {
        g_prev_seg_viewer = create_viewer(g_z - 1, false, true);
      }
  }
  if (g_z < g_depth) {
      g_next_viewer = create_viewer(g_z + 1, false, false);
      if (g_seg) {
        g_next_seg_viewer = create_viewer(g_z + 1, false, true);
      }
  }
}