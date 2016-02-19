var concave = require('turf-concave');
var geojsonhint = require('geojsonhint');
var geobuf = require('geobuf');
var Pbf = require('pbf');

debugger;

module.exports = function(self) {
    self.addEventListener('message', function(ev) {
        var dataUrl = ev.data[0];
        self.makeRequest(dataUrl);
    });

    self.makeRequest = function(url) {
        var req = new XMLHttpRequest();
        req.addEventListener('load', self.validateData);
        req.addEventListener('error', self.transferFailed);
        req.open('GET', url);
        req.send();
    };

    self.validateData = function() {
        var errors = geojsonhint.hint(this.responseText);
        if (errors.len > 0) {
            self.postMessage(['Errors', errors.join(', ') ]);
        } else {
            self.turfIt(this.responseText);
        }
    };

    self.transferFailed = function() {
        self.postMessage(['Error', this.responseText]);
    };

    self.turfIt = function(data) {
        var results = concave(JSON.parse(data), 1, 'miles');
        var pbf = new Pbf(geobuf.encode(results, new Pbf()));
        /* The pbf does not contain the readFields method when called via
         the web worker. However, I can set a breakpoint on the line below,
         then rewrite the above line using a different variable (e.g. pbf2).
         The pbf2 variable does contain the readFields method. I believe this
         is due to the scope of the pbf buffer existing in the browser, but not
         in the web worker. Possibly releated to this issue
         (https://github.com/substack/webworkify/issues/14).
        */
        self.postMessage(['Done', pbf]);
    };
};
