//-----------------------------------
//
// http://<host>:<port>/index.html?canvas&server=<...>&datapath=<...>
//
//-----------------------------------
window.onload = function(e){

    var kwargs = J.parse();
    M = {
        view: new J.Viewer(kwargs)
    };
    M.view.vShader = 'shaders/former.glsl';
    M.view.fShader = 'shaders/latter.glsl';
    M.view.init();
};

// Change any preset terms set in input address
J.parse = function( input, output) {
    var output = output || {};
    var input = input || document.location.search;
    var string = decodeURI(input).slice(1);
    // read as bool, string, or int
    string.split('&').map(function(pair) {
        var key = pair.split('=')[0];
        var val = pair.split('=')[1];
        switch (!val*2 + !Number(val)) {
            case 0: return output[key] = parseInt(val,10);
            case 1: return output[key] = val.replace(new RegExp('\/$'),'');
            default: return output[key] = true;
        }
    });
    return output;
};

J.copy = function(source, target) {
    for(var key in source) {
        target[key] = target[key] || source[key];
    }
    return target;
}