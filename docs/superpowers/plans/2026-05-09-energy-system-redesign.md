# Energy System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace single fuel mechanic with dual-resource system (Benzyna + Bateria), add fixed header, role handoff screens, Cars trivia in E2, and 4-phase speed sequence in E4.

**Architecture:** game.js is fully rewritten (ResourceManager→Resources, HeaderManager→Header, HandoffScreen, FuelBottle, LowEnergyModal, DeadModal). All 6 stage HTML files are rewritten with sequential 3-role structure. style.css gets new rules appended. FuelManager backwards-compat shims added to game.js during HTML migration and removed at the end.

**Tech Stack:** Vanilla JS ES6, CSS3, HTML5; no build step; served as GitHub Pages; tested in Chrome on Android.

---

## File Map

| File | Action |
|---|---|
| assets/style.css | Append: fixed header, handoff overlay, speed zone, fuel-bottle UI |
| assets/game.js | Full rewrite: Resources, Header, HandoffScreen, LowEnergyModal, DeadModal, FuelBottle, startEnergyMonitoring(), FuelManager shims |
| zadanie/1/index.html | Rewrite: 3-role (Amelia NFC, Ania shake, Szymon hint) |
| zadanie/2/index.html | Rewrite: NFC gate + 3-role (Amelia trivia, Ania GPS ride, Szymon GPS confirm) |
| zadanie/3/index.html | Rewrite: 3-role (Szymon GPS nav, Amelia NFC, Ania reaction game 4-btn) |
| zadanie/4/index.html | Rewrite: 3-role (Szymon GPS nav, Amelia memory, 4-phase speed) |
| zadanie/5/index.html | Rewrite: 3-role (Szymon GPS nav+beeper, Amelia riddle, Ania level) |
| zadanie/6/index.html | Rewrite: 3-role (Szymon GPS nav, Amelia sprint, Ania dodge) + 5-min countdown |
| index.html | Remove fuel-widget div |
| final/index.html | Remove fuel-widget div |
| print/sejf.html | Add fuel bottle codes table |

---

## Task 1: CSS — Add fixed header, handoff overlay, speed zone styles

**Files:**
- Modify: `assets/style.css` (append after line 626)

- [ ] **Step 1: Append new CSS rules**

Add to the end of `assets/style.css`:

```css
/* ============================================================
   REDESIGN 2026-05-09 — Energy System + Fixed Header + Handoffs
   ============================================================ */

/* --- Fixed game header (injected by game.js on every page) --- */
#game-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  height: 44px;
  background: rgba(15, 15, 26, 0.97);
  border-bottom: 1px solid rgba(233, 69, 96, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px;
  gap: 12px;
}
.header-bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.header-icon { font-size: 1rem; flex-shrink: 0; }
.header-track {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}
.header-fill {
  height: 100%; width: 0%; border-radius: 5px;
  transition: width 0.4s ease;
}
.header-fuel-fill   { background: linear-gradient(90deg, #4CAF50, #FFD700); }
.header-energy-fill { background: linear-gradient(90deg, #2196F3, #00BCD4); }
.header-pct {
  font-size: 0.75rem; font-weight: 700; color: #aaa;
  min-width: 32px; text-align: right;
}

/* --- Push page content below fixed header --- */
.page { padding-top: 44px; }

/* --- Handoff overlay --- */
.handoff-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0, 0, 0, 0.92);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.handoff-box {
  background: #16213e;
  border-radius: 16px;
  padding: 28px 24px;
  max-width: 360px; width: 100%;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
}
.handoff-name {
  font-family: var(--font-heading);
  font-size: 2rem; font-weight: 900;
  letter-spacing: 4px; margin-bottom: 6px;
}
.handoff-title  { font-size: 1rem; color: #aaa; margin-bottom: 16px; }
.handoff-task {
  font-size: 1.05rem; color: #fff; line-height: 1.5;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px; border-radius: 8px;
}

/* --- Speed sweet-spot zone overlay (E4) --- */
.speed-zone-wrap {
  position: relative; width: 100%; height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 14px; overflow: hidden; margin: 8px 0;
}
.speed-zone-fill {
  height: 100%; width: 0%; border-radius: 14px;
  transition: width 0.2s, background 0.2s;
  background: linear-gradient(90deg, #4CAF50, #FFD700);
}
.speed-zone-fill.inside { background: #4CAF50; }
.speed-zone-fill.fast   { background: linear-gradient(90deg, #FF9800, #e94560); }
.speed-zone-green {
  position: absolute; top: 0; height: 100%;
  background: rgba(76, 175, 80, 0.25);
  border-left: 2px solid rgba(76, 175, 80, 0.8);
  border-right: 2px solid rgba(76, 175, 80, 0.8);
  pointer-events: none;
}
.speed-zone-marker {
  position: absolute; top: 0; height: 100%;
  width: 3px; background: #e94560; pointer-events: none;
}

/* --- Mission timer bar (E6) --- */
#mission-bar {
  position: fixed; top: 44px; left: 0; right: 0; z-index: 190;
  height: 32px;
  background: rgba(233, 69, 96, 0.15);
  border-bottom: 1px solid rgba(233, 69, 96, 0.4);
  display: none;
  align-items: center; justify-content: center;
  font-size: 0.95rem; font-weight: 700; color: #e94560;
}
#mission-bar.active { display: flex; }
.page-with-mission-bar { padding-top: 76px !important; }
```

- [ ] **Step 2: Verify in browser**

Open any stage page. Check that:
- No visible change yet (header injected by game.js, not CSS alone)
- No CSS parse errors in DevTools console

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "style: add fixed header, handoff overlay, speed zone, mission bar CSS"
```

---

## Task 2: game.js — Full Rewrite

**Files:**
- Overwrite: `assets/game.js` (full replacement)

**Key changes vs old file:**
- `FuelManager` → `Resources` (dual resource: benzyna + bateria)
- `Header` module injected on DOMContentLoaded
- `showHandoff()` function
- `initLowEnergyModal()` / `showLowEnergyModal()`
- `initDeadModal()` / `showDeadModal()`
- `startEnergyMonitoring()` — called by E2–E6, NOT by E1
- `initFuelBottle(stageNum)` — refuel UI
- `FuelManager` shims (empty stubs) for backwards compat during HTML migration
- `GAME_CONFIG` shim kept (Navigation still uses gpsArrivalRadiusM)
- All other modules (GameState, haversineM, bearingDeg, Navigation, Sensors, NFC) unchanged

- [ ] **Step 1: Overwrite assets/game.js with complete new content**

Write the following as the complete content of `assets/game.js`:

```javascript
'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const NFC_BACKUP_CODES = {
  1: 'START1', 2: 'FLIK22', 3: 'PACZK3', 4: 'PACZK4', 5: 'PACZK5', 6: 'PACZK6',
};
const FUEL_BOTTLE_CODES = {
  1: 'BENZ1', 3: 'BENZ3', 4: 'BENZ4', 5: 'BENZ5', 6: 'BENZ6',
};
// PLACEHOLDER GPS coords for fuel-bottle GPS gate (fill before party)
const FUEL_BOTTLE_COORDS = {
  3: { lat: 0, lng: 0 },
  4: { lat: 0, lng: 0 },
  5: { lat: 0, lng: 0 },
  6: { lat: 0, lng: 0 },
};
// Base coords for dead-state emergency nav (PLACEHOLDER)
const BASE_COORDS = { lat: 0, lng: 0 };

const SAFE_SYMBOLS = [
  { id: 'wrench',    emoji: '\u{1F527}', name: 'Klucz'      },
  { id: 'flag',      emoji: '\u{1F3C1}', name: 'Flaga'      },
  { id: 'lightning', emoji: '\u26A1',    name: 'Błyskawica' },
  { id: 'piston',    emoji: '\u{1F534}', name: 'Tłok'       },
];

// ============================================================
// LOCATION PLACEHOLDERS — replace before party
// ============================================================
const STAGE2_NFC_HINT    = 'PLACEHOLDER: opisz gdzie w ogrodzie jest tag NFC (np. "Pod dużym kamieniem przy furtce")';
const STAGE3_NFC_HINT    = 'PLACEHOLDER: opisz gdzie jest tag NFC w lokalizacji 1';
const EXTRA_GIFT_LOCATION = 'PLACEHOLDER: opisz gdzie jest schowany dodatkowy prezent';

const STAGE3_WAYPOINTS = [];
const STAGE4_WAYPOINTS = [];
const STAGE5_WAYPOINTS = [];
const STAGE6_WAYPOINTS = [];

// ============================================================
// UTILITIES
// ============================================================
function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function bearingDeg(lat1, lng1, lat2, lng2) {
  const toRad = d => d * Math.PI / 180;
  const dLng  = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1))*Math.sin(toRad(lat2))
           - Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}
function formatDist(m) {
  return m >= 1000 ? (m/1000).toFixed(1)+' km' : Math.round(m)+' m';
}

