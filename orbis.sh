#!/usr/bin/env sh
set -eu
npm install
npm run build
if pm2 describe orbis-backend >/dev/null 2>&1; then npm run pm2:restart; else npm run pm2:start; fi
pm2 save
