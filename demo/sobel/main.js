var DEMO = {};

/*~*~*~*~*~*~*~*~*~*~*~*~*~
// DEMO for a viewer with custom shaders
*/
window.onload = function(e){

    DEMO.view = new SOBEL.Viewer();
    DEMO.view.init();
};

// Add your own button to OSD controls
DEMO.seaButton = function(osd, terms) {

    var name = terms.name || 'tool';
    var prefix = terms.prefix || '';
    terms.srcRest = terms.srcRest || prefix+name+'_rest.png';
    terms.srcHover = terms.srcHover || prefix+name+'_hover.png';
    terms.srcDown = terms.srcDown || prefix+name+'_pressed.png';
    terms.srcGroup = terms.srcGroup || prefix+name+'_grouphover.png';
    // Replace the current controls with the same controls plus a new button
    osd.clearControls().buttons.buttons.push(new OpenSeadragon.Button(terms));
    var toolbar = new OpenSeadragon.ButtonGroup({buttons: osd.buttons.buttons});
    osd.addControl(toolbar.element,{anchor: OpenSeadragon.ControlAnchor.TOP_LEFT});
}