// ============================================================
// GAMESTATE — localStorage wrapper
// ============================================================
const GameState = (() => {
  const PREFIX = 'auta_szymon_26_';
  function get(key, def) {
    try { const v = localStorage.getItem(PREFIX+key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
  }
  function set(key, val) {
    try { localStorage.setItem(PREFIX+key, JSON.stringify(val)); } catch {}
  }
  return {
    getSymbols:        ()  => get('symbols', []),
    addSymbol:         (id)=> { const s = GameState.getSymbols(); if (!s.includes(id)) { s.push(id); set('symbols', s); } },
    getStages:         ()  => get('stages', []),
    markStage:         (n) => { const s = GameState.getStages(); if (!s.includes(n)) { s.push(n); set('stages', s); } },
    isStageComplete:   (n) => GameState.getStages().includes(n),
    getStartTime:      ()  => get('startTime', null),
    ensureStartTime:   ()  => { if (!get('startTime', null)) set('startTime', Date.now()); },
    getElapsedMinutes: ()  => { const t = get('startTime', null); return t ? Math.floor((Date.now()-t)/60000) : 0; },
    getNFCUnlocked:    (n) => get('nfc_'+n, false),
    setNFCUnlocked:    (n) => set('nfc_'+n, true),
    reset: () => {
      ['symbols','stages','startTime','benzyna','bateria','lastRefuelLat','lastRefuelLng'].forEach(k => {
        try { localStorage.removeItem('auta_szymon_26_'+k); } catch {}
      });
      for (let i=1; i<=6; i++) {
        try { localStorage.removeItem('auta_szymon_26_nfc_'+i); } catch {}
        try { localStorage.removeItem('auta_szymon_26_refuel_'+i); } catch {}
      }
    },
  };
})();

// ============================================================
// RESOURCES — Benzyna ⛽ + Bateria ⚡
// ============================================================
const Resources = (() => {
  const PREFIX = 'auta_szymon_26_';
  function rload(key, def) { const v = parseFloat(localStorage.getItem(PREFIX+key)); return isNaN(v) ? def : v; }
  function rsave(key, val) { localStorage.setItem(PREFIX+key, String(val)); }

  let benzyna   = rload('benzyna', 20);
  let bateria   = rload('bateria',  0);
  let idleTimer = null;
  let lastGps   = null;
  let gpsAccumM = 0;
  let _stateCb  = null;

  const clamp = v => Math.max(0, Math.min(100, v));

  function addBenzyna(pct) { benzyna = clamp(benzyna + pct); rsave('benzyna', benzyna); _notify(); }
  function addBateria(pct) { bateria  = clamp(bateria  + pct); rsave('bateria',  bateria);  _notify(); }

  function _state() {
    if (bateria >= 5) return 'normal';
    if (benzyna > 0)  return 'low';
    return 'dead';
  }

  // Each detected shake: −1% benzyna, +2% bateria
  function onShake() {
    if (benzyna <= 0) return;
    addBenzyna(-1);
    addBateria(2);
  }

  function _onGpsPos(lat, lng) {
    if (lastGps) {
      const d = haversineM(lastGps.lat, lastGps.lng, lat, lng);
      if (d > 0 && d < 200) {
        gpsAccumM += d;
        while (gpsAccumM >= 10) { addBateria(1); gpsAccumM -= 10; }
      }
    }
    lastGps = { lat, lng };
    _resetIdleTimer();
  }

  function _resetIdleTimer() {
    clearInterval(idleTimer);
    idleTimer = setInterval(() => addBateria(-1), 20000);
  }

  function startGpsTracking() {
    if (!navigator.geolocation) { _resetIdleTimer(); return; }
    navigator.geolocation.watchPosition(
      pos => _onGpsPos(pos.coords.latitude, pos.coords.longitude),
      null,
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    _resetIdleTimer();
  }

  function _notify() {
    Header.update(benzyna, bateria);
    if (_stateCb) _stateCb(_state());
  }

  function saveLastRefuel(lat, lng) {
    localStorage.setItem(PREFIX+'lastRefuelLat', lat);
    localStorage.setItem(PREFIX+'lastRefuelLng', lng);
  }
  function getLastRefuel() {
    const lat = parseFloat(localStorage.getItem(PREFIX+'lastRefuelLat'));
    const lng = parseFloat(localStorage.getItem(PREFIX+'lastRefuelLng'));
    return (isNaN(lat) || isNaN(lng)) ? null : { lat, lng };
  }

  return {
    getBenzyna:    () => benzyna,
    getBateria:    () => bateria,
    addBenzyna, addBateria,
    onShake, startGpsTracking,
    getLastGps:    () => lastGps,
    state:         _state,
    onStateChange: cb => { _stateCb = cb; },
    saveLastRefuel, getLastRefuel,
  };
})();

// ============================================================
// HEADER — fixed top bar injected by JS on every page
// ============================================================
const Header = (() => {
  function init() {
    const el = document.createElement('div');
    el.id = 'game-header';
    el.innerHTML = `
      <div class="header-bar-wrap">
        <span class="header-icon">⛽</span>
        <div class="header-track"><div class="header-fill header-fuel-fill" id="hdr-fuel"></div></div>
        <span class="header-pct" id="hdr-fuel-pct">--</span>
      </div>
      <div class="header-bar-wrap">
        <span class="header-icon">⚡</span>
        <div class="header-track"><div class="header-fill header-energy-fill" id="hdr-batt"></div></div>
        <span class="header-pct" id="hdr-batt-pct">--</span>
      </div>
    `;
    document.body.prepend(el);
    update(Resources.getBenzyna(), Resources.getBateria());
  }
  function update(b, a) {
    const f  = document.getElementById('hdr-fuel');
    const e  = document.getElementById('hdr-batt');
    const fp = document.getElementById('hdr-fuel-pct');
    const ep = document.getElementById('hdr-batt-pct');
    if (f)  f.style.width  = b + '%';
    if (e)  e.style.width  = a + '%';
    if (fp) fp.textContent = Math.round(b) + '%';
    if (ep) ep.textContent = Math.round(a) + '%';
  }
  return { init, update };
})();

// ============================================================
// HANDOFF SCREEN
// ============================================================
const PLAYER = {
  szymon: { color: '#e94560', title: 'Nawigatorze!', name: '\u{1F534} SZYMON', ready: 'gotowy' },
  amelia: { color: '#FFD700', title: 'Mechaniku!',   name: '\u{1F7E1} AMELIA', ready: 'gotowa' },
  ania:   { color: '#2196F3', title: 'Pilotko!',     name: '\u{1F535} ANIA',   ready: 'gotowa' },
};

function showHandoff(player, task, onConfirm) {
  const p  = PLAYER[player];
  const ov = document.createElement('div');
  ov.className = 'handoff-overlay';
  ov.innerHTML = `
    <div class="handoff-box" style="border-top:6px solid ${p.color}">
      <div class="handoff-name" style="color:${p.color}">${p.name}</div>
      <div class="handoff-title">Twoja kolej, ${p.title}</div>
      <div class="handoff-task">${task}</div>
      <button class="btn-primary handoff-btn">&#10003; Jestem ${p.ready}!</button>
    </div>
  `;
  ov.querySelector('.handoff-btn').addEventListener('click', () => { ov.remove(); onConfirm(); });
  document.body.appendChild(ov);
}

// ============================================================
// LOW ENERGY MODAL  (bateria < 5%, benzyna > 0%)
// ============================================================
function initLowEnergyModal() {
  const m = document.createElement('div');
  m.id = 'low-energy-modal';
  m.className = 'modal-overlay';
  m.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">&#9889;</div>
      <div class="modal-title">SILNIK PADA!</div>
      <div class="modal-text">
        Potrząśnij telefonem żeby naładować baterię!<br>
        <span style="font-size:0.85rem;color:#FFD700;">Paliwo &#9981; zostanie zużyte.</span>
      </div>
      <div style="font-size:2.5rem;margin:10px 0;font-weight:900;" id="lem-shakes">0</div>
      <div style="font-size:0.85rem;color:#aaa;">potrząśnięć | ładuj do 15% &#9889;</div>
    </div>
  `;
  document.body.appendChild(m);
}

let _lemActive = false;
function showLowEnergyModal() {
  if (_lemActive) return;
  const m = document.getElementById('low-energy-modal');
  if (!m) return;
  _lemActive = true;
  m.classList.add('active');
  let shakes = 0, lastT = 0;
  function onMotion(e) {
    if (Resources.getBateria() >= 15) {
      m.classList.remove('active'); _lemActive = false;
      window.removeEventListener('devicemotion', onMotion); return;
    }
    const ag = e.accelerationIncludingGravity; if (!ag) return;
    const tot = Math.sqrt((ag.x||0)**2 + (ag.y||0)**2 + (ag.z||0)**2);
    const now = Date.now();
    if (tot > 18 && now - lastT > 300) {
      lastT = now; Resources.onShake();
      const el = document.getElementById('lem-shakes'); if (el) el.textContent = ++shakes;
    }
  }
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(r => { if (r==='granted') window.addEventListener('devicemotion', onMotion); });
  } else { window.addEventListener('devicemotion', onMotion); }
}

// ============================================================
// DEAD STATE MODAL  (bateria = 0%, benzyna = 0%)
// ============================================================
function initDeadModal() {
  const m = document.createElement('div');
  m.id = 'dead-modal'; m.className = 'modal-overlay';
  m.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">&#128128;</div>
      <div class="modal-title">BRAK PALIWA I ENERGII!</div>
      <div class="modal-text">Jedźcie z powrotem do ostatniego punktu tankowania!</div>
      <div id="dead-nav" style="font-size:1.8rem;font-weight:700;margin:12px 0;color:#FFD700;">-- m</div>
      <div id="dead-nav-status" style="font-size:0.9rem;color:#aaa;">Szukam GPS...</div>
    </div>
  `;
  document.body.appendChild(m);
}

let _deadActive = false;
function showDeadModal() {
  if (_deadActive) return;
  const m = document.getElementById('dead-modal'); if (!m) return;
  _deadActive = true; m.classList.add('active');
  const refuel = Resources.getLastRefuel() || BASE_COORDS;
  if (!navigator.geolocation) return;
  navigator.geolocation.watchPosition(pos => {
    const dist = haversineM(pos.coords.latitude, pos.coords.longitude, refuel.lat, refuel.lng);
    const dn = document.getElementById('dead-nav');
    const ds = document.getElementById('dead-nav-status');
    if (dn) dn.textContent = formatDist(dist);
    if (ds) ds.textContent = dist < 20 ? 'Dotarliście! Zatankujcie!' : 'Kierujcie sie do punktu tankowania';
  }, null, { enableHighAccuracy: true, maximumAge: 1000 });
}

// ============================================================
// ENERGY MONITORING — call from E2-E6 pages after stage init
// NOTE: E1 must NOT call this (bateria starts at 0%, would trigger immediately)
// ============================================================
function startEnergyMonitoring() {
  Resources.onStateChange(state => {
    if (state === 'low')  showLowEnergyModal();
    if (state === 'dead') showDeadModal();
  });
  const s = Resources.state();
  if (s === 'low')  showLowEnergyModal();
  if (s === 'dead') showDeadModal();
}

// ============================================================
// FUEL BOTTLE — GPS-gated refuel code entry
// ============================================================
function initFuelBottle(stageNum) {
  const usedKey = 'auta_szymon_26_refuel_' + stageNum;
  const wrap = document.createElement('div');
  wrap.id = 'fuel-bottle-wrap';
  wrap.style.cssText = 'padding:8px 0;width:100%;max-width:480px;';
  wrap.innerHTML = `
    <button id="fuel-bottle-btn" class="btn-primary"
      style="background:rgba(76,175,80,0.15);border:1.5px solid #4CAF50;font-size:0.9rem;padding:10px 16px;">
      &#9981; Zatankuj
    </button>
    <div id="fuel-bottle-input" style="display:none;padding:8px;background:rgba(0,0,0,0.3);border-radius:8px;margin-top:6px;">
      <div style="font-size:0.8rem;color:#888;margin-bottom:4px;">Wpisz kod z butelki paliwa:</div>
      <div style="display:flex;gap:8px;">
        <input id="fuel-code-input" type="text" maxlength="5" placeholder="BENZX"
          style="flex:1;background:rgba(255,255,255,0.06);border:1.5px solid rgba(76,175,80,0.5);
                 border-radius:8px;color:#fff;font-size:1.3rem;font-weight:700;
                 padding:10px;text-align:center;outline:none;text-transform:uppercase;">
        <button id="fuel-code-submit" class="btn-primary"
          style="width:auto;padding:10px 16px;margin:0;background:#4CAF50;">OK</button>
      </div>
      <div id="fuel-code-error" style="display:none;color:#e94560;font-size:0.85rem;margin-top:4px;">
        Bledny kod! Sprawdz nakleje na butele.
      </div>
    </div>
  `;
  const parent = document.querySelector('.task-body') || document.querySelector('.page');
  if (parent) parent.appendChild(wrap);

  if (localStorage.getItem(usedKey)) {
    const b = document.getElementById('fuel-bottle-btn');
    if (b) { b.disabled = true; b.textContent = '&#9981; Zatankowane ✓'; }
    return;
  }

  document.getElementById('fuel-bottle-btn').addEventListener('click', () => {
    if (stageNum !== 1) {
      const coords = FUEL_BOTTLE_COORDS[stageNum];
      if (coords && coords.lat !== 0) {
        const last = Resources.getLastGps();
        if (last && haversineM(last.lat, last.lng, coords.lat, coords.lng) > 50) {
          alert('Jestescie za daleko od punktu tankowania! Podjedzcie blizej.');
          return;
        }
      }
    }
    document.getElementById('fuel-bottle-input').style.display = 'block';
    document.getElementById('fuel-bottle-btn').style.display   = 'none';
  });

  function trySubmit() {
    const code = document.getElementById('fuel-code-input').value.trim().toUpperCase();
    if (code === FUEL_BOTTLE_CODES[stageNum]) {
      Resources.addBenzyna(30);
      const coords = FUEL_BOTTLE_COORDS[stageNum];
      if (coords && coords.lat !== 0) Resources.saveLastRefuel(coords.lat, coords.lng);
      localStorage.setItem(usedKey, '1');
      document.getElementById('fuel-bottle-input').style.display = 'none';
      const b = document.getElementById('fuel-bottle-btn');
      if (b) { b.disabled = true; b.textContent = '&#9981; Zatankowane ✓'; b.style.display = 'block'; }
    } else {
      const er = document.getElementById('fuel-code-error');
      if (er) { er.style.display = 'block'; setTimeout(() => er.style.display = 'none', 2000); }
    }
  }
  document.getElementById('fuel-code-submit').addEventListener('click', trySubmit);
  document.getElementById('fuel-code-input').addEventListener('keydown', e => { if (e.key === 'Enter') trySubmit(); });
}

// ============================================================
// NFC TOKEN VALIDATION (unchanged)
// ============================================================
function checkNFCToken(stageNum) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('nfc') === '1') { GameState.setNFCUnlocked(stageNum); return true; }
  return GameState.getNFCUnlocked(stageNum);
}

function setupBackupCodeInput(stageNum, onUnlock) {
  const btn   = document.getElementById('backup-submit');
  const input = document.getElementById('backup-code-input');
  if (!btn || !input) return;
  function tryCode() {
    const code = input.value.trim().toUpperCase();
    if (code === NFC_BACKUP_CODES[stageNum]) { GameState.setNFCUnlocked(stageNum); onUnlock(); }
    else { input.style.borderColor = '#e94560'; setTimeout(() => input.style.borderColor = '', 1000); }
  }
  btn.addEventListener('click', tryCode);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryCode(); });
}

