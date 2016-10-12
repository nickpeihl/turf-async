var concave = require('@turf/concave');
var geojsonhint = require('geojsonhint');
var geobuf = require('geobuf');
var Pbf = require('pbf');

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
        var results = concave(JSON.parse(data), 0.75, 'miles');
        var buf = geobuf.encode(results, new Pbf());
        self.postMessage(['Done', buf]);
    };
};
