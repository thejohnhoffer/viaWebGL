// ----------------------------------
//
// Promise to get or post a file
//
// ----------------------------------

function Bide(where, what) {
    return new Promise((done) => {
        var bid = new XMLHttpRequest();
        var cry = () => console.log("A bug on the web");
        var win = () => bid.status == 200 ? done(bid.response) : cry();
        bid.open(what? 'POST' : 'GET', where);
        bid.onerror = cry;
        bid.onload = win;
        bid.send(what);
    });
}