# Ward Notes: offline-first patient records
HTML5 PWA + Java Spring Boot + SQL (H2 by default, PostgreSQL optional).
Clinics with unreliable internet keep working. Edits are saved on the device, then synced and merged when the connection returns.

## Run (3 steps)
1. Install JDK 17+ and Maven 3.9+ (`java -version`, `mvn -version`).
2. In this folder: `mvn spring-boot:run`
3. Open http://localhost:8080 in Chrome or Edge. No database install needed (data is stored in `./data`).

## Demo script for your viva
1. Add two patients. The pill turns green: Online, 0 pending.
2. Tick **Simulate offline** (or stop the server). Edit a patient and add another. Rows show "pending". Reload the page: it still opens (Service Worker) and your data is still there (IndexedDB).
3. Conflict demo: open the app in a second browser (or a private window). Both go offline. Device A changes Phone, device B changes Phone and Notes. Reconnect A, then B.
   B's Notes merges cleanly (different field). The Phone clash appears under "Conflicts resolved".
4. Open http://localhost:8080/api/audit to show the server-side audit trail.

## How it works
| Piece | Where | What it does |
|---|---|---|
| IndexedDB | `static/app.js` | Local database on the device. UUIDs are created client-side so records can be created offline. |
| Service Worker | `static/sw.js` | Caches the app shell so it opens offline. Handles the Background Sync event. |
| PWA manifest | `static/manifest.json` | Makes the app installable. |
| Sync protocol | `POST /api/sync` | Client sends changed fields plus the base copy it last saw. Server returns merged records and everything changed since its cursor. |
| Conflict rule | `SyncService.java` | Field-level merge. Untouched on server: apply. Changed on both: last write wins, and the conflict is reported and audited. |
| Soft delete | `deleted` flag | Deletions sync like any other change. |
| SQL | JPA entities | `patients` and `audit_log` tables created automatically by Hibernate. |

## Use PostgreSQL instead of H2
Edit `src/main/resources/application.properties` (instructions inside), create the database `medcare_hms`, run again.

## Known limits (good viva answers)
- Last-write-wins compares the device clock with the server clock, so skewed clocks can pick the wrong winner. A fix is hybrid logical clocks.
- Only the Patient entity syncs. Appointments and billing follow the same pattern (add an entity with `rev`/`syncSeq`/`deleted`).
- No login or encryption yet. Next steps: JWT roles and Web Crypto encryption of IndexedDB data.
- Service Workers need `localhost` or HTTPS.
