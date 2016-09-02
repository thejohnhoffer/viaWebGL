var DEMO = {};
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// DEMO for a viewer with custom shaders
*/
window.onload = function(e){
    DEMO.view = new EDGE.Viewer().init();
    DEMO.view.container.onclick = DEMO.view.init.bind(DEMO.view);
};