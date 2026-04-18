// ── AUTH ──────────────────────────────────────────────────────
const API = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('cirs_token'); }
function getAnalyst() {
  try { return JSON.parse(localStorage.getItem('cirs_analyst')); }
  catch { return null; }
}
function requireAuth() {
  if (!getToken()) { window.location.href = '../index.html'; return false; }
  return true;
}
function logout() {
  localStorage.removeItem('cirs_token');
  localStorage.removeItem('cirs_analyst');
  window.location.href = '../index.html';
}

// ── API HELPER ────────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
      ...(opts.headers || {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (res.status === 401) { logout(); return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── SIDEBAR INIT ──────────────────────────────────────────────
function initSidebar(activePage) {
  const analyst = getAnalyst();
  if (!analyst) return;

  document.getElementById('analystName').textContent = analyst.name;
  document.getElementById('analystRole').textContent = analyst.role;
  document.getElementById('analystInitials').textContent =
    analyst.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  // Active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === activePage);
  });

  // Load badge counts
  api('/dashboard/stats').then(stats => {
    const badge = document.getElementById('alertBadge');
    if (badge && stats?.criticalAlerts > 0) {
      badge.textContent = stats.criticalAlerts;
      badge.style.display = 'inline-block';
    }
  }).catch(() => {});
}

// ── CLOCK ─────────────────────────────────────────────────────
function initClock(id) {
  function tick() {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().toISOString().replace('T',' ').split('.')[0] + ' UTC';
  }
  tick(); setInterval(tick, 1000);
}

// ── TOAST ─────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = (type === 'success' ? '✓ ' : '⚠ ') + msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── BADGE HELPERS ─────────────────────────────────────────────
function severityBadge(s) {
  const map = { Critical:'critical', High:'high', Medium:'medium', Low:'low' };
  return `<span class="badge badge-${(map[s]||'low')}">${s||'—'}</span>`;
}
function statusBadge(s) {
  const map = { 'Open':'open','In Progress':'progress','Resolved':'resolved','Closed':'closed' };
  return `<span class="badge badge-${(map[s]||'closed')}">${s||'—'}</span>`;
}
function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
}
function fmtIp(ip) {
  return ip ? `<span class="mono text-accent">${ip}</span>` : '<span class="text-muted">—</span>';
}
