const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.static(path.join(__dirname, '../frontend')));
const PORT = 3000;
const JWT_SECRET = 'cirs_secret_key_change_in_production';

app.use(cors());
app.use(express.json());

// ── DB CONNECTION ──────────────────────────────────────────────
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',          // ← change to your MySQL password
  database: 'cybersecurity_irs',
  waitForConnections: true,
  connectionLimit: 10
};

let pool;
async function getPool() {
  if (!pool) pool = mysql.createPool(dbConfig);
  return pool;
}

// ── AUTH MIDDLEWARE ────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM Analyst WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const analyst = rows[0];
    // For demo: password = "password123" for all analysts (hashed on first login)
    // In prod, store hashed passwords in DB
    const valid = (password === 'password123');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: analyst.analyst_id, name: analyst.name, role: analyst.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, analyst: { id: analyst.analyst_id, name: analyst.name, role: analyst.role, email: analyst.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ══════════════════════════════════════════════════════════════

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [[totalEvents]] = await db.query('SELECT COUNT(*) AS count FROM SecurityEvent');
    const [[openAlerts]] = await db.query("SELECT COUNT(*) AS count FROM Alert WHERE status IN ('Open','In Progress')");
    const [[criticalAlerts]] = await db.query("SELECT COUNT(*) AS count FROM Alert WHERE priority='Critical' AND status IN ('Open','In Progress')");
    const [[totalThreats]] = await db.query('SELECT COUNT(*) AS count FROM Threat');
    const [[unpatched]] = await db.query('SELECT COUNT(*) AS count FROM Vulnerability WHERE patch_available=0');

    // Events by severity
    const [bySeverity] = await db.query(
      "SELECT severity, COUNT(*) AS count FROM SecurityEvent GROUP BY severity ORDER BY FIELD(severity,'Critical','High','Medium','Low')"
    );

    // Recent events (last 7)
    const [recentEvents] = await db.query(`
      SELECT se.event_id, se.event_type, se.severity, se.timestamp, se.source_ip,
             t.threat_name, t.category
      FROM SecurityEvent se
      LEFT JOIN Threat t ON se.threat_id = t.threat_id
      ORDER BY se.timestamp DESC LIMIT 7
    `);

    // Alerts by status
    const [alertStatus] = await db.query(
      "SELECT status, COUNT(*) AS count FROM Alert GROUP BY status"
    );

    // Top threats
    const [topThreats] = await db.query(`
      SELECT t.threat_name, t.category, t.risk_level, COUNT(se.event_id) AS event_count
      FROM Threat t
      LEFT JOIN SecurityEvent se ON t.threat_id = se.threat_id
      GROUP BY t.threat_id ORDER BY event_count DESC LIMIT 5
    `);

    res.json({
      totalEvents: totalEvents.count, openAlerts: openAlerts.count,
      criticalAlerts: criticalAlerts.count, totalThreats: totalThreats.count,
      unpatched: unpatched.count, bySeverity, recentEvents, alertStatus, topThreats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  SECURITY EVENTS
// ══════════════════════════════════════════════════════════════

// GET /api/events
app.get('/api/events', auth, async (req, res) => {
  try {
    const db = await getPool();
    const { severity, search, limit = 50 } = req.query;
    let query = `
      SELECT se.*, t.threat_name, t.category AS threat_category,
             v.cve_id, v.name AS vuln_name, v.cvss_score
      FROM SecurityEvent se
      LEFT JOIN Threat t ON se.threat_id = t.threat_id
      LEFT JOIN Vulnerability v ON se.vuln_id = v.vuln_id
      WHERE 1=1
    `;
    const params = [];
    if (severity) { query += ' AND se.severity = ?'; params.push(severity); }
    if (search) { query += ' AND (se.event_type LIKE ? OR se.source_ip LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY se.timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
app.post('/api/events', auth, async (req, res) => {
  const { event_type, severity, source_ip, dest_ip, protocol, description, threat_id, vuln_id } = req.body;
  try {
    const db = await getPool();
    const [result] = await db.query(
      'INSERT INTO SecurityEvent (event_type, severity, timestamp, source_ip, dest_ip, protocol, description, threat_id, vuln_id) VALUES (?,?,NOW(),?,?,?,?,?,?)',
      [event_type, severity, source_ip || null, dest_ip || null, protocol || null, description || null, threat_id || null, vuln_id || null]
    );
    res.json({ id: result.insertId, message: 'Event created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    const db = await getPool();
    await db.query('DELETE FROM SecurityEvent WHERE event_id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  ALERTS
// ══════════════════════════════════════════════════════════════

// GET /api/alerts
app.get('/api/alerts', auth, async (req, res) => {
  try {
    const db = await getPool();
    const { status, priority } = req.query;
    let query = `
      SELECT a.*, an.name AS analyst_name, se.event_type, se.source_ip,
             t.threat_name, t.risk_level
      FROM Alert a
      LEFT JOIN Analyst an ON a.assigned_to = an.analyst_id
      LEFT JOIN SecurityEvent se ON a.event_id = se.event_id
      LEFT JOIN Threat t ON se.threat_id = t.threat_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (priority) { query += ' AND a.priority = ?'; params.push(priority); }
    query += " ORDER BY FIELD(a.priority,'Critical','High','Medium','Low'), a.created_at DESC";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/status
app.patch('/api/alerts/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const db = await getPool();
    await db.query('UPDATE Alert SET status = ? WHERE alert_id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts
app.post('/api/alerts', auth, async (req, res) => {
  const { alert_type, priority, event_id, assigned_to } = req.body;
  try {
    const db = await getPool();
    const [result] = await db.query(
      "INSERT INTO Alert (alert_type, priority, status, event_id, assigned_to) VALUES (?,?,'Open',?,?)",
      [alert_type, priority, event_id || null, assigned_to || null]
    );
    res.json({ id: result.insertId, message: 'Alert created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  REFERENCE DATA
// ══════════════════════════════════════════════════════════════
app.get('/api/threats', auth, async (req, res) => { try { const db = await getPool(); const [r] = await db.query('SELECT * FROM Threat ORDER BY risk_level'); res.json(r); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/vulnerabilities', auth, async (req, res) => { try { const db = await getPool(); const [r] = await db.query('SELECT * FROM Vulnerability ORDER BY cvss_score DESC'); res.json(r); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/analysts', auth, async (req, res) => { try { const db = await getPool(); const [r] = await db.query('SELECT analyst_id, name, role, department FROM Analyst'); res.json(r); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── START ──────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`CIRS API running on http://localhost:${PORT}`));
