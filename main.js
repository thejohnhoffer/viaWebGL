//-----------------------------------
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------
window.onload = function(e){

    // View by passing any new div name
    var view = new J.Viewer('viaWebGL');
    view.getInput(document.location.search);

    // Add more needed openSeaDragon properties to all the viewer's tiles
    var max_max = Math.ceil(Math.log2(view.tile.width/view.tile.size));
    view.tile.maxLevel = Math.min(view.tile.mip, max_max);
    view.tile.tileSize = view.tile.size;

    // Initialize
    view.start();
};