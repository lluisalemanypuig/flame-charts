#!/bin/bash

function apply_esbuild() {
    esbuild $1 --bundle --outfile=bdl__$1
}

cd js

apply_esbuild canvas.js
apply_esbuild main.js
apply_esbuild parse_json.js
apply_esbuild reading.js
apply_esbuild rendering.js

cd ..
