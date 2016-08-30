var J = J || {};
//-----------------------------------
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------
window.onload = function(e){

    M = {
        view: new J.Viewer()
    };
    M.view.init();
};