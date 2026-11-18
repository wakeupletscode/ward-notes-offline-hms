# MedCare HMS: complete project
Hospital management system built with HTML5 + JavaScript, Java (Spring Boot) and SQL.

```
medcare-hms-complete/
├── offline-app/        MAIN PROJECT: offline-first patient records (PWA + Spring Boot + SQL). Port 8080
├── classic/
│   ├── frontend/       Dashboard UI: patients, doctors, appointments, billing, charts (open in browser)
│   ├── backend/        REST API for all four modules (Spring Boot + JPA). Port 8081
│   └── docs/schema.sql PostgreSQL schema + sample data (optional)
├── run-offline-app.bat double-click to start the main project
└── run-classic-api.bat double-click to start the classic API
```

## 1. Install the tools (one time, PowerShell)
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
winget install Apache.Maven
```
Close PowerShell, open a new one, then check:
```powershell
java -version      # 17 or higher
mvn -v
```
If `winget` is missing: install JDK 17 from adoptium.net (tick "Add to PATH" and "Set JAVA_HOME") and Maven from maven.apache.org (add its `bin` folder to PATH).

## 2. Run the main project (offline-first app)
```powershell
cd "C:\path\to\medcare-hms-complete\offline-app"
mvn spring-boot:run
```
Wait for `Started HmsApplication`, then open **http://localhost:8080** in Chrome or Edge.
Demo: add patients, tick **Simulate offline**, edit and reload (data survives), untick to sync. More in `offline-app/README.md`.

## 3. Run the classic system (optional)
Dashboard UI: open `classic\frontend\index.html` by double-click. It runs on built-in sample data.

REST API, in a new PowerShell window (the main project can keep running; this uses port 8081):
```powershell
cd "C:\path\to\medcare-hms-complete\classic\backend"
mvn spring-boot:run
```
Test it:
```powershell
curl.exe http://localhost:8081/api/doctors
curl.exe -X POST http://localhost:8081/api/doctors -H "Content-Type: application/json" -d "{\"name\":\"Dr. Anjali Gupta\",\"specialty\":\"Dermatology\",\"onDuty\":true}"
curl.exe http://localhost:8081/api/bills/summary
```
Endpoints: `/api/patients`, `/api/doctors`, `/api/appointments`, `/api/bills` (GET, POST, PUT, DELETE; plus `/today`, `/pending`, `/summary`, `/toggle-duty`, `/pay`).

## 4. PostgreSQL (optional, both projects use H2 by default)
Edit `application.properties` in the project (instructions inside), then:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE medcare_hms;"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d medcare_hms -f classic\docs\schema.sql
```
(Use your own version number in place of 16.)

## Troubleshooting
| Problem | Fix |
|---|---|
| `mvn is not recognized` | Maven `bin` not on PATH. Open a new PowerShell after installing. |
| `JAVA_HOME is not defined` | Set JAVA_HOME to your JDK folder in Environment Variables. |
| `Port already in use` | Stop the other server (Ctrl+C), or change `server.port`. |
| `pom.xml not found` | You are one folder too high or low. Run `dir` and `cd` until you see `pom.xml`. |
| Anything else | Copy the full error text and send it. |

Stop any server with Ctrl+C.