// showNFCGate — used by E2 entry gate
function showNFCGate(stageNum, onUnlock) {
  const gate    = document.getElementById('nfc-gate');
  const content = document.getElementById('stage-content');
  if (checkNFCToken(stageNum)) {
    if (gate)    gate.style.display    = 'none';
    if (content) content.style.display = 'block';
    onUnlock(); return;
  }
  if (gate)    gate.style.display    = 'flex';
  if (content) content.style.display = 'none';
  setupBackupCodeInput(stageNum, () => {
    if (gate)    gate.style.display    = 'none';
    if (content) content.style.display = 'block';
    onUnlock();
  });
}

// ============================================================
// NAVIGATION — GPS Waypoint system (unchanged)
// ============================================================
const Navigation = (() => {
  let watchId=null, compassOn=false, waypoints=[], currentIdx=0, headingDeg=0;
  let onUpdateCb=null, onArrivalCb=null;
  function onOrientation(e) {
    if (e.webkitCompassHeading != null) headingDeg = e.webkitCompassHeading;
    else if (e.absolute && e.alpha != null) headingDeg = 360 - e.alpha;
  }
  function onPosition(pos) {
    if (!waypoints.length) return;
    const wp = waypoints[currentIdx];
    const dist = haversineM(pos.coords.latitude, pos.coords.longitude, wp.lat, wp.lng);
    const bear = bearingDeg(pos.coords.latitude, pos.coords.longitude, wp.lat, wp.lng);
    const arrowAngle = (bear - headingDeg + 360) % 360;
    const isLast  = currentIdx === waypoints.length - 1;
    const isClose = dist <= (isLast ? 25 : 30);
    if (onUpdateCb) onUpdateCb(arrowAngle, dist, isClose, isLast, wp.hint || '');
    if (isClose) {
      if (!isLast) { currentIdx++; if (onArrivalCb) onArrivalCb(currentIdx-1, false, waypoints[currentIdx]?.hint||''); }
      else { stop(); if (onArrivalCb) onArrivalCb(currentIdx, true, ''); }
    }
  }
  function start(wps, onUpdate, onArrival) {
    waypoints=wps; currentIdx=0; onUpdateCb=onUpdate; onArrivalCb=onArrival;
    if (window.DeviceOrientationEvent) { window.addEventListener('deviceorientation', onOrientation, true); compassOn=true; }
    if (!navigator.geolocation) { onUpdate(0, null, false, false, 'Brak GPS'); return; }
    watchId = navigator.geolocation.watchPosition(onPosition,
      e => onUpdate(0, null, false, false, 'Blad GPS: '+e.message),
      { enableHighAccuracy:true, maximumAge:1000, timeout:15000 });
  }
  function stop() {
    if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId=null; }
    if (compassOn) { window.removeEventListener('deviceorientation', onOrientation, true); compassOn=false; }
  }
  return { start, stop };
})();

function renderNav(arrowAngle, distM, isClose, isLast, hint) {
  const a=document.getElementById('nav-arrow');      if(a) a.style.transform=`rotate(${arrowAngle}deg)`;
  const d=document.getElementById('nav-distance');   if(d) d.textContent=distM!=null?formatDist(distM):'---';
  const h=document.getElementById('nav-hint');       if(h) h.textContent=hint||'';
  const w=document.getElementById('nav-arrow-wrap'); if(w) w.classList.toggle('hot',isClose);
  const s=document.getElementById('nav-status');
  if(s) {
    if(distM==null)          s.textContent='Szukam sygnalu GPS...';
    else if(isClose&&isLast) s.textContent='JESTES BLISKO!';
    else if(isClose)         s.textContent='Nastepny punkt!';
    else                     s.textContent='Nawiguj do celu';
  }
}

// ============================================================
// SENSORS — Shake + Level (unchanged)
// ============================================================
const Sensors = (() => {
  function startShake(count, timeLimitMs, onProgress, onSuccess, onFail) {
    const THRESHOLD = 18;
    let shakeCount=0, lastShakeTime=0, deadline=Date.now()+timeLimitMs, done=false;
    function onMotion(e) {
      if (done) return;
      if (Date.now() > deadline) { done=true; window.removeEventListener('devicemotion',onMotion); onFail(); return; }
      const ag = e.accelerationIncludingGravity; if (!ag) return;
      const total = Math.sqrt(ag.x**2+ag.y**2+ag.z**2);
      const now = Date.now();
      if (total > THRESHOLD && now-lastShakeTime > 300) {
        lastShakeTime=now; shakeCount++;
        if (onProgress) onProgress(shakeCount, count);
        if (shakeCount >= count) { done=true; window.removeEventListener('devicemotion',onMotion); onSuccess(); }
      }
    }
    if (!window.DeviceMotionEvent) return { fallback: true };
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(r => { if(r==='granted') window.addEventListener('devicemotion',onMotion); else onFail(); });
    } else { window.addEventListener('devicemotion', onMotion); }
    return { fallback: false };
  }

  function startLevel(holdSecs, toleranceDeg, failSecs, onProgress, onSuccess, onFail) {
    let goodMs=0, badMs=0, lastT=Date.now(), done=false;
    function onOrient(e) {
      if (done) return;
      const now=Date.now(), dt=(now-lastT)/1000; lastT=now;
      const tilt = Math.abs(e.gamma||0);
      if (tilt <= toleranceDeg) {
        goodMs+=dt; badMs=Math.max(0,badMs-dt*0.5);
        if(onProgress) onProgress(goodMs, holdSecs);
        if(goodMs>=holdSecs){done=true; window.removeEventListener('deviceorientation',onOrient); onSuccess();}
      } else {
        badMs+=dt; goodMs=Math.max(0,goodMs-dt*0.3);
        if(onProgress) onProgress(goodMs, holdSecs);
        if(badMs>=failSecs){done=true; window.removeEventListener('deviceorientation',onOrient); onFail();}
      }
    }
    if (!window.DeviceOrientationEvent) return { fallback: true };
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(r => { if(r==='granted') window.addEventListener('deviceorientation',onOrient); else onFail(); });
    } else { window.addEventListener('deviceorientation', onOrient); }
    return { fallback: false };
  }

  return { startShake, startLevel };
})();

// ============================================================
// BACKWARDS COMPAT SHIMS — removed in Task 10
// ============================================================
const GAME_CONFIG = { fuelGPSMinSpeedKmh: 5, waypointRadiusM: 30, gpsArrivalRadiusM: 25 };
const FuelManager = { startDrain:()=>{}, startGPSTracking:()=>{}, stop:()=>{}, renderFuel:()=>{}, closePitStop:()=>{} };

