var SCOPE = {};
//-----------------------------------
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------
window.onload = function(e){

    SCOPE.view = new DOJO.Viewer().init();
};