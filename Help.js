// Change any preset terms set in input address
function getInput( before ) {
    var after = decodeURI(document.location.search.substring(1));
    // read as bool, string, or int
    var read = function(ask) {
        if (!ask[1]) {
            return true;
        }
        // read as string if the preset is a string
        if (typeof before[ask[0]] === 'string') {
            var clean = new RegExp('\/$');
            return ask[1].replace(clean,'');
        }
        return parseInt(ask[1],10);
    }
    // Assign each term to a key
    var deal = function(obj, str) {
        var ask = str.split('=');
        obj[ask[0]] = read(ask);
        return obj;
    }
    // Deal the terms into a single object
    return Object.assign( before, after.split('&').reduce(deal,{}) );
};