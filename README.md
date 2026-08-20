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
- REST API: http://localhost:4000/api
- Healthcheck: http://localhost:4000/api/health

Beim ersten Start legt das Backend Datenbank, Tabellen, Administratorkonto und Beispieldaten an. Die Bootstrap-Zugangsdaten kommen ausschließlich aus `.env`.

## Docker Compose

```bash
cp .env.example .env
docker compose up --build -d
```

Danach ist Orbis unter http://localhost:8080 erreichbar. MariaDB-Daten liegen dauerhaft im Volume `orbis_mariadb`.

## Produktion mit PM2

```bash
chmod +x orbis.sh
./orbis.sh
```

Vor der Inbetriebnahme müssen `DB_PASSWORD`, `SESSION_SECRET` und `BOOTSTRAP_ADMIN_PASSWORD` in `.env` durch sichere Werte ersetzt werden.

## Qualität

```bash
npm run typecheck
npm run build
npm test
```
