// ── AUTH ──────────────────────────────────────────────────────
const API = 'http://localhost:3000/api';

// ── MOCK DATA FOR FALLBACK ────────────────────────────────────
const MOCK_DATA = {
  'dashboard/stats': {
    totalEvents: 1248,
    openAlerts: 42,
    criticalAlerts: 7,
    totalThreats: 15,
    unpatched: 23,
    bySeverity: [
      { severity: 'Critical', count: 12 },
      { severity: 'High', count: 45 },
      { severity: 'Medium', count: 180 },
      { severity: 'Low', count: 1011 }
    ],
    recentEvents: [
      { event_id: 1, event_type: 'Brute Force Attempt', severity: 'High', timestamp: new Date().toISOString(), source_ip: '192.168.1.105', threat_name: 'APT-28 Payload', category: 'Malware' },
      { event_id: 2, event_type: 'SQL Injection', severity: 'Critical', timestamp: new Date(Date.now() - 3600000).toISOString(), source_ip: '45.12.33.10', threat_name: 'Ghidra Injector', category: 'Exploit' },
      { event_id: 3, event_type: 'Phishing Link Click', severity: 'Medium', timestamp: new Date(Date.now() - 7200000).toISOString(), source_ip: '10.0.0.15', threat_name: 'Standard Phish', category: 'Social' },
      { event_id: 4, event_type: 'Unauthorized Access', severity: 'High', timestamp: new Date(Date.now() - 86400000).toISOString(), source_ip: '88.10.2.1', threat_name: 'Credential Stuffer', category: 'Auth' },
      { event_id: 5, event_type: 'Port Scan', severity: 'Low', timestamp: new Date(Date.now() - 172800000).toISOString(), source_ip: '172.16.0.4', threat_name: 'Nmap Sweep', category: 'Recon' }
    ],
    alertStatus: [
      { status: 'Open', count: 15 },
      { status: 'In Progress', count: 12 },
      { status: 'Resolved', count: 45 },
      { status: 'Closed', count: 88 }
    ],
    topThreats: [
      { threat_name: 'Log4Shell variant', category: 'Remote Code Execution', risk_level: 'Critical', event_count: 342 },
      { threat_name: 'ShadowPad Malware', category: 'Trojan', risk_level: 'High', event_count: 156 },
      { threat_name: 'Cobalt Strike Beacon', category: 'C2 Infrastructure', risk_level: 'Critical', event_count: 89 },
      { threat_name: 'Emotet Botnet', category: 'Botnet', risk_level: 'High', event_count: 54 },
      { threat_name: 'ZLoader', category: 'Banking Trojan', risk_level: 'Medium', event_count: 23 }
    ]
  },
  'events': [
    { event_id: 1, event_type: 'SSH Brute Force', severity: 'High', timestamp: new Date().toISOString(), source_ip: '192.168.1.100', dest_ip: '10.0.0.5', protocol: 'TCP', description: 'Repeated failed logins', threat_name: 'BruteForceTool' },
    { event_id: 2, event_type: 'Malicious File Detected', severity: 'Critical', timestamp: new Date(Date.now() - 10000).toISOString(), source_ip: '—', dest_ip: '10.0.0.12', protocol: '—', description: 'EICAR Test File found', threat_name: 'EICAR' }
  ],
  'alerts': [
    { alert_id: 1, alert_type: 'DDoS Attack', priority: 'Critical', status: 'In Progress', analyst_name: 'Mrinal Prakash', event_type: 'High Traffic', source_ip: 'Multiple', threat_name: 'Botnet-X' },
    { alert_id: 2, alert_type: 'Suspicious Beaconing', priority: 'High', status: 'Open', analyst_name: 'Unassigned', event_type: 'Network Anomaly', source_ip: '192.168.1.105', threat_name: 'Cobalt Strike' }
  ],
  'threats': [
    { threat_name: 'APT-41', category: 'State Sponsored', risk_level: 'Critical' }
  ],
  'vulnerabilities': [
    { cve_id: 'CVE-2021-44228', name: 'Log4Shell', severity: 'Critical', cvss_score: 10.0, affected_system: 'Internal-SRV-01', patch_available: false },
    { cve_id: 'CVE-2023-44487', name: 'HTTP/2 Rapid Reset', severity: 'High', cvss_score: 7.5, affected_system: 'Edge-Gateway', patch_available: false }
  ],
  'analysts': [
    { analyst_id: 1, name: 'Mrinal Prakash', role: 'Lead Analyst', department: 'SOC' },
    { analyst_id: 2, name: 'Anish Kumar', role: 'Threat Hunter', department: 'Forensics' },
    { analyst_id: 3, name: 'Vikram Singh', role: 'Security Engineer', department: 'Infrastructure' }
  ],
  'mitigations': [
    { mitigation_id: 1, alert_id: 2, action_type: 'Isolate Host', performed_by: 1, description: 'Isolated host 192.168.1.105 due to suspicious beaconing.', timestamp: new Date().toISOString() }
  ]
};

