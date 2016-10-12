# Turf Async

A simple Mapbox-GL.js app demonstrating how to use Turf.js with web workers to run geoprocesses asynchronously

## Why?
Turf.js is great for doing small geoprocessing jobs in the browser. However, with larger jobs, it can freeze the browser for long periods. While the browser is waiting for the Turf process to complete, you can't pan or zoom on the map or even switch browser tabs.

With web workers we can move the geoprocessing job off the main user interface thread. This means we can still manipulate the map and switch browser tabs while we wait for the job to complete.

[Demo](https://nickpeihl.github.io/turf-async)

Notice how the dance party stops momentarily when we click the Turf Sync button? Don't let the dance party stop! Click the Turf Async button to run the process in a web worker. This frees up the user interface resources for the dance party to continue!
