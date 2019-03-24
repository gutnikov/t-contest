#!/usr/bin/env bash
rm -fr dist
./node_modules/.bin/babel src -d dist
cat dist/base.js >> dist/bundle.js
#cat dist/theme.js >> dist/bundle.js
cat dist/buttons.js >> dist/bundle.js
cat dist/ruler.js >> dist/bundle.js
cat dist/canvas.js >> dist/canvas.js
cat dist/app.js >> dist/bundle.js
./node_modules/.bin/terser --compress --mangle -- dist/bundle.js > dist/app.minified.js