// ============================================================
// GLOBAL INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  GameState.ensureStartTime();
  Header.init();
  initLowEnergyModal();
  initDeadModal();
  Resources.startGpsTracking();
  // startEnergyMonitoring() is called by each stage page (E2-E6), NOT here
});
```

- [ ] **Step 2: Verify in browser**

Open `zadanie/3/index.html` (still uses old HTML, shims active):
- Fixed header with ⛽ 20% and ⚡ 0% appears at top
- No JS errors in console
- Old stage still works (FuelManager shim keeps old calls from throwing)

Open browser console, type:
```javascript
Resources.getBenzyna()  // should return 20
Resources.getBateria()  // should return 0
```

- [ ] **Step 3: Commit**

```bash
git add assets/game.js
git commit -m "feat: rewrite game.js — dual resource system, header, handoff, low/dead modals, fuel bottle"
```

---

## Task 3: E1 — Baza: 3-role sequential

**Files:**
- Overwrite: `zadanie/1/index.html`

**Roles:** Amelia (NFC unlock) → Ania (shake 20x in 15s) → Szymon (reads E2 hint aloud)

- [ ] **Step 1: Write complete zadanie/1/index.html**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Etap 1 — Auta Szymon</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 1 / 6</span>
    </div>

    <!-- Phase 1: Amelia NFC -->
    <div id="phase-nfc" class="task-body">
      <div id="nfc-content" style="display:none;">
        <div class="task-step-label">📡 Odblokuj misję</div>
        <div class="task-card">
          <div class="task-card-icon">📡</div>
          <div class="task-card-text">
            <strong>Dotknij tagiem NFC telefonu</strong><br>lub wpisz kod z naklejki:
          </div>
        </div>
        <div class="backup-input-wrap">
          <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
          <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Ania shake -->
    <div id="phase-shake" class="task-body" style="display:none;">
      <div id="shake-content" style="display:none;">
        <div class="task-step-label">🤝 Rozgrzej Silnik!</div>
        <div class="task-title">Potrząśnij Telefonem!</div>
        <div class="task-card">
          <div class="task-card-icon">🚗</div>
          <div class="task-card-text">
            <em>Złomek: "Hej amigo! Trzeba rozgrzać silnik! Potrząśnij telefonem 20 razy w 15 sekund!"</em>
          </div>
        </div>
        <div class="speed-widget">
          <div class="speed-number" id="shake-count">0</div>
          <div class="speed-unit">/ 20 POTRZĄŚNIĘĆ</div>
          <div class="speed-progress-track">
            <div class="speed-progress-fill" id="shake-fill"></div>
          </div>
        </div>
        <div class="task-countdown ok" id="shake-timer" style="margin-top:8px;"></div>
        <button id="shake-retry" class="btn-primary" style="display:none;margin-top:12px;">🔄 Spróbuj ponownie</button>
        <button id="shake-fallback" class="btn-primary" style="display:none;margin-top:12px;">Dotknij 20 razy (brak akcelerometru)</button>
      </div>
    </div>

    <!-- Phase 3: Szymon reads hint -->
    <div id="phase-hint" class="task-body" style="display:none;">
      <div id="hint-content" style="display:none;">
        <div class="task-step-label">🗺️ Wskazówka do Etapu 2</div>
        <div class="task-title">Przeczytaj drużynie!</div>
        <div class="task-card" style="border-color:#FFD700;">
          <div class="task-card-icon">📻</div>
          <div class="task-card-text">
            <strong>Złomek:</strong> <em>"Szukajcie tagu NFC przy:</em><br><br>
            <span style="color:#FFD700;font-weight:700;font-size:1.1rem;" id="e2-hint-text">PLACEHOLDER</span>
          </div>
        </div>
        <a class="btn-primary" href="../2/">⚡ JEDŹ! Etap 2 →</a>
      </div>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    initFuelBottle(1);

    // Step 1: Amelia unlocks NFC
    showHandoff('amelia', 'Wpisz kod startowy NFC żeby uruchomić misję Ekipy Ratunkowej!', () => {
      document.getElementById('nfc-content').style.display = 'block';
      if (checkNFCToken(1)) { onNFCUnlocked(); return; }
      setupBackupCodeInput(1, onNFCUnlocked);
    });

    function onNFCUnlocked() {
      document.getElementById('phase-nfc').style.display   = 'none';
      document.getElementById('phase-shake').style.display = 'block';
      showHandoff('ania', 'Potrząśnij telefonem 20 razy w 15 sekund żeby naładować silnik!', startShake);
    }

    function startShake() {
      document.getElementById('shake-content').style.display = 'block';
      const countEl = document.getElementById('shake-count');
      const fillEl  = document.getElementById('shake-fill');
      const timerEl = document.getElementById('shake-timer');
      const retryEl = document.getElementById('shake-retry');
      const TIME_MS = 15000;
      let deadline  = Date.now() + TIME_MS;

      function tickTimer() {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        timerEl.textContent = left + 's';
        timerEl.className   = 'task-countdown ' + (left <= 5 ? 'warning' : 'ok');
        if (left > 0) setTimeout(tickTimer, 500);
      }
      tickTimer();

      const result = Sensors.startShake(20, TIME_MS,
        (cur, tot) => {
          countEl.textContent = cur;
          fillEl.style.width  = (cur / tot * 100) + '%';
          Resources.onShake(); // -1% benzyna, +2% bateria per shake
        },
        onShakeSuccess,
        () => { retryEl.style.display = 'block'; timerEl.textContent = 'Czas minął!'; }
      );

      if (result.fallback) {
        let taps = 0;
        const fb = document.getElementById('shake-fallback');
        fb.style.display = 'block';
        fb.addEventListener('click', () => {
          taps++; countEl.textContent = taps;
          fillEl.style.width = (taps / 20 * 100) + '%';
          Resources.onShake();
          if (taps >= 20) onShakeSuccess();
        });
      }

      retryEl.addEventListener('click', () => {
        retryEl.style.display = 'none';
        countEl.textContent   = '0';
        fillEl.style.width    = '0%';
        deadline = Date.now() + TIME_MS;
        tickTimer();
        startShake();
      });
    }

    function onShakeSuccess() {
      GameState.markStage(1);
      document.getElementById('phase-shake').style.display = 'none';
      document.getElementById('phase-hint').style.display  = 'block';
      showHandoff('szymon', 'Przeczytaj wskazówkę do Etapu 2 drużynie na głos — to zagadka!', () => {
        document.getElementById('hint-content').style.display = 'block';
        document.getElementById('e2-hint-text').textContent   = STAGE2_NFC_HINT;
      });
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `zadanie/1/index.html`:
- Fixed header visible at top
- Amelia handoff overlay appears first
- After confirm: NFC entry shows
- Enter `START1` → Ania handoff appears
- After confirm: shake challenge shows with counter and timer
- Shaking increases counter; each shake drains benzyna by 1% and charges bateria by 2%
- After 20 shakes: Szymon handoff → hint text shows → "JEDŹ! Etap 2" link visible

- [ ] **Step 3: Commit**

```bash
git add zadanie/1/index.html
git commit -m "feat(e1): 3-role sequential — Amelia NFC, Ania shake, Szymon hint"
```

---

## Task 4: E2 — Cars Trivia + GPS Ride + GPS Confirm

**Files:**
- Overwrite: `zadanie/2/index.html`

**Roles:** NFC gate (entry) → Amelia (Cars trivia 3Q) → Ania (GPS ≥5km/h 60s) → Szymon (confirm GPS direction)

- [ ] **Step 1: Write complete zadanie/2/index.html**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Etap 2 — Auta Szymon</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 2 / 6</span>
    </div>

    <!-- NFC Gate (entry) -->
    <div id="nfc-gate" class="task-body" style="display:flex;">
      <div class="task-card">
        <div class="task-card-icon">📡</div>
        <div class="task-card-text"><strong>Znajdź tag NFC Filka i dotknij nim telefon!</strong></div>
      </div>
      <div class="backup-input-wrap">
        <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
        <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
        <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
      </div>
    </div>

    <!-- Phase 1: Amelia trivia -->
    <div id="phase-trivia" class="task-body" style="display:none;">
      <div id="trivia-content" style="display:none;">
        <div class="task-step-label">🏎️ Trivia Aut — Filk pyta!</div>
        <div class="task-title">3 pytania o Autach!</div>
        <div id="trivia-question-wrap"></div>
        <div id="trivia-result" style="display:none;margin-top:8px;text-align:center;font-size:0.95rem;"></div>
        <div id="trivia-progress" style="text-align:center;color:#aaa;font-size:0.85rem;margin-top:4px;"></div>
      </div>
    </div>

    <!-- Phase 2: Ania GPS ride -->
    <div id="phase-ride" class="task-body" style="display:none;">
      <div id="ride-content" style="display:none;">
        <div class="task-step-label">💨 GPS Sprint!</div>
        <div class="task-title">Jedź przez 60 sekund!</div>
        <div class="task-card">
          <div class="task-card-icon">🚗</div>
          <div class="task-card-text">
            <em>Złomek: "Teraz jedźcie! Utrzymajcie ≥5 km/h przez 60 sekund!"</em>
          </div>
        </div>
        <div class="speed-widget">
          <div class="speed-number" id="ride-spd">0</div>
          <div class="speed-unit">km/h</div>
          <div class="speed-progress-track">
            <div class="speed-progress-fill" id="ride-fill"></div>
          </div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">
            <span id="ride-secs">0</span> / 60 sekund w ruchu
          </div>
        </div>
      </div>
    </div>

    <!-- Phase 3: Szymon confirm GPS -->
    <div id="phase-confirm" class="task-body" style="display:none;">
      <div id="confirm-content" style="display:none;">
        <div class="task-step-label">🗺️ Potwierdź trasę GPS</div>
        <div class="task-title">Sprawdź kierunek!</div>
        <div class="task-card">
          <div class="task-card-icon">🗺️</div>
          <div class="task-card-text">
            Sprawdź mapę/kompas — czy jedziecie w kierunku <strong>Lokalizacji 1</strong>?<br><br>
            Jeśli tak — potwierdź!
          </div>
        </div>
        <button id="confirm-btn" class="btn-primary">✅ Potwierdzam trasę!</button>
      </div>
    </div>

    <!-- Success -->
    <div id="phase-success" class="task-body" style="display:none;">
      <div class="task-card" style="border-color:#4CAF50;">
        <div class="task-card-icon">🗺️</div>
        <div class="task-card-text">
          <strong>ZŁOMEK:</strong> <em>"Paczka jest w Lokalizacji 1!"</em><br><br>
          <span id="e3-hint" style="color:#FFD700;font-weight:700;">PLACEHOLDER</span>
        </div>
      </div>
      <a class="btn-primary" href="../3/">⚡ JEDŹ DO LOKALIZACJI 1 →</a>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    // NFC gate entry (FLIK22)
    if (checkNFCToken(2)) {
      document.getElementById('nfc-gate').style.display = 'none';
      startStage();
    } else {
      setupBackupCodeInput(2, () => {
        document.getElementById('nfc-gate').style.display = 'none';
        startStage();
      });
    }

    function startStage() {
      startEnergyMonitoring();
      document.getElementById('phase-trivia').style.display = 'block';
      showHandoff('amelia', 'Odpowiedz na 3 pytania o filmie Auta — 2 z 3 muszą być poprawne!', startTrivia);
    }

    // CARS TRIVIA
    const QUESTIONS = [
      { q: 'Jakiego koloru jest Zygzak McQueen?',            options: ['Czerwony','Niebieski','Zielony'], correct: 0 },
      { q: 'Jak nazywa się laweta — przyjaciel Zygzaka?',    options: ['Złomek','Filk','Ramona'],         correct: 0 },
      { q: 'W jakim mieście mieszka Zygzak po wyścigu?',     options: ['Radiator Springs','Nowy Jork','Las Vegas'], correct: 0 },
    ];
    let triviaIdx = 0, triviaCorrect = 0;

    function startTrivia() {
      document.getElementById('trivia-content').style.display = 'block';
      showTriviaQuestion();
    }

    function showTriviaQuestion() {
      const q = QUESTIONS[triviaIdx];
      document.getElementById('trivia-progress').textContent =
        `Pytanie ${triviaIdx+1} z ${QUESTIONS.length} | Poprawne: ${triviaCorrect}`;
      document.getElementById('trivia-question-wrap').innerHTML = `
        <div class="task-card">
          <div class="task-card-icon">🤔</div>
          <div class="task-card-text" style="font-size:1.1rem;font-weight:700;">${q.q}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
          ${q.options.map((opt, i) =>
            `<button class="btn-primary trivia-opt" data-idx="${i}"
              style="background:rgba(255,255,255,0.06);border:1.5px solid rgba(233,69,96,0.3);">${opt}</button>`
          ).join('')}
        </div>`;
      document.querySelectorAll('.trivia-opt').forEach(btn =>
        btn.addEventListener('click', () => onTriviaAnswer(Number(btn.dataset.idx)))
      );
    }

    function onTriviaAnswer(idx) {
      const q = QUESTIONS[triviaIdx];
      const res = document.getElementById('trivia-result');
      if (idx === q.correct) {
        triviaCorrect++;
        res.textContent = '✅ Poprawnie!'; res.style.color = '#4CAF50';
      } else {
        res.textContent = `❌ Nie! Prawidłowa: ${q.options[q.correct]}`; res.style.color = '#e94560';
      }
      res.style.display = 'block';
      setTimeout(() => {
        res.style.display = 'none';
        triviaIdx++;
        if (triviaIdx >= QUESTIONS.length) {
          if (triviaCorrect >= 2) { onTriviaSuccess(); }
          else {
            triviaIdx = 0; triviaCorrect = 0;
            document.getElementById('trivia-progress').textContent = 'Za mało! Próbujcie ponownie...';
            setTimeout(showTriviaQuestion, 1200);
          }
        } else { showTriviaQuestion(); }
      }, 1500);
    }

    function onTriviaSuccess() {
      document.getElementById('phase-trivia').style.display = 'none';
      document.getElementById('phase-ride').style.display   = 'block';
      showHandoff('ania', 'Jedź ≥5 km/h przez 60 sekund bez zatrzymania!', startRide);
    }

    // GPS RIDE
    function startRide() {
      document.getElementById('ride-content').style.display = 'block';
      const spdEl=document.getElementById('ride-spd'), fillEl=document.getElementById('ride-fill'), secsEl=document.getElementById('ride-secs');
      const TARGET=60; let movingSecs=0, prevPos=null, prevTime=null;
      let watchId = navigator.geolocation.watchPosition(pos => {
        const now=Date.now(), lat=pos.coords.latitude, lng=pos.coords.longitude;
        let spd=0;
        if (prevPos&&prevTime) { const dt=(now-prevTime)/1000, dist=haversineM(prevPos.lat,prevPos.lng,lat,lng); spd=dt>0?(dist/dt)*3.6:0; }
        prevPos={lat,lng}; prevTime=now;
        spdEl.textContent=Math.round(spd);
        if (spd>=5) movingSecs=Math.min(TARGET,movingSecs+1);
        fillEl.style.width=(movingSecs/TARGET*100)+'%'; secsEl.textContent=Math.round(movingSecs);
        if (movingSecs>=TARGET) { navigator.geolocation.clearWatch(watchId); onRideSuccess(); }
      }, null, {enableHighAccuracy:true,maximumAge:1000});
    }

    function onRideSuccess() {
      document.getElementById('phase-ride').style.display    = 'none';
      document.getElementById('phase-confirm').style.display = 'block';
      showHandoff('szymon', 'Sprawdź strzałkę GPS i potwierdź że jedziecie w dobrym kierunku do Lokalizacji 1!', () => {
        document.getElementById('confirm-content').style.display = 'block';
        document.getElementById('confirm-btn').addEventListener('click', onConfirmSuccess);
      });
    }

    function onConfirmSuccess() {
      GameState.markStage(2);
      document.getElementById('phase-confirm').style.display = 'none';
      document.getElementById('phase-success').style.display = 'block';
      document.getElementById('e3-hint').textContent = STAGE3_NFC_HINT;
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `zadanie/2/index.html`:
- NFC gate shown first; enter `FLIK22` → gate disappears, Amelia handoff appears
- Trivia shows 3 questions; wrong answer shown with correct; requires 2/3 correct before advancing
- After trivia: Ania handoff → GPS ride shows speed in km/h and 0/60 seconds progress
- After ride: Szymon handoff → confirm button → success screen with E3 hint placeholder

- [ ] **Step 3: Commit**

```bash
git add zadanie/2/index.html
git commit -m "feat(e2): Cars trivia + GPS ride + GPS confirm, 3-role handoff"
```

---

## Task 5: E3 — GPS Nav + NFC Unlock + Reaction Game

**Files:**
- Overwrite: `zadanie/3/index.html`

**Roles:** Szymon (GPS nav, dblclick skip) → Amelia (NFC/backup code entry) → Ania (reaction game: 4 buttons, sequence 4, 10s)

- [ ] **Step 1: Write complete zadanie/3/index.html**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Etap 3 — Auta Szymon</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 3 / 6</span>
    </div>

    <!-- Phase 1: Szymon GPS nav -->
    <div id="phase-nav" class="task-body">
      <div id="nav-content" style="display:none;">
        <div class="task-step-label">🗺️ Nawiguj do Lokalizacji 1</div>
        <div class="task-title">Szukamy Paczki #1!</div>
        <div class="task-card">
          <div class="task-card-icon">📻</div>
          <div class="task-card-text"><em>Złomek: "Paczka Szymona! Jedźcie za strzałką!"</em></div>
        </div>
        <div class="nav-widget">
          <div class="nav-arrow-wrap" id="nav-arrow-wrap">
            <span class="nav-arrow" id="nav-arrow">⬆️</span>
          </div>
          <div class="nav-distance" id="nav-distance">-- <span>m</span></div>
          <div class="nav-hint" id="nav-hint">Szukam sygnału GPS...</div>
          <div class="nav-status" id="nav-status">Czekam na GPS...</div>
        </div>
        <div class="task-hint">Jedź za strzałką! Dblclick na status żeby pominąć (dev).</div>
      </div>
    </div>

    <!-- Phase 2: Amelia NFC entry -->
    <div id="phase-nfc" class="task-body" style="display:none;">
      <div id="nfc-content" style="display:none;">
        <div class="task-step-label">📡 Odblokuj Lokalizację 1</div>
        <div class="task-title">Skanuj tag NFC!</div>
        <div class="task-card">
          <div class="task-card-icon">📡</div>
          <div class="task-card-text"><strong>Dotknij tagiem NFC telefonu lub wpisz kod!</strong></div>
        </div>
        <div class="backup-input-wrap">
          <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
          <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
          <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
        </div>
      </div>
    </div>

    <!-- Phase 3: Ania reaction game -->
    <div id="phase-game" class="task-body" style="display:none;">
      <div id="game-content" style="display:none;">
        <div class="task-step-label">🏎️ Pit Stop Chaos!</div>
        <div class="task-title">Klikaj szybko!</div>
        <div class="task-card">
          <div class="task-card-icon">🔧</div>
          <div class="task-card-text">
            <em>"Klikajcie podświetlone narzędzia w tej samej kolejności!"</em>
          </div>
        </div>
        <div class="task-countdown ok" id="game-timer">10s</div>
        <div class="reaction-grid" id="reaction-grid"></div>
        <div class="task-hint" id="game-status">Zapamiętaj kolejność!</div>
        <button id="game-retry" class="btn-primary" style="display:none;margin-top:12px;">🔄 Spróbuj ponownie</button>
      </div>
    </div>

    <!-- Phase 4: Success -->
    <div id="phase-success" class="task-body" style="display:none;">
      <div class="symbol-reveal active">
        <div class="symbol-label">Symbol #1 zdobyty!</div>
        <div class="symbol-big">🔧</div>
        <div class="symbol-name">KLUCZ</div>
        <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">To 1. znak kodu do sejfu!</div>
      </div>
      <div class="task-card" style="margin-top:16px;border-color:#4CAF50;">
        <div class="task-card-icon">📦</div>
        <div class="task-card-text">
          <strong>Złomek: "Paczka #1 jest tu obok! Weźcie ją!"</strong><br>
          Jedźcie do <strong>Lokalizacji 2!</strong>
        </div>
      </div>
      <a class="btn-primary" href="../4/">⚡ JEDŹ DO LOKALIZACJI 2 →</a>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    initFuelBottle(3);
    startEnergyMonitoring();

    // Step 1: Szymon GPS nav
    showHandoff('szymon', 'Nawiguj GPS do Lokalizacji 1 — jesteś kierowcą!', startNav);

    function startNav() {
      document.getElementById('nav-content').style.display = 'block';
      const waypoints = STAGE3_WAYPOINTS.length > 0 ? STAGE3_WAYPOINTS :
        [{ lat: 0, lng: 0, hint: 'PLACEHOLDER: uzupełnij współrzędne Lokalizacji 1' }];
      Navigation.start(waypoints,
        (angle, dist, isClose, isLast, hint) => {
          renderNav(angle, dist, isClose, isLast, hint);
          if (isClose && isLast) setTimeout(showNFCPhase, 1500);
        },
        (idx, isFinal, nextHint) => {
          if (!isFinal && nextHint) document.getElementById('nav-hint').textContent = '✓ ' + nextHint;
        }
      );
      document.getElementById('nav-status').addEventListener('dblclick', showNFCPhase);
    }

    function showNFCPhase() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display = 'none';
      document.getElementById('phase-nfc').style.display = 'block';
      // Step 2: Amelia enters NFC code
      showHandoff('amelia', 'Wpisz kod NFC z naklejki obok tagu — PACZK3!', () => {
        document.getElementById('nfc-content').style.display = 'block';
        if (checkNFCToken(3)) { startGamePhase(); return; }
        setupBackupCodeInput(3, startGamePhase);
      });
    }

    function startGamePhase() {
      document.getElementById('phase-nfc').style.display  = 'none';
      document.getElementById('phase-game').style.display = 'block';
      // Step 3: Ania reaction game
      showHandoff('ania', 'Zapamiętaj kolejność 4 narzędzi i kliknij je w tej samej kolejności w 10 sekund!', () => {
        document.getElementById('game-content').style.display = 'block';
        runReactionGame();
      });
    }

    // REACTION GAME: 4 icons, sequence length 4, 10s time limit
    const ICONS = ['🔧','🔩','🪛','⚙️'];
    const SEQ_LEN = 4, TIME_LIMIT = 10000;

    function runReactionGame() {
      const grid    = document.getElementById('reaction-grid');
      const timerEl = document.getElementById('game-timer');
      const statusEl = document.getElementById('game-status');
      const retryEl  = document.getElementById('game-retry');
      retryEl.style.display = 'none';
      grid.innerHTML = '';
      const btns = ICONS.map((icon, i) => {
        const b = document.createElement('button');
        b.className = 'reaction-btn';
        b.style.background = `hsl(${i*90},60%,25%)`;
        b.textContent = icon; b.dataset.idx = i;
        grid.appendChild(b); return b;
      });
      const seq = Array.from({length: SEQ_LEN}, () => Math.floor(Math.random() * ICONS.length));
      let step = 0;
      statusEl.textContent = 'Zapamiętaj kolejność...';
      let showIdx = 0;
      function showNext() {
        if (showIdx > 0) btns[seq[showIdx-1]].classList.remove('active');
        if (showIdx >= seq.length) { statusEl.textContent = 'Teraz klikaj w tej samej kolejności!'; startInput(); return; }
        btns[seq[showIdx]].classList.add('active');
        showIdx++;
        setTimeout(showNext, 700);
      }
      setTimeout(showNext, 500);

      function startInput() {
        let deadline = Date.now() + TIME_LIMIT;
        function tick() {
          const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
          timerEl.textContent = left + 's';
          timerEl.className   = 'task-countdown ' + (left <= 3 ? 'warning' : 'ok');
          if (left > 0) setTimeout(tick, 500); else onFail();
        }
        tick();
        btns.forEach(b => b.addEventListener('click', () => {
          if (Number(b.dataset.idx) === seq[step]) {
            b.style.background = 'rgba(76,175,80,0.4)'; step++;
            if (step >= seq.length) onWin();
          } else { onFail(); }
        }, { once: true }));
      }
      function onWin()  { onGameSuccess(); }
      function onFail() {
        statusEl.textContent = '❌ Błąd! Spróbuj ponownie!'; retryEl.style.display = 'block';
        retryEl.onclick = () => { retryEl.style.display='none'; runReactionGame(); };
      }
    }

    function onGameSuccess() {
      GameState.addSymbol('wrench');
      GameState.markStage(3);
      document.getElementById('phase-game').style.display    = 'none';
      document.getElementById('phase-success').style.display = 'block';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `zadanie/3/index.html`:
- Szymon handoff first; after confirm: GPS nav arrow shows
- Dblclick `nav-status` → Amelia handoff appears
- After confirm: NFC input shows; enter `PACZK3` → Ania handoff
- After confirm: 4-button reaction game with 4-step sequence and 10s timer
- Win → 🔧 symbol reveal and link to E4

- [ ] **Step 3: Commit**

```bash
git add zadanie/3/index.html
git commit -m "feat(e3): GPS nav + NFC unlock + simplified reaction game, 3-role handoff"
```

---

## Task 6: E4 — GPS Nav + Memory Match + 4-Phase Speed Sequence

**Files:**
- Overwrite: `zadanie/4/index.html`

**Roles:** Szymon (GPS nav) → NFC gate (shared) → Amelia (memory 8 cards 90s) → 4-phase speed sequence:
  1. Ania: 5–10 km/h for 10s (timer pauses outside zone, does NOT reset)
  2. Szymon: 5–10 km/h for 25s
  3. Amelia: ≥15 km/h for 3s (resets if drops below)
  4. Szymon: ≥15 km/h for 6s

- [ ] **Step 1: Write complete zadanie/4/index.html**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Etap 4 — Auta Szymon</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 4 / 6</span>
    </div>

    <!-- Phase 1: Szymon GPS nav -->
    <div id="phase-nav" class="task-body">
      <div id="nav-content" style="display:none;">
        <div class="task-step-label">🗺️ Nawiguj do Lokalizacji 2</div>
        <div class="task-title">Szukamy Paczki #2!</div>
        <div class="nav-widget">
          <div class="nav-arrow-wrap" id="nav-arrow-wrap">
            <span class="nav-arrow" id="nav-arrow">⬆️</span>
          </div>
          <div class="nav-distance" id="nav-distance">--</div>
          <div class="nav-hint" id="nav-hint">Szukam GPS...</div>
          <div class="nav-status" id="nav-status">Czekam na GPS...</div>
        </div>
        <div class="task-hint">Jedź za strzałką! Dblclick na status żeby pominąć (dev).</div>
      </div>
    </div>

    <!-- NFC gate (shared, no handoff) -->
    <div id="phase-nfc" class="task-body" style="display:none;">
      <div class="task-step-label">📡 Zeskanuj tag NFC</div>
      <div class="task-card"><div class="task-card-icon">📡</div>
        <div class="task-card-text"><strong>Dotknij tagiem NFC telefonu!</strong></div></div>
      <div class="backup-input-wrap">
        <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
        <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
        <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
      </div>
    </div>

    <!-- Phase 2: Amelia memory match -->
    <div id="phase-memory" class="task-body" style="display:none;">
      <div id="memory-content" style="display:none;">
        <div class="task-step-label">🃏 Memory — Bohaterowie Aut</div>
        <div class="task-title">Znajdź pary!</div>
        <div class="task-card">
          <div class="task-card-icon">⏱️</div>
          <div class="task-card-text">
            Dopasuj wszystkie pary zanim czas minie!<br>
            <div class="task-countdown ok" id="mem-timer" style="font-size:1.8rem;margin-top:8px;">90s</div>
          </div>
        </div>
        <div class="memory-grid" id="memory-grid"></div>
        <button id="mem-retry" class="btn-primary" style="display:none;margin-top:12px;">🔄 Spróbuj ponownie</button>
      </div>
    </div>

    <!-- Phase 3: Speed sequence container -->
    <div id="phase-speed" class="task-body" style="display:none;">
      <div id="speed-content" style="display:none;">
        <div class="task-step-label" id="spd-label">💨 Sekwencja Prędkości</div>
        <div class="task-title" id="spd-title"></div>
        <div class="task-card">
          <div class="task-card-icon">🚀</div>
          <div class="task-card-text" id="spd-desc"></div>
        </div>
        <!-- Sweet-spot gauge (shown for phases 1-2) -->
        <div id="sweet-gauge" style="display:none;">
          <div class="speed-widget">
            <div class="speed-number" id="spd-val">0</div>
            <div class="speed-unit">km/h</div>
            <div style="position:relative;margin:8px 0;">
              <div class="speed-zone-wrap" id="sweet-wrap">
                <div class="speed-zone-fill" id="sweet-fill"></div>
                <!-- Green zone: 5-10 on 0-20 scale = 25%-50% -->
                <div class="speed-zone-green" style="left:25%;width:25%;"></div>
                <!-- Markers -->
                <div class="speed-zone-marker" style="left:25%;"></div>
                <div class="speed-zone-marker" style="left:50%;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#888;">
                <span>0</span><span style="color:#4CAF50;">5</span>
                <span style="color:#4CAF50;">10</span><span>20 km/h</span>
              </div>
            </div>
            <div class="task-countdown ok" id="sweet-hold">0.0 s</div>
            <div style="font-size:0.85rem;color:#aaa;" id="sweet-status">Jedź 5–10 km/h!</div>
          </div>
        </div>
        <!-- Burst gauge (shown for phases 3-4) -->
        <div id="burst-gauge" style="display:none;">
          <div class="speed-widget">
            <div class="speed-number" id="burst-val">0</div>
            <div class="speed-unit">km/h</div>
            <div style="position:relative;margin:8px 0;">
              <div class="speed-progress-track" style="height:24px;">
                <div class="speed-progress-fill" id="burst-fill"
                     style="background:linear-gradient(90deg,#4CAF50,#FFD700);"></div>
                <div id="burst-marker"
                     style="position:absolute;top:0;height:100%;width:3px;
                            background:#e94560;left:50%;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#888;">
                <span>0</span><span style="color:#e94560;">▲15 km/h</span><span>30</span>
              </div>
            </div>
            <div class="task-countdown ok" id="burst-hold">0.0 s</div>
            <div style="font-size:0.85rem;color:#aaa;" id="burst-status">Jedź ≥15 km/h!</div>
          </div>
        </div>
        <button id="spd-retry" class="btn-primary" style="display:none;margin-top:12px;">🔄 Spróbuj ponownie</button>
      </div>
    </div>

    <!-- Success -->
    <div id="phase-success" class="task-body" style="display:none;">
      <div class="symbol-reveal active">
        <div class="symbol-label">Symbol #2 zdobyty!</div>
        <div class="symbol-big">🏁</div>
        <div class="symbol-name">FLAGA</div>
        <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">To 2. znak kodu do sejfu!</div>
      </div>
      <div class="task-card" style="margin-top:16px;border-color:#4CAF50;">
        <div class="task-card-icon">📦</div>
        <div class="task-card-text">
          <strong>Paczka #2 jest obok! Weźcie ją!</strong><br>Jedźcie do <strong>Lokalizacji 3!</strong>
        </div>
      </div>
      <a class="btn-primary" href="../5/">⚡ JEDŹ DO LOKALIZACJI 3 →</a>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    initFuelBottle(4);
    startEnergyMonitoring();

    // Step 1: Szymon GPS nav
    showHandoff('szymon', 'Nawiguj GPS do Lokalizacji 2 — multi-punkt trasa!', startNav);

    function startNav() {
      document.getElementById('nav-content').style.display = 'block';
      const waypoints = STAGE4_WAYPOINTS.length > 0 ? STAGE4_WAYPOINTS :
        [{ lat: 0, lng: 0, hint: 'PLACEHOLDER: uzupełnij trasę Lokalizacji 2' }];
      Navigation.start(waypoints,
        (a,d,close,last,hint) => { renderNav(a,d,close,last,hint); if(close&&last) setTimeout(showNFCPhase,1500); },
        (i,fin,nh) => { if(!fin&&nh) document.getElementById('nav-hint').textContent='✓ '+nh; }
      );
      document.getElementById('nav-status').addEventListener('dblclick', showNFCPhase);
    }

    function showNFCPhase() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display = 'none';
      document.getElementById('phase-nfc').style.display = 'block';
      setupBackupCodeInput(4, startMemory);
      if (checkNFCToken(4)) startMemory();
    }

    // Step 2: Amelia memory
    function startMemory() {
      document.getElementById('phase-nfc').style.display    = 'none';
      document.getElementById('phase-memory').style.display = 'block';
      showHandoff('amelia', 'Znajdź wszystkie 4 pary kart w 90 sekund!', () => {
        document.getElementById('memory-content').style.display = 'block';
        runMemory();
      });
    }

    const PAIRS = [
      {emoji:'🏎️',name:'Zygzak'},{emoji:'🚙',name:'Złomek'},
      {emoji:'🟣',name:'Ramona'},{emoji:'🔵',name:'Szerszeń'},
    ];

    function runMemory() {
      const grid=document.getElementById('memory-grid'), timerEl=document.getElementById('mem-timer');
      const retryEl=document.getElementById('mem-retry');
      retryEl.style.display='none';
      let matched=0, flipped=[], blocked=false;
      const cards=[...PAIRS,...PAIRS].sort(()=>Math.random()-0.5);
      grid.innerHTML='';
      const els=cards.map((c,i)=>{
        const div=document.createElement('div');
        div.className='mem-card face-down'; div.dataset.emoji=c.emoji; div.dataset.idx=i;
        div.addEventListener('click',()=>flipCard(div)); grid.appendChild(div); return div;
      });
      let timeLeft=90;
      const tick=setInterval(()=>{
        timeLeft--; timerEl.textContent=timeLeft+'s';
        timerEl.className='task-countdown '+(timeLeft<=20?'warning':'ok');
        if(timeLeft<=0){clearInterval(tick);onMemFail();}
      },1000);
      function flipCard(el){
        if(blocked||!el.classList.contains('face-down')||el.classList.contains('matched'))return;
        el.classList.remove('face-down'); el.textContent=el.dataset.emoji; flipped.push(el);
        if(flipped.length===2){
          blocked=true;
          if(flipped[0].dataset.emoji===flipped[1].dataset.emoji){
            flipped.forEach(c=>c.classList.add('matched')); matched++; flipped=[]; blocked=false;
            if(matched===PAIRS.length){clearInterval(tick);onMemWin();}
          }else{
            setTimeout(()=>{flipped.forEach(c=>{c.classList.add('face-down');c.textContent='';});flipped=[];blocked=false;},900);
          }
        }
      }
      function onMemWin(){startSpeedSequence();}
      function onMemFail(){
        retryEl.style.display='block';
        retryEl.onclick=()=>{retryEl.style.display='none';runMemory();};
      }
    }

    // Step 3: 4-phase speed sequence
    const SPEED_PHASES = [
      { player:'ania',   type:'sweet', target:10, hold:10,  label:'Tester: 5–10 km/h',    desc:'Jedź 5–10 km/h przez 10 sekund! (timer zatrzymuje się gdy wyjdziesz ze strefy)' },
      { player:'szymon', type:'sweet', target:10, hold:25,  label:'Kierowca: 5–10 km/h',   desc:'Jedź 5–10 km/h przez 25 sekund! (timer zatrzymuje się gdy wyjdziesz ze strefy)' },
      { player:'amelia', type:'burst', target:15, hold:3,   label:'Mechanik: ≥15 km/h',    desc:'Osiągnij ≥15 km/h i trzymaj przez 3 sekundy! (timer się resetuje gdy zwolnisz)' },
      { player:'szymon', type:'burst', target:15, hold:6,   label:'Finał: ≥15 km/h',       desc:'Osiągnij ≥15 km/h i trzymaj przez 6 sekund! (timer się resetuje gdy zwolnisz)' },
    ];
    let phaseIdx = 0;

    function startSpeedSequence() {
      document.getElementById('phase-memory').style.display = 'none';
      document.getElementById('phase-speed').style.display  = 'block';
      runSpeedPhase();
    }

    function runSpeedPhase() {
      const ph = SPEED_PHASES[phaseIdx];
      document.getElementById('spd-label').textContent = `Faza ${phaseIdx+1}/4 — ${ph.label}`;
      document.getElementById('spd-title').textContent = ph.type === 'sweet' ? 'Strefa Prędkości!' : 'PEŁNA PARA!';
      document.getElementById('spd-desc').textContent  = ph.desc;
      document.getElementById('spd-retry').style.display = 'none';
      showHandoff(ph.player, ph.desc, () => {
        document.getElementById('speed-content').style.display = 'block';
        if (ph.type === 'sweet') runSweetSpot(ph);
        else                     runBurst(ph);
      });
    }

    function runSweetSpot(ph) {
      document.getElementById('sweet-gauge').style.display = 'block';
      document.getElementById('burst-gauge').style.display = 'none';
      const valEl=document.getElementById('spd-val'), fillEl=document.getElementById('sweet-fill');
      const holdEl=document.getElementById('sweet-hold'), statusEl=document.getElementById('sweet-status');
      const retryEl=document.getElementById('spd-retry');
      const MAX_DISPLAY=20, MIN_SPD=5, MAX_SPD=10;
      let holdSecs=0, done=false, prevPos=null, prevTime=null;
      const watchId=navigator.geolocation.watchPosition(pos=>{
        if(done)return;
        const now=Date.now(); let spd=0;
        if(prevPos&&prevTime){const dt=(now-prevTime)/1000,dist=haversineM(prevPos.lat,prevPos.lng,pos.coords.latitude,pos.coords.longitude);spd=dt>0.2?(dist/dt)*3.6:0;}
        prevPos={lat:pos.coords.latitude,lng:pos.coords.longitude}; prevTime=now;
        valEl.textContent=Math.round(spd);
        fillEl.style.width=Math.min(100,spd/MAX_DISPLAY*100)+'%';
        const inside=spd>=MIN_SPD&&spd<=MAX_SPD;
        fillEl.className='speed-zone-fill'+(inside?' inside':spd>MAX_SPD?' fast':'');
        if(inside){
          holdSecs+=0.5; // GPS fires ~every 0.5s
          statusEl.textContent='✅ Idealna prędkość! Trzymaj!';
        }else{
          statusEl.textContent=spd<MIN_SPD?'Za wolno! Przyspiesz!':'Za szybko! Zwolnij!';
          // timer PAUSES but does NOT reset
        }
        holdEl.textContent=holdSecs.toFixed(1)+' / '+ph.hold+'s';
        if(holdSecs>=ph.hold){done=true;navigator.geolocation.clearWatch(watchId);onSpeedPhaseSuccess();}
      },null,{enableHighAccuracy:true,maximumAge:500});
      retryEl.addEventListener('click',()=>{
        navigator.geolocation.clearWatch(watchId);
        document.getElementById('sweet-gauge').style.display='none';
        retryEl.style.display='none';
        runSpeedPhase();
      });
    }

    function runBurst(ph) {
      document.getElementById('sweet-gauge').style.display = 'none';
      document.getElementById('burst-gauge').style.display = 'block';
      const valEl=document.getElementById('burst-val'), fillEl=document.getElementById('burst-fill');
      const holdEl=document.getElementById('burst-hold'), statusEl=document.getElementById('burst-status');
      const retryEl=document.getElementById('spd-retry');
      const TARGET=15, MAX_DISPLAY=30;
      let holdSecs=0, done=false, prevPos=null, prevTime=null;
      const watchId=navigator.geolocation.watchPosition(pos=>{
        if(done)return;
        const now=Date.now(); let spd=0;
        if(prevPos&&prevTime){const dt=(now-prevTime)/1000,dist=haversineM(prevPos.lat,prevPos.lng,pos.coords.latitude,pos.coords.longitude);spd=dt>0.2?(dist/dt)*3.6:0;}
        prevPos={lat:pos.coords.latitude,lng:pos.coords.longitude}; prevTime=now;
        valEl.textContent=Math.round(spd);
        fillEl.style.width=Math.min(100,spd/MAX_DISPLAY*100)+'%';
        fillEl.style.background=spd>=TARGET?'linear-gradient(90deg,#4CAF50,#e94560)':'linear-gradient(90deg,#4CAF50,#FFD700)';
        if(spd>=TARGET){
          holdSecs+=0.5; statusEl.textContent='KA-CZAOW! Trzymajcie!';
        }else{
          holdSecs=0; // RESETS if drops below
          statusEl.textContent=spd>10?'Prawie! Szybciej!':'Jedźcie szybko!';
        }
        holdEl.textContent=holdSecs.toFixed(1)+' / '+ph.hold+'s';
        if(holdSecs>=ph.hold){done=true;navigator.geolocation.clearWatch(watchId);onSpeedPhaseSuccess();}
      },null,{enableHighAccuracy:true,maximumAge:500});
      retryEl.addEventListener('click',()=>{
        navigator.geolocation.clearWatch(watchId);
        document.getElementById('burst-gauge').style.display='none';
        retryEl.style.display='none';
        runSpeedPhase();
      });
    }

    function onSpeedPhaseSuccess() {
      phaseIdx++;
      if (phaseIdx < SPEED_PHASES.length) {
        document.getElementById('sweet-gauge').style.display = 'none';
        document.getElementById('burst-gauge').style.display = 'none';
        document.getElementById('speed-content').style.display = 'none';
        runSpeedPhase();
      } else {
        // All 4 phases done
        GameState.addSymbol('flag');
        GameState.markStage(4);
        document.getElementById('phase-speed').style.display   = 'none';
        document.getElementById('phase-success').style.display = 'block';
      }
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `zadanie/4/index.html`:
- Szymon handoff first → nav arrow
- Dblclick `nav-status` → NFC gate; enter `PACZK4` → Amelia handoff
- After confirm: 4×4 memory grid with 90s timer; match all pairs
- After memory: Ania handoff for phase 1/4 (5–10 km/h sweet spot, 10s)
- Sweet-spot: fill bar turns green when in zone; timer accumulates only while inside
- Phase 2: Szymon, same zone, 25s
- Phase 3: Amelia handoff, burst ≥15 km/h 3s; hold counter resets if speed drops
- Phase 4: Szymon, burst 6s; after success: 🏁 symbol reveal

- [ ] **Step 3: Commit**

```bash
git add zadanie/4/index.html
git commit -m "feat(e4): GPS nav + memory + 4-phase speed sequence with role handoffs"
```

---

## Task 7: E5 — GPS Nav + Beeper + NFC + Amelia Riddle + Ania Level

**Files:**
- Overwrite: `zadanie/5/index.html`

**Roles:** Szymon (GPS nav + beeper narrative) → NFC gate (shared) → Amelia (word riddle) → Ania (level challenge 15s)

**Note:** Role order changed from original (was level then riddle — now riddle then level per spec)

- [ ] **Step 1: Write complete zadanie/5/index.html**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Etap 5 — Auta Szymon</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 5 / 6</span>
    </div>

    <!-- Phase 1: Szymon GPS nav -->
    <div id="phase-nav" class="task-body">
      <div id="nav-content" style="display:none;">
        <div class="task-step-label">🗺️ Nawiguj do Lokalizacji 3</div>
        <div class="task-title">Tracker Złomka żyje!</div>
        <div class="task-card">
          <div class="task-card-icon">📡</div>
          <div class="task-card-text">
            <em>Złomek: "Ten tracker chyba nie mój... ale pikanie wskazuje na trzecią paczkę!"</em>
          </div>
        </div>
        <div class="nav-widget">
          <div class="nav-arrow-wrap" id="nav-arrow-wrap">
            <span class="nav-arrow" id="nav-arrow">⬆️</span>
          </div>
          <div class="nav-distance" id="nav-distance">--</div>
          <div class="nav-hint" id="nav-hint">Szukam GPS...</div>
          <div class="nav-status" id="nav-status">Czekam na GPS...</div>
        </div>
        <div class="task-hint">Jedź za strzałką! Dblclick na status = skip (dev).</div>
      </div>
    </div>

    <!-- Phase 2: Beeper narrative (Szymon) -->
    <div id="phase-beeper" class="task-body" style="display:none;">
      <div id="beeper-content" style="display:none;">
        <div class="task-step-label">📡 Tracker aktywny!</div>
        <div class="task-title">Szukajcie dźwięku!</div>
        <div class="task-card">
          <div class="task-card-icon" style="animation:pulse 0.6s infinite;">📡</div>
          <div class="task-card-text">
            <strong>PIKANIE SIĘ WZMAGA!</strong><br><br>
            Jesteście w pobliżu! Szukajcie urządzenia które pika — paczka jest tam gdzie pikanie jest najgłośniejsze!<br><br>
            <em>Gdy znajdziecie — naciśnij przycisk poniżej!</em>
          </div>
        </div>
        <div class="task-hint">🔊 Im głośniej pika — tym bliżej jesteście!</div>
        <button id="beeper-found-btn" class="btn-primary" style="margin-top:16px;">
          📡 Znaleźliśmy! Skanujemy NFC →
        </button>
      </div>
    </div>

    <!-- NFC gate (shared) -->
    <div id="phase-nfc" class="task-body" style="display:none;">
      <div class="task-step-label">📡 Zeskanuj tag NFC</div>
      <div class="task-card"><div class="task-card-icon">📡</div>
        <div class="task-card-text"><strong>Dotknij tagiem NFC telefonu!</strong></div></div>
      <div class="backup-input-wrap">
        <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
        <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
        <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
      </div>
    </div>

    <!-- Phase 3: Amelia riddle -->
    <div id="phase-riddle" class="task-body" style="display:none;">
      <div id="riddle-content" style="display:none;">
        <div class="task-step-label">🧩 Zagadka Auciarza</div>
        <div class="task-title">Złomek pyta!</div>
        <div class="task-card">
          <div class="task-card-icon">🤔</div>
          <div class="task-card-text" style="font-size:1.1rem;line-height:1.8;">
            <strong>Jestem czarny i okrągły,<br>
            z gumy i bez mnie auto nie ruszy.<br>
            Siedzę na felgach.<br>
            Jestem...?</strong>
          </div>
        </div>
        <div style="display:flex;gap:8px;padding:0 0 12px;">
          <input id="riddle-input" type="text"
            style="flex:1;background:rgba(255,255,255,0.06);border:1.5px solid rgba(233,69,96,0.3);
                   border-radius:8px;color:#fff;font-size:1.3rem;font-weight:700;
                   padding:12px;text-align:center;outline:none;"
            placeholder="Twoja odpowiedź...">
          <button id="riddle-submit" class="btn-primary" style="width:auto;padding:12px 20px;margin:0;">OK</button>
        </div>
        <div id="riddle-error" style="display:none;color:#e94560;text-align:center;font-size:0.9rem;">
          Hmm, nie do końca... spróbuj jeszcze raz! 🔍
        </div>
      </div>
    </div>

    <!-- Phase 4: Ania level challenge -->
    <div id="phase-level" class="task-body" style="display:none;">
      <div id="level-content" style="display:none;">
        <div class="task-step-label">⚖️ Transport specjalny!</div>
        <div class="task-title">Złomek wiezie jajka!</div>
        <div class="task-card">
          <div class="task-card-icon">🥚</div>
          <div class="task-card-text">
            <em>"Hej amigo! Trzymajcie telefon POZIOMO przez 15 sekund!"</em>
          </div>
        </div>
        <div class="speed-widget">
          <div class="speed-progress-track" style="height:20px;margin-bottom:8px;">
            <div class="speed-progress-fill" id="level-fill"></div>
          </div>
          <div class="level-meter">
            <div class="level-ok-zone"></div>
            <div class="level-indicator" id="level-dot"></div>
          </div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:8px;" id="level-status">Trzymaj poziomo...</div>
          <div class="speed-number" style="font-size:1.6rem;" id="level-secs">0</div>
          <div class="speed-unit">/ 15 sekund</div>
        </div>
        <button id="level-retry" class="btn-primary" style="display:none;margin-top:12px;">🔄 Potłukł jajka! Spróbuj ponownie</button>
        <button id="level-skip" class="btn-primary" style="display:none;margin-top:12px;">Pomiń (brak żyroskopu)</button>
      </div>
    </div>

    <!-- Success -->
    <div id="phase-success" class="task-body" style="display:none;">
      <div class="symbol-reveal active">
        <div class="symbol-label">Symbol #3 zdobyty!</div>
        <div class="symbol-big">⚡</div>
        <div class="symbol-name">BŁYSKAWICA</div>
        <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">To 3. znak kodu do sejfu!</div>
      </div>
      <div class="task-card" style="margin-top:16px;border-color:#4CAF50;">
        <div class="task-card-icon">📦</div>
        <div class="task-card-text">
          <strong>Paczka #3 jest tu! Weźcie ją!</strong><br>Ostatnia lokalizacja! Jedźcie do <strong>Lokalizacji 4!</strong>
        </div>
      </div>
      <a class="btn-primary" href="../6/">⚡ OSTATNIA LOKALIZACJA! →</a>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    initFuelBottle(5);
    startEnergyMonitoring();

    // Step 1: Szymon GPS nav
    showHandoff('szymon', 'Nawiguj GPS do Lokalizacji 3 — słuchaj beepera!', startNav);

    function startNav() {
      document.getElementById('nav-content').style.display = 'block';
      const waypoints = STAGE5_WAYPOINTS.length > 0 ? STAGE5_WAYPOINTS :
        [{ lat: 0, lng: 0, hint: 'PLACEHOLDER: uzupełnij współrzędne Lokalizacji 3' }];
      Navigation.start(waypoints,
        (a,d,close,last,hint) => { renderNav(a,d,close,last,hint); if(close&&last) setTimeout(showBeeper,1500); },
        (i,fin,nh) => { if(!fin&&nh) document.getElementById('nav-hint').textContent='✓ '+nh; }
      );
      document.getElementById('nav-status').addEventListener('dblclick', showBeeper);
    }

    function showBeeper() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display    = 'none';
      document.getElementById('phase-beeper').style.display = 'block';
      showHandoff('szymon', 'Szukaj urządzenia które pika! Gdy znajdziesz — naciśnij przycisk!', () => {
        document.getElementById('beeper-content').style.display = 'block';
        document.getElementById('beeper-found-btn').addEventListener('click', showNFCPhase);
      });
    }

    function showNFCPhase() {
      document.getElementById('phase-beeper').style.display = 'none';
      document.getElementById('phase-nfc').style.display    = 'block';
      setupBackupCodeInput(5, startRiddle);
      if (checkNFCToken(5)) startRiddle();
    }

    // Step 2: Amelia riddle
    function startRiddle() {
      document.getElementById('phase-nfc').style.display    = 'none';
      document.getElementById('phase-riddle').style.display = 'block';
      showHandoff('amelia', 'Odpowiedz na zagadkę Złomka — co jest czarne, okrągłe i bez gumy auto nie ruszy?', () => {
        document.getElementById('riddle-content').style.display = 'block';
        const ANSWERS = ['opona','opony','guma','koło','kolo'];
        function checkRiddle() {
          const v = document.getElementById('riddle-input').value.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
          if (ANSWERS.includes(v)) {
            document.getElementById('phase-riddle').style.display = 'none';
            startLevel();
          } else {
            document.getElementById('riddle-error').style.display = 'block';
            setTimeout(() => document.getElementById('riddle-error').style.display='none', 2000);
          }
        }
        document.getElementById('riddle-submit').addEventListener('click', checkRiddle);
        document.getElementById('riddle-input').addEventListener('keydown', e => { if(e.key==='Enter') checkRiddle(); });
      });
    }

    // Step 3: Ania level challenge
    function startLevel() {
      document.getElementById('phase-level').style.display = 'block';
      showHandoff('ania', 'Trzymaj telefon POZIOMO przez 15 sekund — nie przechylaj!', () => {
        document.getElementById('level-content').style.display = 'block';
        const fillEl   = document.getElementById('level-fill');
        const secsEl   = document.getElementById('level-secs');
        const statusEl = document.getElementById('level-status');
        const retryEl  = document.getElementById('level-retry');
        const skipEl   = document.getElementById('level-skip');

        const result = Sensors.startLevel(15, 20, 3,
          (good, tot) => {
            fillEl.style.width  = Math.min(100, good/tot*100) + '%';
            secsEl.textContent  = Math.round(good);
            statusEl.textContent = good > 10 ? 'Swietnie! Prawie!' : 'Trzymaj rowno!';
          },
          () => onSuccess(),
          () => {
            retryEl.style.display = 'block';
            retryEl.onclick = () => { retryEl.style.display='none'; startLevel(); };
          }
        );

        if (result && result.fallback) {
          skipEl.style.display = 'block';
          skipEl.addEventListener('click', onSuccess);
        }
      });
    }

    function onSuccess() {
      GameState.addSymbol('lightning');
      GameState.markStage(5);
      document.getElementById('phase-level').style.display   = 'none';
      document.getElementById('phase-success').style.display = 'block';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `zadanie/5/index.html`:
- Szymon nav handoff first → GPS arrow
- Dblclick skip → Szymon beeper handoff → beeper UI + "Znaleźliśmy" button
- Click button → NFC gate; enter `PACZK5` → Amelia handoff
- Amelia riddle: type `opona` (or `guma`, `koło`) → success → Ania handoff
- Ania level: hold flat 15s → success → ⚡ symbol + link to E6

- [ ] **Step 3: Commit**

```bash
git add zadanie/5/index.html
git commit -m "feat(e5): GPS nav + beeper + NFC + Amelia riddle + Ania level, 3-role handoff"
```

---

## Task 8: E6 — GPS Nav + NFC Timer + Amelia Sprint + Ania Dodge

**Files:**
- Overwrite: `zadanie/6/index.html`

**Roles:** Szymon (GPS nav) → NFC gate (PACZK6, starts 5-min countdown + mission bar) → Amelia (GPS sprint 100m) → Ania (dodge game 20s, canvas Flappy-Bird style)

**Mission bar:** `#mission-bar` fixed below `#game-header` (top:44px), shows `⏱️ M:SS`, turns red when <60s, shows CZAS MINĄŁ + reload on expire.

