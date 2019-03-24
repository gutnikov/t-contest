#!/usr/bin/env bash
rm -fr dist
mkdir dist
touch dist/bundle.js

./node_modules/.bin/babel src/base.js >> dist/bundle.js
./node_modules/.bin/babel src/theme.js >> dist/bundle.js
./node_modules/.bin/babel src/buttons.js >> dist/bundle.js
./node_modules/.bin/babel src/ruler.js >> dist/bundle.js
./node_modules/.bin/babel src/canvas.js >> dist/bundle.js
./node_modules/.bin/babel src/app.js >> dist/bundle.js
./node_modules/.bin/terser --compress -- dist/bundle.js > dist/bundle.minified.js

