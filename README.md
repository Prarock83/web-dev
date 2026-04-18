# 🛡️ CIRS — Cybersecurity Incident Response System
### Full-Stack Web Application | MySQL + Node.js + HTML/CSS/JS

---

## 📁 Project Structure

```
cirs/
├── backend/
│   ├── server.js        ← Node.js + Express REST API
│   └── package.json
└── frontend/
    ├── index.html       ← Login page
    ├── css/
    │   └── main.css     ← Shared dark cyberpunk styles
    ├── js/
    │   └── app.js       ← Shared utilities (auth, API, toast)
    └── pages/
        ├── dashboard.html  ← Stats, charts, recent events
        ├── events.html     ← Security events log + add/delete
        ├── alerts.html     ← Alert management + status updates
        └── incidents.html  ← Threats, vulns, mitigations, analysts
```

---

## ⚙️ Setup Instructions

### Step 1 — MySQL Database
1. Open **MySQL Workbench**
2. Run the SQL from your CIRS project document (Section 3 DDL + Section 4 DML)
3. Make sure the database name is: `cybersecurity_irs`

### Step 2 — Backend Setup
```bash
cd cirs/backend
npm install
```

Open `server.js` and update your MySQL password on line ~15:
```js
password: 'YOUR_MYSQL_PASSWORD',
```

Start the server:
```bash
node server.js
# API running on http://localhost:3000
```

### Step 3 — Frontend
Just open `cirs/frontend/index.html` in your browser.
*(No build step needed — pure HTML/CSS/JS)*

---

## 🔐 Demo Login
- **Email:** `riya@corp.com`
- **Password:** `password123`

> **Note:** The demo uses a default bcrypt hash for `password123`.
> For production, add a `password_hash` column to the Analyst table.

---

## 🌐 Pages
| Page | URL | Feature |
|------|-----|---------|
| Login | `index.html` | JWT authentication |
| Dashboard | `pages/dashboard.html` | Stats, charts, recent events |
| Events | `pages/events.html` | View, filter, add, delete events |
| Alerts | `pages/alerts.html` | Manage alerts, update status |
| Incidents | `pages/incidents.html` | Threats, vulns, mitigation, analysts |

---

## 🔌 API Endpoints
```
POST   /api/login                    ← Authenticate analyst
GET    /api/dashboard/stats          ← Dashboard statistics
GET    /api/events?severity=&search= ← List events
POST   /api/events                   ← Log new event
DELETE /api/events/:id               ← Delete event
GET    /api/alerts?status=&priority= ← List alerts
POST   /api/alerts                   ← Create alert
PATCH  /api/alerts/:id/status        ← Update alert status
GET    /api/threats                  ← List threats
GET    /api/vulnerabilities          ← List vulnerabilities
GET    /api/analysts                 ← List analysts
```

---

*Developed for K.R. Mangalam University — DBMS Project*
*Student: Pratham Sharma | Roll: 2401010229*
