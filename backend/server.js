const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// 🔥 IMPORTANT: use env variables (Render dashboard)
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cirs_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// ── DB CONFIG (USE CLOUD DB, NOT LOCALHOST) ─────────────
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true } // required for cloud DB
};

let pool;
async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// ── AUTH MIDDLEWARE ─────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── LOGIN ───────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await getPool();

    const [rows] = await db.query(
      'SELECT * FROM Analyst WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const analyst = rows[0];

    // Demo password check
    if (password !== 'password123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: analyst.analyst_id,
        name: analyst.name,
        role: analyst.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      analyst: {
        id: analyst.analyst_id,
        name: analyst.name,
        role: analyst.role,
        email: analyst.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── TEST ROUTE (VERY IMPORTANT) ─────────────────────────
app.get('/', (req, res) => {
  res.send('CIRS Backend Running 🚀');
});

// ── START SERVER ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