- [ ] **Step 1: Rewrite `zadanie/6/index.html`** — full file (structure same as Tasks 6-7 pattern: phase-nav → phase-nfc → phase-sprint → phase-game → phase-success; mission-bar injected by startMission(); handoff before sprint and before dodge).

Key implementation notes:
- Phase order in DOM: phase-nav, phase-nfc, phase-sprint, phase-game, phase-success
- `missionDeadline` set in `startMission()` (NFC unlock callback); `tickMission()` updates `#mission-bar-time`
- Sprint: `watchPosition`, accumulate haversine distance; fail if `pos.coords.speed < 0.5 m/s` (1.8 km/h) when `prevPos` exists AND `totalDist > 5`; success at ≥ 100m
- Dodge: GRAVITY 0.4, JUMP -8, obstacles every 90 frames; 60fps = 20s; canvas 380×180
- `initFuelBottle(6)` + `startEnergyMonitoring()` after stage init
- Backup: `PACZK6`; success: `GameState.addSymbol('piston')`, `GameState.markStage(6)`, link to `../../final/`

- [ ] **Step 2: Verify in browser** — Szymon nav dblclick skip → NFC gate → mission bar starts ticking → Amelia handoff → GPS sprint UI → after retry btn confirm → Ania handoff → dodge canvas → survive 20s → 🔴 Tłok symbol → final link

