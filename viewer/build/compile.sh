#!/bin/bash

echo "Compiling..."
mkdir -p js
cd js
rm -rf *
cd ..
tsc

if [ "$?" != "0" ]; then
    echo "Compilation failed"
    exit
fi

echo "Flatten js/ directory..."
./build/flatten_js_source.sh

echo "esbuild..."
./build/esbuild.sh
