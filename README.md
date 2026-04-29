# 🛡️ CIRS — CYBERSECURITY INCIDENT RESPONSE SYSTEM
### INTEL-OPS INTELLIGENCE DASHBOARD | HIGH-FIDELITY OPERATIONS

---

## 🛰️ MISSION OVERVIEW
**Project CIRS** (Cybersecurity Incident Response System) is a state-of-the-art "Intel Ops" dashboard designed for Tier-3 SOC analysts. It provides an immersive, high-fidelity environment for threat hunting, asset reconnaissance, and automated vulnerability remediation.

> [!IMPORTANT]
> **AESTHETIC SPECIFICATION:** This platform utilizes a strictly enforced **Times New Roman Small Caps** typography system, paired with **Glassmorphism** UI components and **Laser-Scan** animations for an authentic cybersecurity operational feel.

---

## ⚡ KEY OPERATIONAL CAPABILITIES

### 🔭 ASSET INTELLIGENCE & RECON
Integrated **Domain Scanner** module allowing analysts to perform real-time external reconnaissance.
- **Terminal Interface:** Authentic `[INFO]`, `[WARN]`, and `[VULN]` reconnaissance logging.
- **Port Mapping:** Automated service discovery and banner grabbing.
- **Intelligence Sync:** Discovered vulnerabilities are automatically logged to the central Vulnerability Register.

### 🛠️ INTERACTIVE REMEDIATION (FIX NOW)
The **Vulnerability Management** register features a functional **"FIX NOW"** workflow.
- **Automated Patching:** One-click deployment of security patches for known CVEs (e.g., Log4Shell, HTTP/2 Rapid Reset).
- **Live Telemetry:** Real-time feedback via operational spinners and success confirmation toasts.

### 📦 ENDPOINT DEPLOYMENT
Direct integration for the **CIRS Browser Agent** (Chrome Extension).
- **Universal Monitoring:** Deploy monitoring scripts across all organizational browser endpoints.
- **Tactical Alerts:** Instant deployment feedback via the SOC notification system.

---

## 📁 SYSTEM ARCHITECTURE

```
CIRS_INTEL_OPS/
├── backend/
│   ├── server.js        ← Node.js + Express REST API (DB Pooling + JWT)
│   └── package.json     ← Dependencies (Express, MySQL2, JWT, CORS)
└── frontend/
    ├── index.html       ← Analyst Authentication (Laser-Scan UI)
    ├── css/
    │   └── main.css     ← Design System (Tokens, Glassmorphism, Animations)
    ├── js/
    │   └── app.js       ← Intel Core (API Helper, Mock Resilience, Toasts)
    ├── dashboard.html   ← Operations Center (Recon, Stats, Extension)
    ├── events.html      ← Signal Intelligence (Event Logs)
    ├── alerts.html      ← Alert Management (Triage)
    └── incidents.html   ← Incident Management (Threats, Vulns, Patching)
```

---

## ⚙️ DEPLOYMENT PROTOCOL

### PHASE 1 — DATABASE INITIALIZATION
1. Initialize **MySQL Workbench**.
2. Execute DDL and DML scripts from the project specification.
3. Database Identifier: `cybersecurity_irs`.

### PHASE 2 — BACKEND SERVICES
```bash
cd backend
npm install
node server.js
```
*The API gateway initializes on port `3000` with JWT signing active.*

### PHASE 3 — ANALYST PORTAL
Open `frontend/index.html` in a modern browser (Safari recommended for optimized `-webkit-backdrop-filter` glassmorphism).

---

## 🔐 ACCESS CREDENTIALS (DEMO MODE)
- **ID:** `riya@corp.com`
- **Pass:** `password123`
- **Emergency Bypass:** The system supports `demo_bypass` tokens for offline operational testing.

---

## 📡 API SIGNALS (REST GATEWAY)
| METHOD | ENDPOINT | SIGNAL DATA |
| :--- | :--- | :--- |
| `POST` | `/api/login` | JWT Authentication Token |
| `GET` | `/api/events` | Multi-parameter Log Filtering |
| `GET` | `/api/vulnerabilities` | CVE Register + Patch Status |
| `POST` | `/api/mitigations` | Automated Action Logging |

---

*Developed for K.R. Mangalam University — Intel Ops Simulation*
*Student: Pratham Sharma | Roll: 2401010229*
