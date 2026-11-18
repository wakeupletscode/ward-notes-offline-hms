# How to Run & Demo — Ward Notes (Offline-First HMS)

This guide explains how anyone who downloads or clones this repository can run the project in seconds.

---

## Prerequisite
- **Java JDK 17 or higher** installed ([Download Adoptium JDK](https://adoptium.net/)).
- *(No manual Maven or SQL database setup needed — the launcher automatically sets up Maven 3.9.9 if missing and uses an embedded H2 SQL database stored in `./data`).*

---

## Option 1: One-Click Start (Windows — Recommended)

1. Double-click **`start-ward-notes.bat`** in the root folder (or `medcare-hms-complete\run-offline-app.bat`).
2. A terminal window will open, compile/start the Spring Boot server, and **automatically open `http://localhost:8080`** in your browser.
3. To stop the server when done, click inside the terminal window and press **`Ctrl + C`**.

---

## Option 2: Run from Terminal (Windows / macOS / Linux)

```bash
cd medcare-hms-complete/offline-app
mvn spring-boot:run
```
Once you see `Started HmsApplication`, open **`http://localhost:8080`** in Chrome or Edge.

---

## 2-Minute Live Demo Walkthrough

1. **Read the Built-In System Guide**:
   - Click **About & Guide** in the top navigation bar to view the 5-stage offline-first architecture and feature overview, then click **Open Ward Workspace**.
2. **Load Sample Ward Patients**:
   - Click **Demo Data** (or **+ Add patient**) while the header status shows **`● Online`**.
   - 5 clinical ward records populate immediately and sync to the SQL database (`Seq #5`, `0 pending`), with `CREATE` events logged in the **Server Sync Audit Trail**.
3. **Test Offline Mode (`Simulate offline`)**:
   - Toggle ON **Simulate offline** in the top-right header.
   - Edit any patient's status or clinical notes and click **Save patient**.
   - Notice the amber **`● pending`** badge next to the patient and the **Outbox Queue** counter (`1`).
   - Refresh the browser (`F5`) while still offline — the app reloads from the **Service Worker** and your unsynced edit stays safe in **IndexedDB**.
4. **Reconnect & Merge**:
   - Toggle OFF **Simulate offline** (or click **Sync now**).
   - Pending changes automatically push to `POST /api/sync`, merge at the field level, clear the `pending` badge, and record an `UPDATE` entry in the **Server Sync Audit Trail**.

---

## Optional: Run the Classic Hospital Dashboard (`MedCare HMS`)

- **Dashboard UI (Patients, Doctors, Appointments, Billing, Charts)**:
  - Open `medcare-hms-complete/classic/frontend/index.html` directly in any browser by double-clicking it.
- **Classic REST API (Port `8081`)**:
  - Double-click `medcare-hms-complete/run-classic-api.bat` (or run `mvn spring-boot:run` inside `medcare-hms-complete/classic/backend`).
