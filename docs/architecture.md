# Orbis Architektur

## Frontend

`apps/frontend` ist eine eigenständige React-/Vite-Anwendung. Sie kennt keine Datenbankzugänge und kommuniziert ausschließlich über `VITE_API_URL` mit der REST API. Anmeldung, Projekte, Aufgaben und Dokumente werden mit `credentials: include` geladen.

## Backend

`apps/backend` ist eine eigenständige Fastify-Anwendung. Routen, Authentifizierung, Rollenprüfung, Validierung und Datenbankzugriffe bleiben serverseitig getrennt. Das Backend wird direkt mit Node.js, PM2 oder im Container ausgeführt.

## MariaDB

MariaDB verwendet InnoDB und `utf8mb4_unicode_ci`. Beim Start erzeugt das Backend die Datenbank und fehlende Tabellen/Indizes idempotent. Das Schema enthält Benutzer, Projekte, Projektmitglieder, Aufgaben, Kommentare, Dokumentordner, Dokumente, Termine und Aktivitäten.

Passwörter werden mit bcrypt und Kostenfaktor 12 gespeichert. Es gibt keine E-Mail-Felder, öffentliche Registrierung oder E-Mail-Wiederherstellung. Sitzungen werden verschlüsselt in einem HttpOnly-Cookie geführt.

## Betrieb

Für Homelab-Betrieb stehen Docker Compose, ein Nginx-Frontend-Container und PM2-Konfiguration bereit. Das Frontend kann unabhängig als statisches Bundle verteilt werden; das Backend benötigt Netzwerkzugriff auf MariaDB.
