#!/usr/bin/env sh
# Launch Lucky Dangle on macOS / Linux
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npm start
