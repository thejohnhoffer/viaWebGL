//-----------------------------------
//
// J.Way - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

J.Way = function(e) {
  // Terms to Lay the lower layer
  var prelaid = {
      server :   'localhost:2001',
      datapath : '/Volumes/NeuroData/mojo',
      tileSize : 512,
      minLevel : 0,
      maxLevel : 5,
      canvas   : false,
      height :   1024,
      width :    1024,
      depth :    1,
      z :        0
  };
  var layout = [
    // This binds upper and lower by Seadragon
    {   prefixUrl :             "images/",
        navigatorSizeRatio :    0.25,
        minZoomImageRatio :     0.5,
        maxZoomPixelRatio :     10,
        showNavigationControl : true,
        animationTime :         0,
        imageLoaderLimit :      3,
        timeout :               120000,
        fromLay : ['id','tileSources']    },
    // Terms to Show the upper layer
    {   alpha: 0.4,
        shadeA   : 'shaders/former.glsl',
        shadeB   : 'shaders/latter.glsl',
        fromLay : ['canvas']              }
  ];
  var lay = new this.Lay(prelaid);
  layout[1].over = [lay.over,0,0,lay.width,lay.height];
  layout.forEach((x) => this.fromLay.call(x,lay));

  lay.over.onload = this.bySea.bind(layout[0],this.how2Draw(layout[1]));
}

J.Way.prototype.fromLay = function (lay) {
  this.fromLay.forEach((s) => this[s] = lay[s])
}

J.Way.prototype.how2Draw = function(layout) {

  var canvas = function (terms) {
    this.globalAlpha = terms.alpha;
    this.drawImage.apply(this,terms.over);
  }
  var webg = function (terms) {
    var gl = document.createElement('canvas');
//    this.viewport(0, 0, this._width, this._height);
    Bide(terms.shadeA).then(a => Bide(terms.shadeB).then(b => console.log('')));
  }
  return function() {
    var draw = layout.canvas? canvas : webg;
    draw.call(this.context2d(),layout);
  }
};

J.Way.prototype.bySea = function (doRedraw) {

  var seer = OpenSeadragon(this);
  seer.innerTracker.keyDownHandler = null;
  seer.innerTracker.keyHandler = null;

  var layer = seer.canvasOverlay({onRedraw: doRedraw});
};

//-----------------------------------
//
// Lay - Create an Overlay and Tilesource
//
//-----------------------------------
J.Way.prototype.Lay = function(preterms) {

    // Change the inputs if passed as url terms
    var terms = this.doTerms( preterms, decodeURI(document.location.search.substring(1)) );
    Object.keys(preterms).forEach((str) => this[str] = terms[str] || preterms[str]);
    this.maxLevel = Math.min(this.maxLevel, Math.ceil(Math.log2(this.width/this.tileSize)));

    // Make low layer
    this.tileSources = Object.assign({},this);
    this.tileSources.getTileUrl = this.getTile.bind(this.tileSources);

    // Make high layer
    this.over = new Image();
    this.over.src = this.getTile(0,0,0)+"&segmentation=y&segcolor=y";

    // put a section in the DOM
    this.id = 'seer_' + preterms.z;
    var eye_elem = document.createElement('div');
    Object.assign(eye_elem,{className:'seers', id: this.id});
    document.body.appendChild(eye_elem);
};

J.Way.prototype.Lay.prototype.getTile = function( level, x, y ) {

  level = this.maxLevel - level;
  x *= this.tileSize;
  y *= this.tileSize;
  return "http://" + this.server + "/data/?datapath=" + this.datapath +
         "&start=" + x + "," + y + "," + this.z + "&mip=" + level +
         "&size=" + this.tileSize + "," + this.tileSize + ","+this.depth;
};

J.Way.prototype.Lay.prototype.doTerms = function( before, after ) {

  // return a string if preset is string and int if preset is int
  var clean = text => text ? text.replace(new RegExp('\/$'),'') : true;
  var read = ask => typeof before[ask[0]] === 'string' ? clean(ask[1]) : parseInt(ask[1],10);
  // Check whether the asking string has answer or has only a true/false flag
  var check = (obj, ask) => obj[ask[0]] = ask.length > 1 ? read(ask) : true;
  var deal = (obj, str) => { check(obj,str.split('=')); return obj;}
  // Deal the array into an object
  return after.split('&').reduce(deal,{});
};

window.onload = (e) => new J.Way(e);