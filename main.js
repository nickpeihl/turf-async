var work = require('webworkify');
var mapboxgl = require('mapbox-gl');
var concave = require('@turf/concave');
var geojsonhint = require('geojsonhint');
var geobuf = require('geobuf');
var Pbf = require('pbf');

var w = work(require('./worker.js'));
w.addEventListener('message', function(ev) {
    var gj = geobuf.decode(new Pbf(ev.data[1]));
    map.getSource('results').setData(gj);

});
w.addEventListener('error', function(err) {
    console.log(err);
});

mapboxgl.accessToken = 'pk.eyJ1IjoibnBlaWhsIiwiYSI6InVmU21qeVUifQ.jwa9V6XsmccKsEHKh5QfmQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v8',
    center: [-122.963104,48.569792],
    zoom: 10
});

var emptyGeoJson = {
  type: 'FeatureCollection',
  features: []
};

var dataUrl = 'assets/hydrants.geojson';

map.on('style.load', function() {
    console.log('style loaded');
    map.addSource('points', {
      type: 'geojson',
      data: dataUrl
    });

    map.addSource('results', {
      type: 'geojson',
      data: emptyGeoJson
    });

    map.addLayer({
        'id': 'points',
        'type': 'circle',
        'source': 'points'
    });

    map.addLayer({
        'id': 'results',
        'type': 'fill',
        'source': 'results',
        'paint': {
            'fill-opacity': 0.6,
            'fill-color': '#00FF00'
        }
    });
});

map.on('source.load', function() {
    console.log('source loaded');
});

addButton('Turf Sync', 'turf-sync');
addButton('Turf Async','turf-async');

function addButton(name, id) {
    var link = document.createElement('a');
    link.href = '#';
    link.id = id;
    link.className = 'active';
    link.textContent = name;

    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        switch (id) {
        case 'turf-sync':
            turfSync();
            break;
        case 'turf-async':
            turfAsync();
            break;
        }
    };
    var menu = document.getElementById('menu');
    menu.appendChild(link);
}


function turfSync() {
    map.getSource('results').setData(emptyGeoJson);
    var absUrl = window.location + dataUrl;
    makeRequest(dataUrl);
}

function makeRequest(url) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', validateData);
    req.addEventListener('error', transferFailed);
    req.open('GET', url);
    req.send();
}

function validateData() {
    var errors = geojsonhint.hint(this.responseText);
    if (errors.len > 0) {
        console.log('Errors', errors.join(', '));
    } else {
        turfIt(this.responseText);
    }
}

function transferFailed() {
    console.log('Error', this.responseText);
}

function turfIt(data) {
    var results = concave(JSON.parse(data), 0.75, 'miles');
    map.getSource('results').setData(results);
}

function turfAsync() {
    map.getSource('results').setData(emptyGeoJson);
    var absUrl = window.location + dataUrl;
    w.postMessage([absUrl]);
}
