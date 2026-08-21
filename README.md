# Orbis

Orbis vereint Projektmanagement, Aufgabenverwaltung und interne Dokumentation. Die Anwendung folgt derselben klaren Monorepo-Struktur wie `dkl-homelab`: eigenständiges React-Frontend, eigenständiges Fastify-Backend und MariaDB als relationale Datenbank.

## Projektstruktur

```text
orbis/
├── apps/
│   ├── frontend/          # React, TypeScript, Vite
│   │   ├── public/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── backend/           # Fastify REST API
│       ├── src/
│       │   ├── config/
│       │   ├── db/
│       │   ├── middleware/
│       │   └── routes/
│       ├── Dockerfile
│       └── package.json
├── deploy/nginx/
├── docs/
├── .env.example
├── docker-compose.yml
├── ecosystem.config.cjs
├── orbis.sh
└── package.json
```

## Lokale Entwicklung

Voraussetzungen: Node.js 22+ und MariaDB 11+.

```bash
cp .env.example .env
npm install
npm run dev
```

- Frontend: http://localhost:5173
- REST API: http://localhost:4010/api
- Healthcheck: http://localhost:4010/api/health

Beim ersten Start legt das Backend Datenbank, Tabellen, Administratorkonto und Beispieldaten an. Die Bootstrap-Zugangsdaten kommen ausschließlich aus `.env`.
Das Passwort des Bootstrap-Administrators wird bei einem Backend-Neustart mit `BOOTSTRAP_ADMIN_PASSWORD` synchronisiert.

## Docker Compose

```bash
cp .env.example .env
docker compose up --build -d
```

Danach ist Orbis unter http://localhost:8080 erreichbar. MariaDB-Daten liegen dauerhaft im Volume `orbis_mariadb`.

## Nginx und Domain

Die produktive Konfiguration für `orbis.dkl-lab.eu` liegt unter `deploy/nginx/orbis.dkl-lab.eu.conf.example`. Sie liefert das gebaute Frontend aus `/var/www/orbis/apps/frontend/dist` aus und leitet `/api/` an das Backend auf Port 4000 weiter. HTTP wird auf HTTPS umgeleitet; die Zertifikatspfade sind für Certbot/Let's Encrypt vorbereitet.

## Produktion mit PM2

```bash
chmod +x orbis.sh
./orbis.sh
```

Das Deploy-Skript prüft Node.js, `.env`, Build-Ausgaben und Nginx, startet `orbis-backend` direkt über PM2 und lädt Nginx erst nach einem erfolgreichen Konfigurationstest neu.

Vor der Inbetriebnahme müssen `DB_PASSWORD`, `SESSION_SECRET` und `BOOTSTRAP_ADMIN_PASSWORD` in `.env` durch sichere Werte ersetzt werden.
PM2 und die Docker-Images setzen `NODE_ENV` für die jeweilige Laufzeit selbst. Das Vite-Frontend liest die Backend-`.env` im Projektstamm nicht ein.

## Qualität

```bash
npm run typecheck
npm run build
npm test
```
