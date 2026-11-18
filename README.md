# Ward Notes — Offline-First Hospital Management System (EHR PWA)

**Ward Notes** is an offline-first clinical Electronic Health Record (EHR) Progressive Web App and Hospital Management System built with **HTML5 / IndexedDB / Service Workers**, **Java (Spring Boot 3)**, and **SQL (H2 / PostgreSQL)**.

Hospital wards and clinics with unreliable Wi-Fi or internet blackouts keep working without interruption. Clinicians can admit patients, update vitals, and record ward notes completely offline; changes are stored on the device and automatically merged at the field level when connectivity returns.

> **Quick Start:** Double-click **`start-ward-notes.bat`** (Windows) or see **[HOW_TO_RUN.md](HOW_TO_RUN.md)** for full instructions and a 2-minute demo walkthrough.

---

## Key Features

- **Offline-First Device Storage (`IndexedDB` + `Service Worker`)**: Client-generated UUIDs allow patient records to be created, searched, filtered, edited, and deleted with zero network connectivity.
- **Field-Level 3-Way Merge Engine (`SyncService.java`)**: Tracks a `base` snapshot of each record. Non-overlapping edits from multiple devices merge automatically; overlapping field edits resolve deterministically via Last-Write-Wins (LWW) and report conflicts transparently.
- **Live SQL Audit Trail (`audit_log`)**: Every `CREATE`, `UPDATE`, `DELETE`, and `CONFLICT` synchronization event is recorded in the relational SQL database and displayed in real time.
- **Clinical Validation & Ward UI**: Built-in KPI counters, status & blood-group filters, automatic age calculation from DOB, strict input validation, light/dark themes, and an interactive **About & Guide** page inside the browser.
- **Classic Multi-Module HMS (`medcare-hms-complete/classic`)**: Includes a full administrative dashboard for Patients, Appointments, Doctors on Duty, Billing, and Department Analytics charts.

---

## Repository Structure

```text
├── start-ward-notes.bat             # One-click launcher (starts server & opens http://localhost:8080)
├── HOW_TO_RUN.md                    # Step-by-step setup & demo guide
└── medcare-hms-complete/
    ├── offline-app/                 # MAIN PROJECT: Offline-First Ward Notes PWA + Spring Boot (Port 8080)
    ├── classic/
    │   ├── frontend/                # MedCare HMS Dashboard UI (Patients, Doctors, Appointments, Billing, Charts)
    │   ├── backend/                 # Spring Boot REST API for classic modules (Port 8081)
    │   └── docs/schema.sql          # Optional PostgreSQL schema & seed data
    ├── run-offline-app.bat          # Starts the main Offline-First app
    └── run-classic-api.bat          # Starts the classic REST API
```

---

## Architecture Overview

| Component | Location | Responsibility |
| :--- | :--- | :--- |
| **Local Database** | `static/app.js` (`IndexedDB`) | Stores patient records, `base` snapshots, and dirty outbox queue on the device. |
| **App Shell Cache** | `static/sw.js` (`Service Worker`) | Caches HTML/CSS/JS shell for offline reloads and registers Background Sync (`sync-patients`). |
| **Delta Sync API** | `SyncController.java` (`POST /api/sync`) | Accepts modified fields + `base` snapshot + client cursor (`since`), returning merged deltas. |
| **Merge Engine** | `SyncService.java` | Performs field-level 3-way merge and logs conflicts to the SQL audit table. |
| **SQL Persistence** | `Patient.java`, `AuditLog.java` | Hibernate/JPA entities persisted to embedded H2 (`./data`) or PostgreSQL. |
