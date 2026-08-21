#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_DIR="$SCRIPT_DIR"
cd "$PROJECT_DIR"

for command_name in node npm pm2 nginx systemctl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Fehler: $command_name wurde nicht gefunden." >&2
    exit 1
  fi
done

NODE_VERSION="$(node -p 'process.versions.node')"
NODE_SUPPORTED="$(
  node -p '
    const [major, minor] = process.versions.node.split(".").map(Number);
    Number(major > 22 || (major === 22 && minor >= 12));
  '
)"

if [[ "$NODE_SUPPORTED" != "1" ]]; then
  echo "Fehler: Node.js 22.12 oder neuer wird benötigt." >&2
  echo "Installiert ist: v$NODE_VERSION" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Fehler: $PROJECT_DIR/.env fehlt." >&2
  echo "Erstelle sie mit: cp .env.example .env" >&2
  exit 1
fi

echo "Installiere die im Lockfile festgelegten Abhängigkeiten ..."
npm ci --include=dev

echo "Erstelle Backend und Frontend für die Produktion ..."
npm run build

BACKEND_ENTRY="$PROJECT_DIR/apps/backend/dist/server.js"
FRONTEND_ENTRY="$PROJECT_DIR/apps/frontend/dist/index.html"

for build_file in "$BACKEND_ENTRY" "$FRONTEND_ENTRY"; do
  if [[ ! -f "$build_file" ]]; then
    echo "Fehler: Build-Datei fehlt: $build_file" >&2
    exit 1
  fi
done

echo "Starte oder aktualisiere das Orbis-Backend ..."
if pm2 describe orbis-backend >/dev/null 2>&1; then
  pm2 restart orbis-backend --update-env
else
  pm2 start "$BACKEND_ENTRY" \
    --name orbis-backend \
    --cwd "$PROJECT_DIR/apps/backend" \
    --interpreter node
fi

pm2 save

echo "Prüfe die Nginx-Konfiguration ..."
if [[ "$EUID" -eq 0 ]]; then
  nginx -t
  systemctl reload nginx
else
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "Orbis wurde erfolgreich gebaut und neu gestartet."
