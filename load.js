//-----------------------------------
//
// way - test webGL overlay atop OpenSeaDragon
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------

way = function(e) {
  var preset = [
    {
      server :   'viper.krash.net:2001',
      datapath : '/home/d/data/ac3x75/mojo',
      tileSize : 512,
      minLevel : 0,
      maxLevel : 5,
      canvas   : false,
      height :   1024,
      width :    1024,
      depth :    1,
      z :        0
    },
    {
      prefixUrl :             "images/",
      navigatorSizeRatio :    0.25,
      minZoomImageRatio :     0.5,
      maxZoomPixelRatio :     10,
      showNavigationControl : true,
      animationTime :         0,
      imageLoaderLimit :      3,
      timeout :               120000
    }
  ];
  var lay = new this.Lay(preset);
  var doRedraw = function() {
    this.context2d().globalAlpha = 0.4;
    this.context2d().drawImage(lay.over,0,0,lay.width,lay.height);
  }
  lay.over.onload = lay.bindSea.bind(lay.seaTerms,doRedraw);
}
//-----------------------------------
//
// Lay - Create an Overlay and Tilesource
//
//-----------------------------------
way.prototype.Lay = function(preterms) {

    // Change the inputs if passed as url terms
    var terms = this.doTerms( preterms[0], decodeURI(document.location.search.substring(1)) );
    Object.keys(preterms[0]).forEach((str) => this[str] = terms[str] || preterms[0][str]);
    this.maxLevel = Math.min(this.maxLevel, Math.ceil(Math.log2(this.width/this.tileSize)));

    // Make low layer
    var base = new Object();
    this.id = 'seer_' + preterms.z;
    Object.assign(base,this).getTileUrl = this.getTile.bind(base);

    // Make high layer
    this.over = new Image();
    this.over.src = this.getTile(0,0,0)+"&segmentation=y&segcolor=y";
    this.seaTerms = Object.assign(preterms[1], {id: this.id, tileSources: base});

    // put a section in the DOM
    var eye_elem = document.createElement('div');
    Object.assign(eye_elem,{className:'seers', id:this.id});
    document.body.appendChild(eye_elem);
};

way.prototype.Lay.prototype.bindSea = function (doRedraw) {

  var seer = OpenSeadragon(this);
  seer.innerTracker.keyDownHandler = null;
  seer.innerTracker.keyHandler = null;

  var layer = seer.canvasOverlay({onRedraw: doRedraw});
};

way.prototype.Lay.prototype.getTile = function( level, x, y ) {

    level = this.maxLevel - level;
    x *= this.tileSize;
    y *= this.tileSize;
    return "http://" + this.server + "/data/?datapath=" + this.datapath +
           "&start=" + x + "," + y + "," + this.z + "&mip=" + level +
           "&size=" + this.tileSize + "," + this.tileSize + ","+this.depth;
};

way.prototype.Lay.prototype.doTerms = function( before, after ) {

  var clean = (text) => text ? text.replace(new RegExp('\/$'),'') : true;
  var read = (keys, ask) => typeof keys[ask[0]] === 'string' ? clean(ask[1]) : parseInt(ask[1],10);
  var check = (obj, ask) => obj[ask[0]] = ask.length > 1 ? read(before, ask) : true;
  var deal = (obj, str) => { check(obj,str.split('=')); return obj;}
  return after.split('&').reduce(deal,{});
};

window.onload = (e) => new way(e);