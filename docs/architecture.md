# Orbis Architektur

## Schichten

1. **Frontend:** React-Komponenten, Navigation und produktive Arbeitsansichten in `app/`.
2. **REST API:** serverseitige Route Handler in `app/api/`; sie bilden die einzige Grenze für schreibende Client-Zugriffe.
3. **Domäne und Datenzugriff:** Drizzle-Schema und D1-Zugriff in `db/`.
4. **Persistenz:** relationale SQLite/D1-Tabellen und versionierte SQL-Migrationen in `drizzle/`.

Die Vinext-Struktur hält Client- und Servercode in getrennten Modulen, wird als Cloudflare-kompatibles ESM-Bundle gebaut und lässt sich später in getrennte Deployments überführen, ohne das Domänenmodell zu ändern.

## Sicherheit

- Benutzer werden ausschließlich durch Administratoren angelegt; es existiert keine öffentliche Registrierung.
- Passwörter werden mit PBKDF2-SHA-256, individuellen Salts und 210.000 Iterationen geprüft.
- Sitzungskennungen werden kryptografisch erzeugt und ausschließlich als `HttpOnly`, `Secure`, `SameSite=Strict` Cookie gespeichert.
- Status und Rolle werden serverseitig geladen; deaktivierte Benutzer können keine Sitzung erhalten.
- Neue Endpunkte müssen Rollen- und Projektmitgliedschaft serverseitig prüfen.

## Datenmodell

Das relationale Modell umfasst `users`, `sessions`, `projects`, `project_members`, `tasks`, `comments`, `document_folders`, `documents`, `calendar_events` und `activities`. Indizes decken die zentralen Listen-, Status-, Fälligkeits- und Aktivitätsabfragen ab.

## Nächste Ausbaustufe

Die erste Version hält Integrationen, Webhooks, API-Tokens, Automatisierungen, Gantt, Zeiterfassung, Reporting und KI bewusst außerhalb des Kerns. Erweiterungen werden als neue API- und Domänenmodule ergänzt.