function getToken() { return localStorage.getItem('cirs_token'); }
function getAnalyst() {
  try { return JSON.parse(localStorage.getItem('cirs_analyst')); }
  catch { return null; }
}
function requireAuth() {
  if (!getToken()) { 
    console.warn('No token found, redirected to login.');
    window.location.href = './index.html'; 
    return false; 
  }
  return true;
}
function logout() {
  localStorage.removeItem('cirs_token');
  localStorage.removeItem('cirs_analyst');
  window.location.href = './index.html';
}

// ── API HELPER ────────────────────────────────────────────────
async function api(path, opts = {}) {
  const cleanPath = path.split('?')[0].replace(/^\//, '');
  const method = (opts.method || 'GET').toUpperCase();
  
  try {
    const res = await fetch(API + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken(),
        ...(opts.headers || {})
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.warn(`Unauthorized (401) for ${path}. Checking mock fallback...`);
      }
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`API Fallback (${cleanPath}):`, err.message);
    
    // GET requests fallback
    if (method === 'GET' && MOCK_DATA[cleanPath]) {
      return MOCK_DATA[cleanPath];
    }
    
    // POST /mitigations fallback
    if (cleanPath === 'mitigations' && method === 'POST') {
      const newItem = { 
        mitigation_id: MOCK_DATA.mitigations.length + 1, 
        timestamp: new Date().toISOString(),
        ...opts.body
      };
      MOCK_DATA.mitigations.push(newItem);
      return newItem;
    }

    // Generic mutation fallback
    if (method !== 'GET') {
      return { message: 'Success (Mock Mode)', id: Math.floor(Math.random() * 1000) };
    }
    
    // If we're really stuck and unauthorized, logout (but not in demo bypass)
    if (err.message.includes('401') && !MOCK_DATA[cleanPath] && getToken() !== 'demo_bypass') {
      logout();
    }
    
    throw err;
  }
}

// ── SIDEBAR INIT ──────────────────────────────────────────────
function initSidebar(activePage) {
  let analyst = getAnalyst();
  if (!analyst) analyst = { name: 'Guest Analyst', role: 'Security Junior' };

  const nameEl = document.getElementById('analystName');
  const roleEl = document.getElementById('analystRole');
  if (nameEl) nameEl.textContent = analyst.name;
  if (roleEl) roleEl.textContent = analyst.role;

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href').includes(activePage)) {
      link.classList.add('active');
    }
  });
}

// ── UTILS ─────────────────────────────────────────────────────
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString() + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function severityBadge(sev) {
  if (!sev) return '<span class="badge badge-low">UNKNOWN</span>';
  const cls = sev.toLowerCase();
  return `<span class="badge badge-${cls}">${sev}</span>`;
}

function countUp(id, target, duration = 1000) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

function initClock(id) {
  const el = document.getElementById(id);
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toISOString().replace('T', ' ').split('.')[0] + ' UTC';
  }
  tick();
  setInterval(tick, 1000);
}

// Global Mouse Glow
function initGlow() {
  document.querySelectorAll('.mouse-glow-wrap').forEach(wrap => {
    const glow = wrap.querySelector('.mouse-glow');
    if (!glow) return;
    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
    });
  });
}

function toast(msg, type = 'success') {
  let el = document.getElementById('globalToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'globalToast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => el.classList.remove('show'), 4000);
}

window.addEventListener('DOMContentLoaded', () => {
  initGlow();
});