- [ ] **Step 3: Commit**
```bash
git add zadanie/6/index.html
git commit -m "feat(e6): GPS nav + 5-min mission timer + Amelia sprint + Ania dodge, role handoffs"
```

---

## Task 9: Static Pages Cleanup

**Files:**
- Modify: `index.html` (remove `<div class="fuel-widget">…</div>`)
- Modify: `final/index.html` (remove fuel-widget div if present)
- Modify: `print/sejf.html` (add fuel bottle codes table)

- [ ] **Step 1: index.html** — Delete the `<div class="fuel-widget">` block (header now injected by game.js)

- [ ] **Step 2: final/index.html** — Remove fuel-widget div if present; add `<script>GameState.markStage(99);</script>` at bottom if not present (marks final page visited for debug)

- [ ] **Step 3: print/sejf.html** — Add after existing NFC codes table:
```html
<h2>Kody Butelek Paliwa ⛽</h2>
<table>
  <tr><th>Lokalizacja</th><th>Etap</th><th>Kod</th><th>Uwaga</th></tr>
  <tr><td>Baza</td><td>E1</td><td><strong>BENZ1</strong></td><td>Brak GPS (zawsze działa)</td></tr>
  <tr><td>Lokalizacja 1</td><td>E3</td><td><strong>BENZ3</strong></td><td>Wymaga 50m od NFC E3</td></tr>
  <tr><td>Lokalizacja 2</td><td>E4</td><td><strong>BENZ4</strong></td><td>Wymaga 50m od NFC E4</td></tr>
  <tr><td>Lokalizacja 3</td><td>E5</td><td><strong>BENZ5</strong></td><td>Wymaga 50m od NFC E5</td></tr>
  <tr><td>Lokalizacja 4</td><td>E6</td><td><strong>BENZ6</strong></td><td>Wymaga 50m od NFC E6</td></tr>
</table>
```

- [ ] **Step 4: Commit**
```bash
git add index.html final/index.html print/sejf.html
git commit -m "chore(static): remove old fuel-widget divs, add fuel bottle codes to print sheet"
```

---

## Task 10: Remove FuelManager Shims

**Files:**
- Modify: `assets/game.js` — delete backward-compat `FuelManager` shim object (added in Task 2 to keep old HTML working during migration; safe to remove after Tasks 3–8 complete since all HTML files now use new API)

- [ ] **Step 1: Delete shim** — Find `// --- FuelManager backwards-compat shims ---` block in game.js and delete it.

- [ ] **Step 2: Verify no remaining references** — `grep -r "FuelManager" zadanie/ index.html final/` should return 0 results.

- [ ] **Step 3: Commit**
```bash
git add assets/game.js
git commit -m "chore: remove FuelManager backwards-compat shims (all HTML migrated)"
```

---
