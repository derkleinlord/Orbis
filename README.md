# Orbis

Orbis verbindet Projektmanagement, Aufgaben und interne Dokumentation in einer ruhigen, responsiven Arbeitsumgebung.

## Enthaltene erste Version

- Anmeldung nur mit Benutzername und Passwort, ohne E-Mail-Flows
- Rollenmodell für Administrator, Projektleiter, Mitglied und Gast
- Dashboard mit Projekten, Aufgaben, Terminen und Aktivitäten
- Projektübersicht mit Fortschritt und Team
- Aufgabenliste und Kanban-Board mit Drag-and-drop
- Hierarchische Dokumentation mit Editor und Autosave-Feedback
- Monatskalender, globale Suche und Benutzeradministration
- Persönliche Einstellungen sowie heller und dunkler Modus
- Relationales D1-Schema für Benutzer, Sitzungen, Projekte, Aufgaben, Kommentare, Dokumente, Termine und Aktivitäten

## Entwicklung

Voraussetzung ist Node.js 22.13 oder neuer.

```bash
npm install
npm run dev
```

Der lokale Demo-Zugang lautet `dennis` / `orbis2026`. Das bereitgestellte Administratorkonto muss bei einer echten Inbetriebnahme unmittelbar ein neues Passwort erhalten.

## Architektur

Die Oberfläche liegt in `app/`. Server-Endpunkte befinden sich getrennt unter `app/api/`; Datenbankzugriffe und Schema liegen in `db/`, versionierte Migrationen in `drizzle/`. Sicherheitsentscheidungen, Passwortprüfung und Sitzungsanlage erfolgen serverseitig. Die vollständige Architektur ist in `docs/architecture.md` beschrieben.

## Qualität

```bash
npm run build
npm run lint
```
