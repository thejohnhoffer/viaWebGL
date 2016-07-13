
//--------------------------------------------
//
// Globals
//
// Settings without input as url terms as /index.html?...&...
//
var g_z = 0;                                  // &z=
var g_width = 1024;                           // &width=
var g_height = 1024;                          // &height=
var server_name = 'viper.krash.net:2001';     // &server=
var data_path = '/home/d/data/ac3x75/mojo';   // &datapath=
var g_depth = 1;                              // &depth=
//--------------------------------------------
//
// The master viewer (the one that the user is driving)
//
var g_tileSize = 512;
var g_master_viewer = null;
var g_maxLevel = Math.min(5, Math.ceil(Math.log2(g_width/g_tileSize)));
var g_minLevel = 0;

//--------------------------------------
//
// parse_args - Set the input terms in a dictionary
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

function getTileUrl( level, x, y ){

    level = g_maxLevel - level;
    x *= g_tileSize;
    y *= g_tileSize;

    return "http://" + server_name + "/data/?datapath=" + data_path +
           "&start=" + x + "," + y + "," + g_z + "&mip=" + level +
           "&size=" + g_tileSize + "," + g_tileSize + ",1";
};

//-----------------------------------
//
// create_ol - Create an Overlay and Tilesource
//
//-----------------------------------
function create_ol(handler) {

    ts = {
        height: g_height,
        width:  g_width,
        tileSize: g_tileSize,
        minLevel: g_minLevel,
        maxLevel: g_maxLevel,
        getTileUrl: getTileUrl
    }
    overlaid = new Image();
    overlaid.src = getTileUrl(0,0,0)+"&segmentation=y&segcolor=y";
    overlaid.onload = () => {
        handler(ts, overlaid);
    };
};

//----------------------------------
//
// create_viewer - create an OpenSeadragon viewer
//
//     z: the Z position of the viewer
//     visible: true if initially visible, false if hidden
//     seg: true to display segmentation, false to display image
//
//-----------------------------------
function create_viewer(ts,ol) {

    // create dom element
    var container_id = 'viewer_' + g_z;
    var style = 'background-color:black;position:absolute;top:0px;left:0px;width:100%;height:100%';
    var vielem = document.createElement('div');
    vielem.style.cssText = style;
    vielem.className = 'viewers';
    vielem.id = container_id;
    document.getElementById('viewers').appendChild(vielem);

    // Join tiles and overlays
    bind_sea(ts,ol,container_id);
    g_master_viewer.innerTracker.keyHandler = null;
    g_master_viewer.innerTracker.keyDownHandler = null;
};

//-----------------------------------
//
// bind_sea = Bind Overlay to Tilesource
//
//-----------------------------------
function bind_sea(ts,ol,container_id) {

  g_master_viewer = OpenSeadragon({
      id:            container_id,
      prefixUrl:     "images/",
      navigatorSizeRatio: 0.25,
      minZoomImageRatio: 0.5,
      maxZoomPixelRatio: 10,
      showNavigationControl: true,
      animationTime: 0,
      imageLoaderLimit: 3,
      tileSources:   ts,
      timeout: 120000
  });

  var overlay = this.g_master_viewer.canvasOverlay({
    onRedraw: () => {
      overlay.context2d().globalAlpha = 0.4;
      overlay.context2d().drawImage(ol,0,0,g_width,g_height)
    },
    clearBeforeRedraw:true
  });

//   var raw_s = new Zlib.Inflate(new Uint8Array(ol)).decompress();
  var a = new Uint8Array(ol)
};

window.onload = function() {

  var args = parse_args();
  // key defaults overwritten
  window.onkeydown = this.onkey;
  // Change the input variables if passed as arguments
  get_size = (str) => {args[str] ? parseInt(args[str],10) : false }
  server_name = args['server'] || server_name;
  data_path = args['datapath'] || data_path;
  g_height = get_size('height') || g_height;
  g_width = get_size('width') || g_width;
  g_depth = get_size('depth') || g_depth;
  g_z = get_size('z') || g_z;

  // Make image data
  create_ol(create_viewer);
};