# Złomek Namieszał! — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full 6-stage GPS/NFC/sensor-based birthday treasure hunt as static HTML/JS pages on GitHub Pages.

**Architecture:** Pure static site — each stage is a self-contained HTML file importing a shared `assets/game.js` module. State (fuel, symbols, stage completion) persisted in `localStorage`. No build step, no external dependencies. NFC via native Android URL tag scan; GPS via Geolocation API; accelerometer via DeviceMotion/DeviceOrientation APIs.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript ES6+, Web APIs (Geolocation, DeviceMotion, DeviceOrientation, localStorage). Optional: Web NFC API (in-page scan button, Chrome Android only).

**Party date:** 16 maja 2026  
**Spec:** `docs/superpowers/specs/2026-05-09-zlomek-namiesza-design.md`

---

## File Structure

```
assets/
  style.css              MODIFY  — add fuel bar, nav compass, modals, game UI
  game.js                CREATE  — GameState, FuelManager, Navigation, Sensors, NFC helpers
index.html               MODIFY  — update story/intro text
zadanie/1/index.html     MODIFY  — E1: intro + shake challenge
zadanie/2/index.html     MODIFY  — E2: NFC token + cipher puzzle + GPS speed
zadanie/3/index.html     MODIFY  — E3: GPS nav + reaction game + symbol #1
zadanie/4/index.html     MODIFY  — E4: GPS multi-waypoint + memory match + GPS loop + symbol #2
zadanie/5/index.html     MODIFY  — E5: GPS nav + level challenge + word puzzle + symbol #3
zadanie/6/index.html     MODIFY  — E6: GPS nav + dodge game (canvas) + sprint + timer + symbol #4
final/index.html         CREATE  — celebration page + where extra gift is hidden
print/sejf.html          CREATE  — printable physical safe with 4-symbol combination
```

---

## NFC Strategy

Each NFC tag is programmed with URL: `https://[host]/zadanie/N/?nfc=1`

When phone touches tag, Android Chrome opens that URL automatically.
The page detects `?nfc=1` in URL query string to mark it as legitimately unlocked.
Backup: 6-character code printed on a label next to each tag; entering it sets `localStorage['nfc_N'] = '1'`.

No Web NFC API required for basic flow — native Android NFC opens the URL.
Optional in-page Web NFC button provided as confirmation ritual (the "beep" moment).

---

## Safe Combination

Symbols in order: **🔧 🏁 ⚡ 🔴** (wrench, flag, lightning, piston)
Each is revealed on screen after completing the challenge in stages 3–6.
Physical safe: printable card with 4 rotary dials showing the symbols.

---

## Location Placeholders

All GPS coordinates use `PLACEHOLDER` constants in `game.js`.
Find/replace these strings when real locations are known:

```
STAGE3_WAYPOINTS   — array of {lat, lng, hint} for Lokalizacja 1
STAGE4_WAYPOINTS   — array of {lat, lng, hint} for Lokalizacja 2 (complex route)
STAGE5_WAYPOINTS   — array of {lat, lng, hint} for Lokalizacja 3
STAGE6_WAYPOINTS   — array of {lat, lng, hint} for Lokalizacja 4
STAGE2_NFC_HINT    — text description of where E2 NFC tag is hidden (garden)
STAGE3_NFC_HINT    — text description of where E3 NFC tag is hidden
EXTRA_GIFT_LOCATION — text on /final/ page describing where extra gift is hidden
```

---

---

## Task 1: CSS Extensions

**Files:**
- Modify: `assets/style.css`

- [ ] **Step 1: Add fuel bar styles**

Append to `assets/style.css`:

```css
/* ============================================================
   FUEL BAR
   ============================================================ */
.fuel-widget {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(15,15,26,0.9);
  border-bottom: 1px solid rgba(233,69,96,0.3);
  flex-shrink: 0;
}
.fuel-icon { font-size: 1rem; flex-shrink: 0; }
.fuel-track {
  flex: 1;
  height: 10px;
  background: rgba(255,255,255,0.1);
  border-radius: 5px;
  overflow: hidden;
}
.fuel-fill {
  height: 100%;
  width: 80%;
  background: #4CAF50;
  border-radius: 5px;
  transition: width 0.5s ease, background 0.5s ease;
}
.fuel-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-gold);
  min-width: 36px;
  text-align: right;
}

/* ============================================================
   PIT STOP MODAL
   ============================================================ */
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 100;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-overlay.active { display: flex; }
.modal-box {
  background: linear-gradient(160deg,#1a1a2e,#16213e);
  border: 2px solid var(--color-neon);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  width: 100%;
  max-width: 380px;
}
.modal-icon { font-size: 3rem; margin-bottom: 12px; }
.modal-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--color-neon);
  margin-bottom: 10px;
  text-transform: uppercase;
}
.modal-text { font-size: 1rem; color: #ccc; line-height: 1.6; margin-bottom: 20px; }

/* ============================================================
   GPS NAVIGATION COMPASS
   ============================================================ */
.nav-widget {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  gap: 12px;
}
.nav-arrow-wrap {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255,215,0,0.08);
  border: 3px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}
.nav-arrow-wrap.hot { border-color: var(--color-neon); background: rgba(233,69,96,0.15); animation: pulse 0.8s infinite; }
@keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.06);} }
.nav-arrow {
  font-size: 3rem;
  display: inline-block;
  transition: transform 0.3s ease;
  transform-origin: center;
}
.nav-distance {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-white);
}
.nav-distance span { font-size: 1rem; color: var(--color-muted); }
.nav-hint {
  font-size: 0.9rem;
  color: var(--color-gold);
  text-align: center;
  padding: 8px 16px;
  background: rgba(255,215,0,0.08);
  border-radius: 8px;
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-status { font-size: 0.75rem; color: var(--color-muted); letter-spacing: 1px; }

/* ============================================================
   SYMBOL REVEAL
   ============================================================ */
.symbol-reveal {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(255,215,0,0.06);
  border: 2px solid var(--color-gold);
  border-radius: 14px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.5s ease;
}
.symbol-reveal.active { display: flex; }
@keyframes fadeIn { from{opacity:0;transform:scale(0.8);} to{opacity:1;transform:scale(1);} }
.symbol-big { font-size: 3.5rem; line-height: 1; }
.symbol-label { font-size: 0.75rem; color: var(--color-gold); letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
.symbol-name { font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-white); }

/* ============================================================
   GAME CANVAS (Etap 6 dodge game)
   ============================================================ */
.canvas-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
#game-canvas {
  border: 2px solid var(--color-neon);
  border-radius: 8px;
  max-width: 100%;
  touch-action: none;
}
.game-timer {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--color-gold);
}
.game-lives { font-size: 1.2rem; letter-spacing: 4px; }

/* ============================================================
   GPS SPEED METER
   ============================================================ */
.speed-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  background: rgba(255,255,255,0.04);
  border: 1.5px solid var(--color-border);
  border-radius: 14px;
  width: 100%;
}
.speed-number {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 900;
  color: var(--color-white);
  line-height: 1;
}
.speed-unit { font-size: 0.8rem; color: var(--color-muted); letter-spacing: 1px; }
.speed-progress-track {
  width: 100%;
  height: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
}
.speed-progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* ============================================================
   MEMORY MATCH GAME
   ============================================================ */
.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
  padding: 8px 0;
}
.mem-card {
  aspect-ratio: 1;
  border-radius: 8px;
  background: rgba(233,69,96,0.15);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.mem-card.face-down { font-size: 0; background: rgba(233,69,96,0.15); }
.mem-card.face-down::before { content: '🏎️'; font-size: 1.4rem; filter: grayscale(1) opacity(0.3); }
.mem-card.matched { background: rgba(76,175,80,0.2); border-color: #4CAF50; }
.mem-card:active { transform: scale(0.92); }

/* ============================================================
   BACKUP CODE INPUT
   ============================================================ */
.backup-input-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
}
.backup-input-wrap input {
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 12px;
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
  outline: none;
}
.backup-input-wrap input:focus { border-color: var(--color-gold); }

/* ============================================================
   REACTION BUTTON GAME (Etap 3)
   ============================================================ */
.reaction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  padding: 8px 0;
}
.reaction-btn {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  cursor: pointer;
  transition: opacity 0.1s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}
.reaction-btn.active { border-color: #FFD700; box-shadow: 0 0 12px rgba(255,215,0,0.5); }
.reaction-btn:active { transform: scale(0.9); opacity: 0.7; }

/* ============================================================
   TASK COUNTDOWN TIMER (Etap 6)
   ============================================================ */
.task-countdown {
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 900;
  text-align: center;
  padding: 8px 0;
}
.task-countdown.warning { color: var(--color-neon); animation: pulse 0.5s infinite; }
.task-countdown.ok { color: var(--color-gold); }

/* ============================================================
   LEVEL METER (Etap 5 accelerometer)
   ============================================================ */
.level-meter {
  width: 100%;
  height: 16px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.level-indicator {
  position: absolute;
  top: 0;
  height: 100%;
  width: 12px;
  background: var(--color-gold);
  border-radius: 6px;
  left: 50%;
  transform: translateX(-50%);
  transition: left 0.1s linear;
}
.level-indicator.danger { background: var(--color-neon); }
.level-ok-zone {
  position: absolute;
  top: 0;
  height: 100%;
  width: 40%;
  background: rgba(76,175,80,0.25);
  left: 30%;
  border-radius: 8px;
}
```

- [ ] **Step 2: Verify styles load**

Open `index.html` in browser via `python3 -m http.server 8080` at project root.
Check that existing page still looks correct (styles not broken).

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "style: add fuel bar, nav compass, game UI, modal, symbol reveal components"
```

---

## Task 2: assets/game.js — GameState, FuelManager, Utilities

**Files:**
- Create: `assets/game.js`

- [ ] **Step 1: Create game.js with GameState and utilities**

Create `assets/game.js`:

```javascript
'use strict';

// ============================================================
// CONFIG
// ============================================================
const GAME_CONFIG = {
  fuelStart:           80,
  fuelDrainInterval:   45000,   // ms: drain 1% every 45s
  fuelDrainAmount:     1,       // % per interval
  fuelGPSBonus:        15,      // % for 60s of riding ≥5 km/h
  fuelGPSMinSpeedKmh:  5,
  fuelTaskBonus:       20,      // % on challenge complete
  fuelPitBonus:        40,      // % after pit stop
  waypointRadiusM:     30,      // metres: auto-advance waypoint
  gpsArrivalRadiusM:   25,      // metres: final "YOU ARE CLOSE" trigger
};

// NFC backup codes — generated once, printed on labels beside tags
// Format: 6 uppercase alphanumeric chars
const NFC_BACKUP_CODES = {
  1: 'START1',
  2: 'FLIK22',
  3: 'PACZK3',
  4: 'PACZK4',
  5: 'PACZK5',
  6: 'PACZK6',
};

// Safe combination symbols (in order)
const SAFE_SYMBOLS = [
  { id: 'wrench',    emoji: '🔧', name: 'Klucz'      },
  { id: 'flag',      emoji: '🏁', name: 'Flaga'      },
  { id: 'lightning', emoji: '⚡', name: 'Błyskawica' },
  { id: 'piston',    emoji: '🔴', name: 'Tłok'       },
];

// ============================================================
// LOCATION PLACEHOLDERS — replace before party
// ============================================================
// Each waypoint: { lat: number, lng: number, hint: string }
// hint is shown on screen when arriving at this waypoint (before advancing)
const STAGE2_NFC_HINT   = 'PLACEHOLDER: opisz gdzie w ogrodzie jest tag NFC (np. "Pod dużym kamieniem przy furtce")';
const STAGE3_NFC_HINT   = 'PLACEHOLDER: opisz gdzie jest tag NFC w lokalizacji 1';
const EXTRA_GIFT_LOCATION = 'PLACEHOLDER: opisz gdzie jest schowany dodatkowy prezent';

const STAGE3_WAYPOINTS = [
  // { lat: 52.0000, lng: 21.0000, hint: 'Jedź prosto do końca ścieżki' },
  // { lat: 52.0010, lng: 21.0005, hint: 'Skręć w lewo przy drzewie' },
  // last waypoint hint shown when within radius — keep as direction/landmark
];

const STAGE4_WAYPOINTS = [
  // Multi-waypoint complex route
  // { lat: 52.0000, lng: 21.0000, hint: 'Kieruj się na wschód wzdłuż płotu' },
];

const STAGE5_WAYPOINTS = [
  // { lat: 52.0000, lng: 21.0000, hint: 'Słyszysz pikanie? Szukaj!' },
];

const STAGE6_WAYPOINTS = [
  // { lat: 52.0000, lng: 21.0000, hint: 'Ostatnia prosta! Jedź!' },
];

// ============================================================
// GAMESTATE — localStorage wrapper
// ============================================================
const GameState = (() => {
  const PREFIX = 'auta_szymon_26_';

  function get(key, def) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v !== null ? JSON.parse(v) : def;
    } catch { return def; }
  }
  function set(key, val) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
  }

  return {
    getFuel:           ()  => get('fuel', GAME_CONFIG.fuelStart),
    setFuel:           (v) => set('fuel', Math.max(0, Math.min(100, v))),
    addFuel:           (a) => GameState.setFuel(GameState.getFuel() + a),
    getSymbols:        ()  => get('symbols', []),
    addSymbol:         (id)=> { const s = GameState.getSymbols(); if (!s.includes(id)) { s.push(id); set('symbols', s); } },
    hasSymbol:         (id)=> GameState.getSymbols().includes(id),
    getStages:         ()  => get('stages', []),
    markStage:         (n) => { const s = GameState.getStages(); if (!s.includes(n)) { s.push(n); set('stages', s); } },
    isStageComplete:   (n) => GameState.getStages().includes(n),
    getStartTime:      ()  => get('startTime', null),
    ensureStartTime:   ()  => { if (!get('startTime', null)) set('startTime', Date.now()); },
    getElapsedMinutes: ()  => { const t = get('startTime', null); return t ? Math.floor((Date.now()-t)/60000) : 0; },
    getNFCUnlocked:    (n) => get('nfc_'+n, false),
    setNFCUnlocked:    (n) => set('nfc_'+n, true),
    reset: () => {
      ['fuel','symbols','stages','startTime'].forEach(k => localStorage.removeItem(PREFIX+k));
      for (let i=1; i<=6; i++) localStorage.removeItem(PREFIX+'nfc_'+i);
    },
  };
})();

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
// FUEL MANAGER
// ============================================================
const FuelManager = (() => {
  let drainTimer   = null;
  let gpsWatchId   = null;
  let prevGPSPos   = null;
  let prevGPSTime  = null;
  let movingSecs   = 0;
  let pitStopOpen  = false;

  function renderFuel() {
    const pct  = GameState.getFuel();
    const fill  = document.getElementById('fuel-fill');
    const label = document.getElementById('fuel-label');
    if (!fill || !label) return;
    fill.style.width      = pct + '%';
    fill.style.background = pct > 40 ? '#4CAF50' : pct > 15 ? '#FF9800' : '#e94560';
    label.textContent = Math.round(pct) + '%';
    if (pct <= 0 && !pitStopOpen) openPitStop();
  }

  function openPitStop() {
    pitStopOpen = true;
    const m = document.getElementById('pit-stop-modal');
    if (m) m.classList.add('active');
  }

  function closePitStop() {
    pitStopOpen = false;
    GameState.addFuel(GAME_CONFIG.fuelPitBonus);
    renderFuel();
    const m = document.getElementById('pit-stop-modal');
    if (m) m.classList.remove('active');
  }

  function startDrain() {
    renderFuel();
    clearInterval(drainTimer);
    drainTimer = setInterval(() => {
      GameState.addFuel(-GAME_CONFIG.fuelDrainAmount);
      renderFuel();
    }, GAME_CONFIG.fuelDrainInterval);
  }

  function startGPSTracking() {
    if (!navigator.geolocation) return;
    gpsWatchId = navigator.geolocation.watchPosition(pos => {
      const now = Date.now();
      if (prevGPSPos && prevGPSTime) {
        const dt   = (now - prevGPSTime) / 1000;
        const dist = haversineM(prevGPSPos.lat, prevGPSPos.lng, pos.coords.latitude, pos.coords.longitude);
        const spd  = dt > 0 ? (dist / dt) * 3.6 : 0;
        if (spd >= GAME_CONFIG.fuelGPSMinSpeedKmh) {
          movingSecs += dt;
          if (movingSecs >= 60) {
            GameState.addFuel(GAME_CONFIG.fuelGPSBonus);
            renderFuel();
            movingSecs = 0;
          }
        } else {
          movingSecs = Math.max(0, movingSecs - 1);
        }
      }
      prevGPSPos  = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      prevGPSTime = now;
    }, null, { enableHighAccuracy: true, maximumAge: 1000 });
  }

  function stop() {
    clearInterval(drainTimer);
    if (gpsWatchId != null) { navigator.geolocation.clearWatch(gpsWatchId); gpsWatchId = null; }
  }

  return { startDrain, startGPSTracking, stop, renderFuel, closePitStop };
})();

// ============================================================
// NFC TOKEN VALIDATION
// ============================================================
function checkNFCToken(stageNum) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('nfc') === '1') {
    GameState.setNFCUnlocked(stageNum);
    return true;
  }
  return GameState.getNFCUnlocked(stageNum);
}

function setupBackupCodeInput(stageNum, onUnlock) {
  const btn   = document.getElementById('backup-submit');
  const input = document.getElementById('backup-code-input');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const code = input.value.trim().toUpperCase();
    if (code === NFC_BACKUP_CODES[stageNum]) {
      GameState.setNFCUnlocked(stageNum);
      onUnlock();
    } else {
      input.style.borderColor = '#e94560';
      setTimeout(() => input.style.borderColor = '', 1000);
    }
  });
}

function showNFCGate(stageNum, onUnlock) {
  const gate    = document.getElementById('nfc-gate');
  const content = document.getElementById('stage-content');
  if (checkNFCToken(stageNum)) {
    if (gate)    gate.style.display    = 'none';
    if (content) content.style.display = 'block';
    onUnlock();
    return;
  }
  if (gate)    gate.style.display    = 'flex';
  if (content) content.style.display = 'none';
  setupBackupCodeInput(stageNum, () => {
    if (gate)    gate.style.display    = 'none';
    if (content) content.style.display = 'block';
    onUnlock();
  });
}
```

- [ ] **Step 2: Verify game.js loads without errors**

```bash
python3 -m http.server 8080
```

Open browser console at `http://localhost:8080`, run:
```javascript
GameState.getFuel()   // should return 80
haversineM(52,21,52.001,21)  // should return ~111
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add assets/game.js
git commit -m "feat: add GameState, FuelManager, NFC validation, GPS utilities in game.js"
```

---

## Task 3: assets/game.js — Navigation Module (append to game.js)

**Files:**
- Modify: `assets/game.js` (append)

- [ ] **Step 1: Append Navigation module to game.js**

```javascript
// ============================================================
// NAVIGATION — GPS Waypoint system
// ============================================================
const Navigation = (() => {
  let watchId        = null;
  let compassWatchOn = false;
  let waypoints      = [];
  let currentIdx     = 0;
  let headingDeg     = 0; // device compass heading
  let onUpdateCb     = null;
  let onArrivalCb    = null;
  let lastPos        = null;

  function start(wps, onUpdate, onArrival) {
    waypoints    = wps;
    currentIdx   = 0;
    onUpdateCb   = onUpdate;
    onArrivalCb  = onArrival;

    // Listen for device compass
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onOrientation, true);
      compassWatchOn = true;
    }

    if (!navigator.geolocation) {
      onUpdate(0, null, 'Brak GPS w tej przeglądarce');
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      onPosition,
      onGPSError,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  }

  function onOrientation(e) {
    // e.alpha = compass heading (0=North) on Android with absolute:true
    if (e.webkitCompassHeading != null) {
      headingDeg = e.webkitCompassHeading; // iOS
    } else if (e.absolute && e.alpha != null) {
      headingDeg = 360 - e.alpha;          // Android absolute
    }
  }

  function onPosition(pos) {
    lastPos = pos;
    if (waypoints.length === 0) return;

    const wp   = waypoints[currentIdx];
    const dist = haversineM(pos.coords.latitude, pos.coords.longitude, wp.lat, wp.lng);
    const bear = bearingDeg(pos.coords.latitude, pos.coords.longitude, wp.lat, wp.lng);
    // Rotate arrow relative to device heading so it points toward target
    const arrowAngle = (bear - headingDeg + 360) % 360;

    const isLast  = currentIdx === waypoints.length - 1;
    const isClose = dist <= (isLast ? GAME_CONFIG.gpsArrivalRadiusM : GAME_CONFIG.waypointRadiusM);

    if (onUpdateCb) onUpdateCb(arrowAngle, dist, isClose, isLast, wp.hint || '');

    if (isClose) {
      if (!isLast) {
        // Auto-advance to next waypoint
        currentIdx++;
        const nextHint = waypoints[currentIdx]?.hint || '';
        if (onArrivalCb) onArrivalCb(currentIdx - 1, false, nextHint);
      } else {
        // Final destination reached
        stop();
        if (onArrivalCb) onArrivalCb(currentIdx, true, '');
      }
    }
  }

  function onGPSError(err) {
    if (onUpdateCb) onUpdateCb(0, null, false, false, 'Błąd GPS: ' + err.message);
  }

  function stop() {
    if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    if (compassWatchOn) { window.removeEventListener('deviceorientation', onOrientation, true); compassWatchOn = false; }
  }

  return { start, stop };
})();

// Helper: render navigation UI
// Call this from onUpdate callback
function renderNav(arrowAngle, distM, isClose, isLast, hint) {
  const arrowEl   = document.getElementById('nav-arrow');
  const distEl    = document.getElementById('nav-distance');
  const hintEl    = document.getElementById('nav-hint');
  const wrapEl    = document.getElementById('nav-arrow-wrap');
  const statusEl  = document.getElementById('nav-status');

  if (arrowEl) arrowEl.style.transform = `rotate(${arrowAngle}deg)`;
  if (distEl)  distEl.textContent = distM != null ? formatDist(distM) : '---';
  if (hintEl)  hintEl.textContent = hint || '';
  if (wrapEl)  { wrapEl.classList.toggle('hot', isClose); }
  if (statusEl) {
    if (distM == null)      statusEl.textContent = 'Szukam sygnału GPS...';
    else if (isClose && isLast) statusEl.textContent = '🔥 JESTEŚ BLISKO!';
    else if (isClose)       statusEl.textContent = '✓ Następny punkt!';
    else                    statusEl.textContent = 'Nawiguj do celu';
  }
}
```

- [ ] **Step 2: Verify Navigation module**

In browser console at any zadanie page (with game.js loaded):
```javascript
typeof Navigation.start // should be 'function'
typeof haversineM       // should be 'function'
bearingDeg(52,21,53,22).toFixed(0) // should be ~'43' (NE)
```

- [ ] **Step 3: Commit**

```bash
git add assets/game.js
git commit -m "feat: add GPS waypoint navigation module with compass bearing to game.js"
```

---

## Task 4: assets/game.js — Sensors Module (append to game.js)

**Files:**
- Modify: `assets/game.js` (append)

- [ ] **Step 1: Append Sensors module to game.js**

```javascript
// ============================================================
// SENSORS — Accelerometer shake + Level balance
// ============================================================
const Sensors = (() => {

  // --- SHAKE CHALLENGE ---
  // count: number of shakes required
  // timeLimitMs: total time window
  // onProgress(current, target): called each shake
  // onSuccess(): all shakes done
  // onFail(): time expired before reaching count
  function startShake(count, timeLimitMs, onProgress, onSuccess, onFail) {
    const THRESHOLD = 18; // m/s² total acceleration spike
    let shakeCount = 0;
    let lastShakeTime = 0;
    let deadline = Date.now() + timeLimitMs;
    let done = false;

    function onMotion(e) {
      if (done) return;
      if (Date.now() > deadline) {
        done = true;
        window.removeEventListener('devicemotion', onMotion);
        onFail();
        return;
      }
      const ag = e.accelerationIncludingGravity;
      if (!ag) return;
      const total = Math.sqrt(ag.x**2 + ag.y**2 + ag.z**2);
      const now = Date.now();
      if (total > THRESHOLD && now - lastShakeTime > 300) {
        lastShakeTime = now;
        shakeCount++;
        if (onProgress) onProgress(shakeCount, count);
        if (shakeCount >= count) {
          done = true;
          window.removeEventListener('devicemotion', onMotion);
          onSuccess();
        }
      }
    }

    if (!window.DeviceMotionEvent) {
      // Fallback: tap button 20 times
      return { fallback: true };
    }

    // iOS 13+ requires permission
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(r => {
        if (r === 'granted') window.addEventListener('devicemotion', onMotion);
        else onFail();
      });
    } else {
      window.addEventListener('devicemotion', onMotion);
    }

    return { fallback: false };
  }

  // --- LEVEL CHALLENGE ---
  // holdSecs: seconds device must stay level
  // toleranceDeg: max tilt in gamma (left-right) degrees
  // failSecs: seconds of bad tilt before fail
  // onProgress(goodSecs, holdSecs): update progress bar
  // onSuccess()
  // onFail()
  function startLevel(holdSecs, toleranceDeg, failSecs, onProgress, onSuccess, onFail) {
    let goodMs  = 0;
    let badMs   = 0;
    let lastT   = Date.now();
    let done    = false;

    function onOrient(e) {
      if (done) return;
      const now = Date.now();
      const dt  = (now - lastT) / 1000;
      lastT = now;
      const tilt = Math.abs(e.gamma || 0); // left-right tilt degrees

      if (tilt <= toleranceDeg) {
        goodMs += dt;
        badMs   = Math.max(0, badMs - dt * 0.5); // recover slowly
        if (onProgress) onProgress(goodMs, holdSecs);
        if (goodMs >= holdSecs) {
          done = true;
          window.removeEventListener('deviceorientation', onOrient);
          onSuccess();
        }
      } else {
        badMs += dt;
        goodMs = Math.max(0, goodMs - dt * 0.3); // penalize tilt
        if (onProgress) onProgress(goodMs, holdSecs);
        if (badMs >= failSecs) {
          done = true;
          window.removeEventListener('deviceorientation', onOrient);
          onFail();
        }
      }
    }

    if (!window.DeviceOrientationEvent) {
      return { fallback: true };
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(r => {
        if (r === 'granted') window.addEventListener('deviceorientation', onOrient);
        else onFail();
      });
    } else {
      window.addEventListener('deviceorientation', onOrient);
    }

    return { fallback: false };
  }

  return { startShake, startLevel };
})();
```

- [ ] **Step 2: Verify Sensors module available**

Console:
```javascript
typeof Sensors.startShake  // 'function'
typeof Sensors.startLevel  // 'function'
```

- [ ] **Step 3: Commit**

```bash
git add assets/game.js
git commit -m "feat: add accelerometer shake and level-balance sensor challenges to game.js"
```

---

## Task 5: index.html — Update Story Intro

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace mission-box content and add pit-stop modal**

Replace the `<div class="mission-box">` block and update the start button. Full new body content:

```html
<body>
  <div class="page">
    <div class="flag-strip"></div>

    <div class="neon-title">⚡ AUTA ⚡</div>
    <div class="gold-text">Urodziny Szymona — 16 maja 2026</div>

    <div class="hero-emoji">🏎️</div>
    <div class="gold-text" style="letter-spacing:1px;font-size:0.75rem;">PISTON CUP CHALLENGE</div>

    <div class="racers">
      <div class="racer-chip">🔴 Szymon</div>
      <div class="racer-chip">🟡 Amelia</div>
      <div class="racer-chip">🔵 Ania</div>
    </div>

    <div class="mission-box">
      <div class="mission-label">📻 Wiadomość od Zygzaka McQueena</div>
      <div class="mission-text">
        <em>"KA-CZAOW! Złomek chciał pomóc, ale wsiadł na lawetę, zakręcił bączka i rozrzucił wszystkie prezenty Szymona po okolicy! Potrzebuję Was — <strong>Ekipy Ratunkowej Radiator Springs</strong>! Znajdźcie 4 paczki zanim impreza się skończy!"</em>
      </div>
    </div>

    <div class="task-hint" style="margin:12px 16px;">
      ⚡ Znajdź tag NFC na bazie i dotknij nim telefon ⚡
    </div>

    <a class="btn-primary" href="zadanie/1/?nfc=1">⚡ START RACE ⚡</a>

    <div class="bottom-deco">🚗💨<br><span style="font-size:1rem;">✨ ⚡ ✨</span></div>
    <div class="flag-strip" style="margin-top:8px;"></div>
  </div>
</body>
```

Note: the start button href includes `?nfc=1` as the very first stage is unlocked from base (no NFC tag required — just START button, or optionally add NFC tag at base pointing to `/zadanie/1/?nfc=1`).

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080`. Check:
- Story text visible
- Racers chips visible
- START button works (navigates to zadanie/1/)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "content: update index.html with story intro and mission for Urodziny Szymona"
```

---

## Task 6: zadanie/1/index.html — Etap 1: Alarm w Radiator Springs

**Files:**
- Modify: `zadanie/1/index.html`

Challenges: accelerometer shake (20 shakes / 15s) + fuel init + NFC unlock.

- [ ] **Step 1: Write full E1 page**

Replace entire file content:

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

    <!-- Fuel widget -->
    <div class="fuel-widget">
      <span class="fuel-icon">⛽</span>
      <div class="fuel-track"><div class="fuel-fill" id="fuel-fill"></div></div>
      <span class="fuel-label" id="fuel-label">80%</span>
    </div>

    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 1 / 6</span>
    </div>

    <!-- NFC Gate (shown if no token) -->
    <div id="nfc-gate" class="task-body" style="display:none;">
      <div class="task-card">
        <div class="task-card-icon">📡</div>
        <div class="task-card-text">
          <strong>Dotknij tagiem NFC telefonu</strong><br>
          aby odblokować Etap 1
        </div>
      </div>
      <div class="backup-input-wrap">
        <div style="font-size:0.8rem;color:#888;">Nie działa? Wpisz kod z naklejki:</div>
        <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
        <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
      </div>
    </div>

    <!-- Main stage content -->
    <div id="stage-content" class="task-body" style="display:none;">
      <div class="task-step-label">🏁 Zadanie pierwsze</div>
      <div class="task-title">Alarm w Radiator Springs!</div>

      <div class="task-card">
        <div class="task-card-icon">📻</div>
        <div class="task-card-text">
          <strong>Złomek:</strong> <em>"Hej amigo! Chyba trochę namieszałem...
          ale mam dobry GPS i paliwo na pokładzie — tylko ten silnik 
          trzeba rozgrzać! Potrząśnij telefonem żeby odpalić bolid!"</em>
        </div>
      </div>

      <!-- Shake challenge -->
      <div id="shake-section">
        <div class="speed-widget">
          <div class="speed-number" id="shake-count">0</div>
          <div class="speed-unit">/ 20 POTRZĄŚNIĘĆ</div>
          <div class="speed-progress-track">
            <div class="speed-progress-fill" id="shake-fill"></div>
          </div>
        </div>
        <div class="task-hint" style="margin-top:12px;">
          ⚡ Potrząśnij telefonem 20 razy w 15 sekund! ⚡
        </div>
        <div id="shake-timer" class="task-countdown ok" style="margin-top:8px;"></div>
        <button id="shake-fallback-btn" class="btn-primary" style="display:none;margin-top:12px;">
          Dotknij 20 razy (brak akcelerometru)
        </button>
        <button id="shake-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Spróbuj ponownie
        </button>
      </div>

      <!-- Success message -->
      <div id="shake-success" style="display:none;">
        <div class="task-card" style="border-color:#4CAF50;">
          <div class="task-card-icon">🚗💨</div>
          <div class="task-card-text">
            <strong>SILNIK GOTOWY! KA-CZAOW!</strong><br><br>
            Złomek mówi: <em>"Pierwsza paczka Szymona jest tam gdzie
            <strong id="e2-hint">PLACEHOLDER: wpisz zagadkę do miejsca z tagiem NFC etapu 2</strong></em>
          </div>
        </div>
        <a id="next-btn" class="btn-primary" href="../2/?nfc=1">
          ⚡ JEDŹ! Etap 2 →
        </a>
      </div>
    </div>

    <!-- Pit Stop Modal -->
    <div id="pit-stop-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏁</div>
        <div class="modal-title">PIT STOP!</div>
        <div class="modal-text">Paliwo na零! Zrób <strong>10 pajacyków</strong> żeby naładować bak!</div>
        <button class="btn-primary" onclick="FuelManager.closePitStop()">✅ Naładowano!</button>
      </div>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    // Init
    GameState.ensureStartTime();
    showNFCGate(1, initStage);

    function initStage() {
      FuelManager.startDrain();
      startShakeChallenge();
    }

    function startShakeChallenge() {
      const countEl   = document.getElementById('shake-count');
      const fillEl    = document.getElementById('shake-fill');
      const timerEl   = document.getElementById('shake-timer');
      const retryEl   = document.getElementById('shake-retry');
      const TIME_MS   = 15000;
      let deadline    = Date.now() + TIME_MS;

      function updateTimer() {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        timerEl.textContent = left + 's';
        timerEl.className   = 'task-countdown ' + (left <= 5 ? 'warning' : 'ok');
        if (left > 0) setTimeout(updateTimer, 500);
      }
      updateTimer();

      const result = Sensors.startShake(
        20, TIME_MS,
        (cur, tot) => {
          countEl.textContent     = cur;
          fillEl.style.width      = (cur / tot * 100) + '%';
        },
        () => onShakeSuccess(),
        () => onShakeFail()
      );

      if (result.fallback) {
        // Tap fallback for devices without accelerometer
        let tapCount = 0;
        const fallbackBtn = document.getElementById('shake-fallback-btn');
        fallbackBtn.style.display = 'block';
        fallbackBtn.addEventListener('click', () => {
          tapCount++;
          countEl.textContent = tapCount;
          fillEl.style.width  = (tapCount / 20 * 100) + '%';
          if (tapCount >= 20) onShakeSuccess();
        });
      }

      retryEl.addEventListener('click', () => {
        retryEl.style.display = 'none';
        timerEl.textContent   = '';
        countEl.textContent   = '0';
        fillEl.style.width    = '0%';
        deadline = Date.now() + TIME_MS;
        updateTimer();
        startShakeChallenge();
      });
    }

    function onShakeSuccess() {
      GameState.addFuel(GAME_CONFIG.fuelTaskBonus);
      FuelManager.renderFuel();
      GameState.markStage(1);
      document.getElementById('shake-section').style.display  = 'none';
      document.getElementById('shake-success').style.display  = 'block';
      // Populate placeholder hint
      document.getElementById('e2-hint').textContent = STAGE2_NFC_HINT;
    }

    function onShakeFail() {
      document.getElementById('shake-retry').style.display = 'block';
      document.getElementById('shake-timer').textContent   = 'Czas minął!';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Fill STAGE2_NFC_HINT placeholder in game.js**

In `assets/game.js`, replace:
```javascript
const STAGE2_NFC_HINT = 'PLACEHOLDER: opisz gdzie w ogrodzie jest tag NFC (np. "Pod dużym kamieniem przy furtce")';
```
with the actual description once location is known.

- [ ] **Step 3: Verify E1 in browser**

Open `http://localhost:8080/zadanie/1/?nfc=1`. Check:
- Fuel bar visible at 80%
- NFC gate hidden (token present in URL)
- Shake counter renders
- Clicking shake fallback button increments counter to 20 → success message appears
- "JEDŹ! Etap 2" button visible after success

- [ ] **Step 4: Commit**

```bash
git add zadanie/1/index.html
git commit -m "feat: implement Etap 1 - shake challenge with fuel init and NFC gate"
```

---

## Task 7: zadanie/2/index.html — Etap 2: Skrzynka od Filka

**Files:**
- Modify: `zadanie/2/index.html`

Challenges: NFC gate → emoji cipher puzzle (answer: 3142) → GPS speed (60s ≥ 5 km/h).

Cipher design (child-friendly for age 8+):
```
Filk zostawił zaszyfrowaną wiadomość!
🚗 + 🚗 + 🚗 = 3   →  🚗 = ?   [answer: 1]
🚕 - 🚗 = 2         →  🚕 = ?   [answer: 3]
🔥 = 🚗 + 🚗 + 🚗 + 🚗  →  🔥 = ?  [answer: 4]
🏎️ = 🔥 ÷ 2         →  🏎️ = ?  [answer: 2]
KOD: 🚕 🚗 🔥 🏎️ = _ _ _ _   [answer: 3142]
```

- [ ] **Step 1: Write full E2 page**

Replace entire file content:

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
    <div class="fuel-widget">
      <span class="fuel-icon">⛽</span>
      <div class="fuel-track"><div class="fuel-fill" id="fuel-fill"></div></div>
      <span class="fuel-label" id="fuel-label">--</span>
    </div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 2 / 6</span>
    </div>

    <!-- NFC Gate -->
    <div id="nfc-gate" class="task-body" style="display:none;">
      <div class="task-card">
        <div class="task-card-icon">📡</div>
        <div class="task-card-text"><strong>Znajdź tag NFC i dotknij nim telefon!</strong></div>
      </div>
      <div class="backup-input-wrap">
        <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
        <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
        <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
      </div>
    </div>

    <div id="stage-content" class="task-body" style="display:none;">
      <div class="task-step-label">🏁 Zadanie drugie</div>
      <div class="task-title">Skrzynka od Filka!</div>

      <!-- Phase 1: Cipher puzzle -->
      <div id="phase-cipher">
        <div class="task-card">
          <div class="task-card-icon">🔐</div>
          <div class="task-card-text" style="text-align:left;line-height:2;">
            <strong>Filk zostawił kod! Rozwiążcie:</strong><br>
            🚗 + 🚗 + 🚗 = 3 &nbsp;→&nbsp; 🚗 = <strong>?</strong><br>
            🚕 − 🚗 = 2 &nbsp;→&nbsp; 🚕 = <strong>?</strong><br>
            🔥 = 🚗 × 4 &nbsp;→&nbsp; 🔥 = <strong>?</strong><br>
            🏎️ = 🔥 ÷ 2 &nbsp;→&nbsp; 🏎️ = <strong>?</strong><br><br>
            <strong>KOD: 🚕 🚗 🔥 🏎️ = _ _ _ _</strong>
          </div>
        </div>
        <div style="display:flex;gap:8px;padding:0 0 12px;">
          <input id="cipher-input" type="number" inputmode="numeric"
            style="flex:1;background:rgba(255,255,255,0.06);border:1.5px solid rgba(233,69,96,0.3);
                   border-radius:8px;color:#fff;font-size:1.6rem;font-weight:700;
                   padding:12px;text-align:center;outline:none;"
            maxlength="4" placeholder="____">
          <button id="cipher-submit" class="btn-primary" style="width:auto;padding:12px 20px;margin:0;">OK</button>
        </div>
        <div id="cipher-error" style="display:none;color:#e94560;text-align:center;font-size:0.9rem;">
          Błędny kod! Sprawdź równania jeszcze raz 🔍
        </div>
        <div id="cipher-retry" style="display:none;">
          <button class="btn-primary" onclick="resetCipher()">🔄 Spróbuj ponownie</button>
        </div>
      </div>

      <!-- Phase 2: GPS Speed -->
      <div id="phase-speed" style="display:none;">
        <div class="task-card">
          <div class="task-card-icon">💨</div>
          <div class="task-card-text">
            <strong>Złomek:</strong> <em>"Teraz jedźcie szybko! 
            Utrzymajcie prędkość przez 60 sekund!"</em>
          </div>
        </div>
        <div class="speed-widget">
          <div class="speed-number" id="spd-val">0</div>
          <div class="speed-unit">km/h</div>
          <div class="speed-progress-track">
            <div class="speed-progress-fill" id="spd-fill"></div>
          </div>
          <div style="font-size:0.8rem;color:#aaa;margin-top:4px;">
            <span id="spd-secs">0</span> / 60 sekund w ruchu
          </div>
        </div>
        <div class="task-hint" style="margin-top:12px;">
          Jedźcie ≥ 5 km/h przez 60 sekund bez zatrzymania!
        </div>
        <button id="spd-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Silnik zgasł! Zacznij od nowa
        </button>
      </div>

      <!-- Phase 3: Success -->
      <div id="phase-success" style="display:none;">
        <div class="task-card" style="border-color:#4CAF50;">
          <div class="task-card-icon">🗺️</div>
          <div class="task-card-text">
            <strong>ZŁOMEK:</strong> <em>"Ej amigo! Znalazłem ją! 
            Pierwsza paczka jest w lokalizacji 1! 
            Waszym celem jest:</em><br><br>
            <span id="e3-hint" style="color:#FFD700;font-weight:700;">
              PLACEHOLDER: wskazówka do Lokalizacji 1
            </span>
          </div>
        </div>
        <a class="btn-primary" href="../3/">⚡ JEDŹ DO LOKALIZACJI 1 →</a>
      </div>
    </div>

    <!-- Pit Stop Modal -->
    <div id="pit-stop-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏁</div>
        <div class="modal-title">PIT STOP!</div>
        <div class="modal-text">Paliwo na零! Zrób <strong>10 pajacyków</strong>!</div>
        <button class="btn-primary" onclick="FuelManager.closePitStop()">✅ Naładowano!</button>
      </div>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    showNFCGate(2, initStage);

    function initStage() {
      FuelManager.startDrain();
      FuelManager.startGPSTracking();
      FuelManager.renderFuel();
      setupCipher();
    }

    // CIPHER PUZZLE
    const CORRECT_CODE = '3142';
    function setupCipher() {
      document.getElementById('cipher-submit').addEventListener('click', checkCipher);
      document.getElementById('cipher-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') checkCipher();
      });
    }
    function checkCipher() {
      const val = document.getElementById('cipher-input').value.trim();
      if (val === CORRECT_CODE) {
        document.getElementById('phase-cipher').style.display = 'none';
        document.getElementById('phase-speed').style.display  = 'block';
        startGPSSpeed();
      } else {
        document.getElementById('cipher-error').style.display = 'block';
        document.getElementById('cipher-retry').style.display = 'block';
      }
    }
    function resetCipher() {
      document.getElementById('cipher-input').value        = '';
      document.getElementById('cipher-error').style.display = 'none';
      document.getElementById('cipher-retry').style.display = 'none';
    }

    // GPS SPEED CHALLENGE
    function startGPSSpeed() {
      const spdValEl  = document.getElementById('spd-val');
      const spdFillEl = document.getElementById('spd-fill');
      const spdSecsEl = document.getElementById('spd-secs');
      const retryEl   = document.getElementById('spd-retry');
      const TARGET = 60;
      let movingSecs  = 0;
      let prevPos     = null;
      let prevTime    = null;
      let failed      = false;

      const watchId = navigator.geolocation.watchPosition(pos => {
        const now  = Date.now();
        const lat  = pos.coords.latitude;
        const lng  = pos.coords.longitude;
        let spd = 0;
        if (prevPos && prevTime) {
          const dt   = (now - prevTime) / 1000;
          const dist = haversineM(prevPos.lat, prevPos.lng, lat, lng);
          spd = dt > 0 ? (dist / dt) * 3.6 : 0;
        }
        prevPos  = { lat, lng };
        prevTime = now;
        spdValEl.textContent = Math.round(spd);

        if (spd >= GAME_CONFIG.fuelGPSMinSpeedKmh) {
          movingSecs = Math.min(TARGET, movingSecs + 1);
        } else {
          // Allow brief stops (< 5s lost before penalty)
        }
        spdFillEl.style.width = (movingSecs / TARGET * 100) + '%';
        spdSecsEl.textContent = Math.round(movingSecs);

        if (movingSecs >= TARGET) {
          navigator.geolocation.clearWatch(watchId);
          onSpeedSuccess();
        }
      }, null, { enableHighAccuracy: true, maximumAge: 1000 });

      retryEl.addEventListener('click', () => {
        navigator.geolocation.clearWatch(watchId);
        movingSecs = 0;
        retryEl.style.display = 'none';
        startGPSSpeed();
      });
    }

    function onSpeedSuccess() {
      GameState.addFuel(GAME_CONFIG.fuelTaskBonus);
      FuelManager.renderFuel();
      GameState.markStage(2);
      document.getElementById('phase-speed').style.display   = 'none';
      document.getElementById('phase-success').style.display = 'block';
      document.getElementById('e3-hint').textContent = STAGE3_NFC_HINT;
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify E2**

Open `http://localhost:8080/zadanie/2/?nfc=1`.
- Enter wrong code → error message
- Enter `3142` → GPS speed phase appears
- GPS speed UI renders (value may show 0 in localhost — OK)

- [ ] **Step 3: Commit**

```bash
git add zadanie/2/index.html
git commit -m "feat: implement Etap 2 - emoji cipher puzzle and GPS speed challenge"
```

---

## Task 8: zadanie/3/index.html — Etap 3: Lokalizacja 1 + Symbol 🔧

**Files:**
- Modify: `zadanie/3/index.html`

Challenges: GPS navigation → NFC gate → reaction button sequence (5 buttons in 8s) → symbol #1 reveal.

- [ ] **Step 1: Write full E3 page**

Replace entire file content:

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
    <div class="fuel-widget">
      <span class="fuel-icon">⛽</span>
      <div class="fuel-track"><div class="fuel-fill" id="fuel-fill"></div></div>
      <span class="fuel-label" id="fuel-label">--</span>
    </div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 3 / 6</span>
    </div>

    <div id="stage-content" class="task-body">

      <!-- Phase 1: GPS Navigation -->
      <div id="phase-nav">
        <div class="task-step-label">🗺️ Nawiguj do Lokalizacji 1</div>
        <div class="task-title">Szukamy Paczki #1!</div>
        <div class="task-card">
          <div class="task-card-icon">📻</div>
          <div class="task-card-text">
            <em>Złomek: "Paczka Szymona! Jedźcie za strzałką!"</em>
          </div>
        </div>
        <div class="nav-widget">
          <div class="nav-arrow-wrap" id="nav-arrow-wrap">
            <span class="nav-arrow" id="nav-arrow">⬆️</span>
          </div>
          <div class="nav-distance" id="nav-distance">-- <span>m</span></div>
          <div class="nav-hint" id="nav-hint">Szukam sygnału GPS...</div>
          <div class="nav-status" id="nav-status">Czekam na GPS...</div>
        </div>
        <div class="task-hint">Jedź za strzałką! Gdy znajdziesz miejsce, zeskanuj tag NFC.</div>
      </div>

      <!-- Phase 2: NFC Gate (shown after arriving) -->
      <div id="phase-nfc" style="display:none;">
        <div class="task-step-label">📡 Zeskanuj tag NFC</div>
        <div class="task-title">Skanuj i odblokuj!</div>
        <div class="task-card">
          <div class="task-card-icon">📡</div>
          <div class="task-card-text"><strong>Dotknij tagiem NFC telefonu aby odblokować wyzwanie!</strong></div>
        </div>
        <div class="backup-input-wrap">
          <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
          <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
          <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
        </div>
      </div>

      <!-- Phase 3: Reaction button game -->
      <div id="phase-game" style="display:none;">
        <div class="task-step-label">🏎️ Pit Stop Chaos!</div>
        <div class="task-title">Klikaj szybko!</div>
        <div class="task-card">
          <div class="task-card-icon">🔧</div>
          <div class="task-card-text">
            <em>"Mechanicy! Klikajcie podświetlone narzędzia zanim znikną!"</em>
          </div>
        </div>
        <div class="task-countdown ok" id="game-timer">8s</div>
        <div class="reaction-grid" id="reaction-grid"></div>
        <div class="task-hint" id="game-status">Zapamiętaj kolejność!</div>
        <button id="game-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Spróbuj ponownie
        </button>
      </div>

      <!-- Phase 4: Symbol reveal + success -->
      <div id="phase-success" style="display:none;">
        <div class="symbol-reveal active">
          <div class="symbol-label">Symbol #1 zdobyty!</div>
          <div class="symbol-big">🔧</div>
          <div class="symbol-name">KLUCZ</div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">
            Zapamiętajcie! To 1. znak kodu do sejfu.
          </div>
        </div>
        <div class="task-card" style="margin-top:16px;border-color:#4CAF50;">
          <div class="task-card-icon">📦</div>
          <div class="task-card-text">
            <strong>Złomek: "Paczka #1 jest tu obok tagu NFC! Weźcie ją!"</strong><br>
            Teraz jedźcie do <strong>Lokalizacji 2!</strong>
          </div>
        </div>
        <a class="btn-primary" href="../4/">⚡ JEDŹ DO LOKALIZACJI 2 →</a>
      </div>
    </div>

    <div id="pit-stop-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏁</div>
        <div class="modal-title">PIT STOP!</div>
        <div class="modal-text">Paliwo na零! Zrób <strong>10 pajacyków</strong>!</div>
        <button class="btn-primary" onclick="FuelManager.closePitStop()">✅ Naładowano!</button>
      </div>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    FuelManager.startDrain();
    FuelManager.startGPSTracking();
    FuelManager.renderFuel();

    // --- PHASE 1: GPS NAVIGATION ---
    const waypoints = STAGE3_WAYPOINTS.length > 0 ? STAGE3_WAYPOINTS : [
      { lat: 0, lng: 0, hint: 'PLACEHOLDER: uzupełnij współrzędne Lokalizacji 1' }
    ];

    Navigation.start(
      waypoints,
      (angle, dist, isClose, isLast, hint) => {
        renderNav(angle, dist, isClose, isLast, hint);
        if (isClose && isLast) setTimeout(showNFCPhase, 1500);
      },
      (idx, isFinal, nextHint) => {
        if (!isFinal && nextHint) {
          document.getElementById('nav-hint').textContent = '✓ ' + nextHint;
        }
      }
    );

    // Allow manual advance if GPS unavailable (dev/testing)
    document.getElementById('nav-status').addEventListener('dblclick', showNFCPhase);

    function showNFCPhase() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display = 'none';
      document.getElementById('phase-nfc').style.display = 'block';
      setupBackupCodeInput(3, startGamePhase);
      checkNFCToken(3) && startGamePhase();
    }

    // --- PHASE 3: REACTION GAME ---
    const ICONS = ['🔧','🔩','🪛','⚙️','🔨','🪝'];
    const SEQUENCE_LEN = 5;
    const TIME_LIMIT = 8000;

    function startGamePhase() {
      document.getElementById('phase-nfc').style.display  = 'none';
      document.getElementById('phase-game').style.display = 'block';
      runReactionGame();
    }

    function runReactionGame() {
      const grid      = document.getElementById('reaction-grid');
      const timerEl   = document.getElementById('game-timer');
      const statusEl  = document.getElementById('game-status');
      const retryEl   = document.getElementById('game-retry');
      retryEl.style.display = 'none';

      // Build 6 buttons
      grid.innerHTML = '';
      const btns = [];
      ICONS.forEach((icon, i) => {
        const b = document.createElement('button');
        b.className        = 'reaction-btn';
        b.style.background = `hsl(${i*60},60%,25%)`;
        b.textContent      = icon;
        b.dataset.idx      = i;
        grid.appendChild(b);
        btns.push(b);
      });

      // Generate random sequence
      const seq = Array.from({length: SEQUENCE_LEN}, () => Math.floor(Math.random()*ICONS.length));
      let step  = 0;

      // Highlight each button in sequence (show sequence first)
      statusEl.textContent = 'Zapamiętaj kolejność...';
      let showIdx = 0;
      function showNext() {
        if (showIdx > 0) btns[seq[showIdx-1]].classList.remove('active');
        if (showIdx >= seq.length) {
          statusEl.textContent = 'Teraz klikaj w tej samej kolejności!';
          startInput();
          return;
        }
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
          if (left > 0) setTimeout(tick, 500);
          else onFail();
        }
        tick();

        btns.forEach(b => {
          b.addEventListener('click', () => {
            if (Number(b.dataset.idx) === seq[step]) {
              b.style.background = 'rgba(76,175,80,0.4)';
              step++;
              if (step >= seq.length) onWin();
            } else {
              onFail();
            }
          }, { once: true });
        });
      }
      function onWin()  { onGameSuccess(); }
      function onFail() {
        statusEl.textContent  = '❌ Błąd! Spróbuj ponownie!';
        retryEl.style.display = 'block';
        retryEl.onclick = () => { retryEl.style.display='none'; runReactionGame(); };
      }
    }

    function onGameSuccess() {
      GameState.addFuel(GAME_CONFIG.fuelTaskBonus);
      FuelManager.renderFuel();
      GameState.addSymbol('wrench');
      GameState.markStage(3);
      document.getElementById('phase-game').style.display   = 'none';
      document.getElementById('phase-success').style.display = 'block';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Fill STAGE3_WAYPOINTS in game.js** once location is known.

- [ ] **Step 3: Verify E3**

Open `http://localhost:8080/zadanie/3/`. Check:
- Navigation phase shows (arrow, distance "-- m" on localhost without GPS — OK)
- Double-click on nav-status text → NFC phase appears
- Enter backup code `PACZK3` → reaction game starts
- Sequence shows then hides → click buttons in order → success → symbol 🔧 shown

- [ ] **Step 4: Commit**

```bash
git add zadanie/3/index.html
git commit -m "feat: implement Etap 3 - GPS nav, reaction sequence game, symbol wrench reveal"
```

---

## Task 9: zadanie/4/index.html — Etap 4: Lokalizacja 2 + Symbol 🏁

**Files:**
- Modify: `zadanie/4/index.html`

Challenges: GPS multi-waypoint nav → NFC gate → Memory match (8 cards, 90s) → GPS loop (~80m circle) → symbol #2.

- [ ] **Step 1: Write full E4 page**

Replace entire file:

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
    <div class="fuel-widget">
      <span class="fuel-icon">⛽</span>
      <div class="fuel-track"><div class="fuel-fill" id="fuel-fill"></div></div>
      <span class="fuel-label" id="fuel-label">--</span>
    </div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 4 / 6</span>
    </div>

    <div id="stage-content" class="task-body">

      <!-- Phase 1: GPS Nav -->
      <div id="phase-nav">
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
        <div class="task-hint">Jedź za strzałką, słuchaj wskazówek na każdym skrzyżowaniu!</div>
      </div>

      <!-- Phase 2: NFC -->
      <div id="phase-nfc" style="display:none;">
        <div class="task-step-label">📡 Zeskanuj tag NFC</div>
        <div class="task-card"><div class="task-card-icon">📡</div>
          <div class="task-card-text"><strong>Dotknij tagiem NFC!</strong></div></div>
        <div class="backup-input-wrap">
          <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
          <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
          <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
        </div>
      </div>

      <!-- Phase 3: Memory Match -->
      <div id="phase-memory" style="display:none;">
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
        <button id="mem-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Spróbuj ponownie
        </button>
      </div>

      <!-- Phase 4: Speed Burst 15 km/h -->
      <div id="phase-speed" style="display:none;">
        <div class="task-step-label">💨 PEŁNA PRĘDKOŚĆ!</div>
        <div class="task-title">Osiągnij 15 km/h!</div>
        <div class="task-card">
          <div class="task-card-icon">🚀</div>
          <div class="task-card-text">
            <em>"Złomek mówi: Teraz PEŁNA PARA! Osiągnijcie 15 km/h 
            i trzymajcie przez 3 sekundy! Macie 2 minuty!"</em>
          </div>
        </div>
        <div class="speed-widget">
          <div class="speed-number" id="burst-speed">0</div>
          <div class="speed-unit">km/h</div>
          <div class="speed-progress-track" style="height:20px;position:relative;">
            <div class="speed-progress-fill" id="burst-fill"
                 style="background:linear-gradient(90deg,#4CAF50,#FFD700);"></div>
            <div id="burst-marker"
                 style="position:absolute;top:0;height:100%;width:3px;
                        background:#e94560;border-radius:2px;left:50%;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;
                      font-size:0.75rem;color:#888;margin-top:2px;">
            <span>0</span>
            <span style="color:#e94560;font-weight:700;">▲ 15 km/h</span>
            <span>30</span>
          </div>
          <div style="font-size:0.9rem;color:#aaa;margin-top:6px;" id="burst-status">
            Jedźcie szybko!
          </div>
          <div class="task-countdown ok" id="burst-hold">Utrzymaj: 0.0 / 3s</div>
        </div>
        <div class="task-countdown ok" id="burst-timer" style="font-size:1.6rem;">2:00</div>
        <button id="burst-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Czas minął! Spróbuj ponownie
        </button>
      </div>

      <!-- Phase 5: Symbol + Success -->
      <div id="phase-success" style="display:none;">
        <div class="symbol-reveal active">
          <div class="symbol-label">Symbol #2 zdobyty!</div>
          <div class="symbol-big">🏁</div>
          <div class="symbol-name">FLAGA</div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">
            To 2. znak kodu do sejfu!
          </div>
        </div>
        <div class="task-card" style="margin-top:16px;border-color:#4CAF50;">
          <div class="task-card-icon">📦</div>
          <div class="task-card-text">
            <strong>Paczka #2 jest obok! Weźcie ją!</strong><br>
            Jedźcie do <strong>Lokalizacji 3</strong> — tam jest tracker Złomka!
          </div>
        </div>
        <a class="btn-primary" href="../5/">⚡ JEDŹ DO LOKALIZACJI 3 →</a>
      </div>
    </div>

    <div id="pit-stop-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏁</div><div class="modal-title">PIT STOP!</div>
        <div class="modal-text">Paliwo na零! Zrób <strong>10 pajacyków</strong>!</div>
        <button class="btn-primary" onclick="FuelManager.closePitStop()">✅ Naładowano!</button>
      </div>
    </div>
    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    FuelManager.startDrain(); FuelManager.startGPSTracking(); FuelManager.renderFuel();

    const waypoints = STAGE4_WAYPOINTS.length > 0 ? STAGE4_WAYPOINTS : [
      { lat: 0, lng: 0, hint: 'PLACEHOLDER: uzupełnij trasę Lokalizacji 2' }
    ];
    Navigation.start(waypoints,
      (a,d,close,last,hint) => { renderNav(a,d,close,last,hint); if(close&&last) setTimeout(showNFC,1500); },
      (i,fin,nextHint) => { if(!fin&&nextHint) document.getElementById('nav-hint').textContent='✓ '+nextHint; }
    );
    document.getElementById('nav-status').addEventListener('dblclick', showNFC);

    function showNFC() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display  = 'none';
      document.getElementById('phase-nfc').style.display  = 'block';
      setupBackupCodeInput(4, startMemory);
      if (checkNFCToken(4)) startMemory();
    }

    // MEMORY MATCH
    const PAIRS = [
      {emoji:'🏎️',name:'Zygzak'}, {emoji:'🚙',name:'Złomek'},
      {emoji:'🟣',name:'Ramona'}, {emoji:'🔵',name:'Szerszeń'},
    ];

    function startMemory() {
      document.getElementById('phase-nfc').style.display    = 'none';
      document.getElementById('phase-memory').style.display = 'block';
      runMemory();
    }

    function runMemory() {
      const grid    = document.getElementById('memory-grid');
      const timerEl = document.getElementById('mem-timer');
      const retryEl = document.getElementById('mem-retry');
      retryEl.style.display = 'none';
      let matched = 0, flipped = [], blocked = false;

      const cards = [...PAIRS, ...PAIRS].sort(() => Math.random()-0.5);
      grid.innerHTML = '';
      const els = cards.map((c, i) => {
        const div = document.createElement('div');
        div.className     = 'mem-card face-down';
        div.dataset.emoji = c.emoji;
        div.dataset.idx   = i;
        div.addEventListener('click', () => flipCard(div));
        grid.appendChild(div);
        return div;
      });

      let timeLeft = 90;
      const tick = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft + 's';
        timerEl.className   = 'task-countdown ' + (timeLeft <= 20 ? 'warning' : 'ok');
        if (timeLeft <= 0) { clearInterval(tick); onMemFail(); }
      }, 1000);

      function flipCard(el) {
        if (blocked || !el.classList.contains('face-down') || el.classList.contains('matched')) return;
        el.classList.remove('face-down');
        el.textContent = el.dataset.emoji;
        flipped.push(el);
        if (flipped.length === 2) {
          blocked = true;
          if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
            flipped.forEach(c => c.classList.add('matched'));
            matched++;
            flipped = []; blocked = false;
            if (matched === PAIRS.length) { clearInterval(tick); onMemWin(); }
          } else {
            setTimeout(() => {
              flipped.forEach(c => { c.classList.add('face-down'); c.textContent = ''; });
              flipped = []; blocked = false;
            }, 900);
          }
        }
      }

      function onMemWin()  { startSpeedBurst(); }
      function onMemFail() {
        retryEl.style.display = 'block';
        retryEl.onclick = () => { retryEl.style.display='none'; runMemory(); };
      }
    }

    // SPEED BURST — 15 km/h through 3 consecutive seconds
    function startSpeedBurst() {
      document.getElementById('phase-memory').style.display = 'none';
      document.getElementById('phase-speed').style.display  = 'block';
      const speedEl  = document.getElementById('burst-speed');
      const fillEl   = document.getElementById('burst-fill');
      const markerEl = document.getElementById('burst-marker');
      const statusEl = document.getElementById('burst-status');
      const holdEl   = document.getElementById('burst-hold');
      const timerEl  = document.getElementById('burst-timer');
      const retryEl  = document.getElementById('burst-retry');
      const TARGET_KMH  = 15;
      const HOLD_SECS   = 3;
      const MAX_DISPLAY = 30;
      const DEADLINE    = 2 * 60 * 1000;
      let holdSecs = 0, endTime = Date.now() + DEADLINE;
      let prevPos = null, prevTime = null, done = false, watchId = null;

      // Position red marker at 15 km/h on gauge
      markerEl.style.left = (TARGET_KMH / MAX_DISPLAY * 100) + '%';

      function tickTimer() {
        if (done) return;
        const left = Math.max(0, endTime - Date.now());
        const m = Math.floor(left/60000), s = Math.floor((left%60000)/1000);
        timerEl.textContent = m + ':' + String(s).padStart(2,'0');
        timerEl.className   = 'task-countdown ' + (left < 30000 ? 'warning' : 'ok');
        if (left > 0) setTimeout(tickTimer, 500); else onBurstFail();
      }
      tickTimer();

      watchId = navigator.geolocation.watchPosition(pos => {
        if (done) return;
        const now = Date.now();
        let spd = 0;
        if (prevPos && prevTime) {
          const dt   = (now - prevTime) / 1000;
          const dist = haversineM(prevPos.lat, prevPos.lng, pos.coords.latitude, pos.coords.longitude);
          spd = dt > 0.2 ? (dist / dt) * 3.6 : 0;
        }
        prevPos  = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        prevTime = now;

        const spdRound = Math.round(spd);
        speedEl.textContent = spdRound;
        fillEl.style.width  = Math.min(100, spd / MAX_DISPLAY * 100) + '%';
        fillEl.style.background = spd >= TARGET_KMH
          ? 'linear-gradient(90deg,#4CAF50,#e94560)'
          : 'linear-gradient(90deg,#4CAF50,#FFD700)';

        if (spd >= TARGET_KMH) {
          holdSecs = Math.min(HOLD_SECS, holdSecs + 0.5);
          statusEl.textContent = '🔥 KA-CZAOW! Trzymajcie!';
          holdEl.className     = 'task-countdown warning';
          if (holdSecs >= HOLD_SECS) onBurstSuccess();
        } else {
          holdSecs = Math.max(0, holdSecs - 0.3);
          statusEl.textContent = spd > 10 ? 'Prawie! Szybciej!' : 'Jedźcie szybko!';
          holdEl.className     = 'task-countdown ok';
        }
        holdEl.textContent = 'Utrzymaj: ' + holdSecs.toFixed(1) + ' / ' + HOLD_SECS + 's';
      }, null, { enableHighAccuracy: true, maximumAge: 500 });

      function onBurstSuccess() {
        done = true;
        navigator.geolocation.clearWatch(watchId);
        GameState.addFuel(GAME_CONFIG.fuelTaskBonus);
        FuelManager.renderFuel();
        GameState.addSymbol('flag');
        GameState.markStage(4);
        document.getElementById('phase-speed').style.display   = 'none';
        document.getElementById('phase-success').style.display = 'block';
      }
      function onBurstFail() {
        done = true;
        navigator.geolocation.clearWatch(watchId);
        retryEl.style.display = 'block';
        retryEl.onclick = () => {
          retryEl.style.display = 'none';
          holdSecs = 0; done = false; prevPos = null; prevTime = null;
          endTime = Date.now() + DEADLINE;
          startSpeedBurst();
        };
      }
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify E4**

Open `http://localhost:8080/zadanie/4/`. Check:
- Double-click nav-status → NFC phase
- Backup code `PACZK4` → memory game starts
- Cards flip, pairs match correctly → speed burst phase appears
- Speedometer shows 0 km/h (no GPS on localhost — OK)
- Red marker visible at 50% of gauge (= 15/30 km/h position)
- Success state shows symbol 🏁

- [ ] **Step 3: Commit**

```bash
git add zadanie/4/index.html
git commit -m "feat: implement Etap 4 - multi-waypoint nav, memory match, speed burst 15km/h, flag symbol"
```

---

## Task 10: zadanie/5/index.html — Etap 5: Beeper + Symbol ⚡

**Files:**
- Modify: `zadanie/5/index.html`

Challenges: GPS nav (to vicinity) → beeper narrative → NFC gate → level challenge (hold level 15s) → word riddle → symbol #3.

- [ ] **Step 1: Write full E5 page**

Replace entire file:

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
    <div class="fuel-widget">
      <span class="fuel-icon">⛽</span>
      <div class="fuel-track"><div class="fuel-fill" id="fuel-fill"></div></div>
      <span class="fuel-label" id="fuel-label">--</span>
    </div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 5 / 6</span>
    </div>

    <div id="stage-content" class="task-body">

      <!-- Phase 1: GPS Nav to vicinity -->
      <div id="phase-nav">
        <div class="task-step-label">🗺️ Nawiguj do Lokalizacji 3</div>
        <div class="task-title">Tracker Złomka żyje!</div>
        <div class="task-card">
          <div class="task-card-icon">📡</div>
          <div class="task-card-text">
            <em>Złomek: "Ten tracker na pewno nie mój... ale pikanie wskazuje 
            na trzecią paczkę! Jedźcie za strzałką!"</em>
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
      </div>

      <!-- Phase 2: Beeper hunt narrative -->
      <div id="phase-beeper" style="display:none;">
        <div class="task-step-label">📡 Tracker aktywny!</div>
        <div class="task-title">Szukajcie dźwięku!</div>
        <div class="task-card">
          <div class="task-card-icon" style="animation:pulse 0.6s infinite;">📡</div>
          <div class="task-card-text">
            <strong>PIKANIE SIĘ WZMAGA!</strong><br><br>
            Jesteście w pobliżu! Szukajcie urządzenia które pika —
            paczka jest tam gdzie pikanie jest najgłośniejsze!<br><br>
            <em>Gdy znajdziecie — zeskanujcie tag NFC obok urządzenia!</em>
          </div>
        </div>
        <div class="task-hint">🔊 Im głośniej pika — tym bliżej jesteście!</div>
        <button id="beeper-found-btn" class="btn-primary" style="margin-top:16px;">
          📡 Znaleźliśmy! Skanujemy NFC →
        </button>
      </div>

      <!-- Phase 3: NFC gate -->
      <div id="phase-nfc" style="display:none;">
        <div class="task-step-label">📡 Zeskanuj tag NFC</div>
        <div class="task-card"><div class="task-card-icon">📡</div>
          <div class="task-card-text"><strong>Dotknij tagiem NFC telefonu!</strong></div></div>
        <div class="backup-input-wrap">
          <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
          <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
          <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj</button>
        </div>
      </div>

      <!-- Phase 4: Level challenge -->
      <div id="phase-level" style="display:none;">
        <div class="task-step-label">⚖️ Transport specjalny!</div>
        <div class="task-title">Złomek wiezie jajka!</div>
        <div class="task-card">
          <div class="task-card-icon">🥚</div>
          <div class="task-card-text">
            <em>"Hej amigo! Wieziecie bardzo kruchy ładunek! 
            Trzymajcie telefon POZIOMO przez 15 sekund!"</em>
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
          <div style="font-size:0.85rem;color:#aaa;margin-top:8px;" id="level-status">
            Trzymaj poziomo...
          </div>
          <div class="speed-number" style="font-size:1.6rem;" id="level-secs">0</div>
          <div class="speed-unit">/ 15 sekund</div>
        </div>
        <button id="level-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Złamek potłukł jajka! Spróbuj ponownie
        </button>
        <button id="level-fallback" class="btn-primary" style="display:none;margin-top:12px;">
          Pomiń wyzwanie (brak żyroskopu)
        </button>
      </div>

      <!-- Phase 5: Word riddle -->
      <div id="phase-riddle" style="display:none;">
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

      <!-- Phase 6: Symbol + success -->
      <div id="phase-success" style="display:none;">
        <div class="symbol-reveal active">
          <div class="symbol-label">Symbol #3 zdobyty!</div>
          <div class="symbol-big">⚡</div>
          <div class="symbol-name">BŁYSKAWICA</div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">To 3. znak kodu do sejfu!</div>
        </div>
        <div class="task-card" style="margin-top:16px;border-color:#4CAF50;">
          <div class="task-card-icon">📦</div>
          <div class="task-card-text">
            <strong>Paczka #3 jest tu! Weźcie ją!</strong><br>
            Ostatnia lokalizacja! Jedźcie do <strong>Lokalizacji 4!</strong>
          </div>
        </div>
        <a class="btn-primary" href="../6/">⚡ OSTATNIA LOKALIZACJA! →</a>
      </div>
    </div>

    <div id="pit-stop-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏁</div><div class="modal-title">PIT STOP!</div>
        <div class="modal-text">Paliwo na零! Zrób <strong>10 pajacyków</strong>!</div>
        <button class="btn-primary" onclick="FuelManager.closePitStop()">✅ Naładowano!</button>
      </div>
    </div>
    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    FuelManager.startDrain(); FuelManager.startGPSTracking(); FuelManager.renderFuel();

    const waypoints = STAGE5_WAYPOINTS.length > 0 ? STAGE5_WAYPOINTS : [
      { lat:0, lng:0, hint:'PLACEHOLDER: uzupełnij współrzędne Lokalizacji 3' }
    ];
    Navigation.start(waypoints,
      (a,d,close,last,hint) => { renderNav(a,d,close,last,hint); if(close&&last) setTimeout(showBeeper,1500); },
      (i,fin,nh) => { if(!fin&&nh) document.getElementById('nav-hint').textContent='✓ '+nh; }
    );
    document.getElementById('nav-status').addEventListener('dblclick', showBeeper);

    function showBeeper() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display    = 'none';
      document.getElementById('phase-beeper').style.display = 'block';
      document.getElementById('beeper-found-btn').addEventListener('click', showNFC);
    }

    function showNFC() {
      document.getElementById('phase-beeper').style.display = 'none';
      document.getElementById('phase-nfc').style.display    = 'block';
      setupBackupCodeInput(5, startLevel);
      if (checkNFCToken(5)) startLevel();
    }

    function startLevel() {
      document.getElementById('phase-nfc').style.display   = 'none';
      document.getElementById('phase-level').style.display = 'block';
      const fillEl   = document.getElementById('level-fill');
      const dotEl    = document.getElementById('level-dot');
      const secsEl   = document.getElementById('level-secs');
      const statusEl = document.getElementById('level-status');
      const retryEl  = document.getElementById('level-retry');
      const skipEl   = document.getElementById('level-fallback');

      const result = Sensors.startLevel(
        15, 20, 3,
        (good, tot) => {
          fillEl.style.width  = Math.min(100, good/tot*100) + '%';
          secsEl.textContent  = Math.round(good);
          statusEl.textContent = good > 10 ? 'Świetnie! Prawie!' : 'Trzymaj równo!';
        },
        () => { document.getElementById('phase-level').style.display = 'none'; startRiddle(); },
        () => {
          retryEl.style.display = 'block';
          retryEl.onclick = () => { retryEl.style.display='none'; startLevel(); };
        }
      );

      if (result && result.fallback) {
        skipEl.style.display = 'block';
        skipEl.addEventListener('click', () => {
          document.getElementById('phase-level').style.display = 'none';
          startRiddle();
        });
      }
    }

    function startRiddle() {
      document.getElementById('phase-riddle').style.display = 'block';
      const ANSWERS = ['opona','opony','guma','koło','kolo'];
      document.getElementById('riddle-submit').addEventListener('click', checkRiddle);
      document.getElementById('riddle-input').addEventListener('keydown', e => {
        if (e.key==='Enter') checkRiddle();
      });
      function checkRiddle() {
        const v = document.getElementById('riddle-input').value.trim().toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g,''); // strip Polish diacritics
        if (ANSWERS.includes(v)) {
          document.getElementById('phase-riddle').style.display = 'none';
          onSuccess();
        } else {
          document.getElementById('riddle-error').style.display = 'block';
          setTimeout(() => document.getElementById('riddle-error').style.display='none', 2000);
        }
      }
    }

    function onSuccess() {
      GameState.addFuel(GAME_CONFIG.fuelTaskBonus);
      FuelManager.renderFuel();
      GameState.addSymbol('lightning');
      GameState.markStage(5);
      document.getElementById('phase-success').style.display = 'block';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify E5**

Open `http://localhost:8080/zadanie/5/`. Check:
- Dbl-click nav-status → beeper phase
- "Znaleźliśmy" button → NFC gate
- Backup code `PACZK5` → level challenge
- If no gyroscope → fallback skip button visible
- Skip → riddle → type "opona" → success → symbol ⚡ shown

- [ ] **Step 3: Commit**

```bash
git add zadanie/5/index.html
git commit -m "feat: implement Etap 5 - beeper narrative, level challenge, word riddle, lightning symbol"
```

---

## Task 11: zadanie/6/index.html — Etap 6: Ostatnia Paczka + Symbol 🔴

**Files:**
- Modify: `zadanie/6/index.html`

Challenges: GPS nav → 5-minute countdown starts on NFC scan → NFC gate → dodge game (canvas, survive 20s) → GPS sprint (100m no stop) → symbol #4.

- [ ] **Step 1: Write full E6 page**

Replace entire file:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Etap 6 — Auta Szymon</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>
    <div class="fuel-widget">
      <span class="fuel-icon">⛽</span>
      <div class="fuel-track"><div class="fuel-fill" id="fuel-fill"></div></div>
      <span class="fuel-label" id="fuel-label">--</span>
    </div>
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 6 / 6</span>
    </div>

    <div id="stage-content" class="task-body">

      <!-- Phase 1: GPS Nav -->
      <div id="phase-nav">
        <div class="task-step-label">🗺️ OSTATNIA LOKALIZACJA!</div>
        <div class="task-title">Finałowy Sprint!</div>
        <div class="task-card">
          <div class="task-card-icon">🏆</div>
          <div class="task-card-text">
            <em>Złomek: "To jest ta NAJWIĘKSZA paczka Szymona! 
            KA-CZAOW! Jedźcie ile sił w nogach!"</em>
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
      </div>

      <!-- Phase 2: NFC + Countdown start -->
      <div id="phase-nfc" style="display:none;">
        <div class="task-step-label">⏱️ UWAGA — CZAS LECI!</div>
        <div class="task-title">Macie 5 minut!</div>
        <div class="task-card">
          <div class="task-card-icon">🚨</div>
          <div class="task-card-text">
            <em>"Po zeskanowaniu tagu startuje odliczanie 5 minut! 
            Musicie zdążyć z obydwoma wyzwaniami!"</em>
          </div>
        </div>
        <div class="task-countdown ok" id="mission-timer" style="font-size:2.8rem;">5:00</div>
        <div class="task-card"><div class="task-card-icon">📡</div>
          <div class="task-card-text"><strong>Dotknij tagiem NFC aby uruchomić odliczanie!</strong></div></div>
        <div class="backup-input-wrap">
          <div style="font-size:0.8rem;color:#888;">Kod z naklejki:</div>
          <input id="backup-code-input" type="text" maxlength="6" placeholder="XXXXXX">
          <button id="backup-submit" class="btn-primary" style="margin:0;">Odblokuj + Start!</button>
        </div>
      </div>

      <!-- Phase 3: Dodge game -->
      <div id="phase-game" style="display:none;">
        <div class="task-step-label">🏎️ Wyścig Zygzaka!</div>
        <div class="task-title">Unikaj przeszkód!</div>
        <div class="task-card" style="padding:10px 12px;">
          <div class="task-card-text">
            Przeżyj <strong>20 sekund</strong>! Dotknij ekranu żeby skakać!
          </div>
        </div>
        <div class="canvas-wrap">
          <div class="game-timer" id="dodge-timer">20s</div>
          <canvas id="game-canvas" width="380" height="180"></canvas>
        </div>
        <button id="game-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Rozbity! Spróbuj ponownie
        </button>
      </div>

      <!-- Phase 4: GPS Sprint -->
      <div id="phase-sprint" style="display:none;">
        <div class="task-step-label">💨 SPRINT!</div>
        <div class="task-title">100 metrów bez zatrzymania!</div>
        <div class="task-card">
          <div class="task-card-icon">🏎️</div>
          <div class="task-card-text">
            <em>Złomek: "Ostatnie wyzwanie! Jedźcie 100 metrów bez zatrzymania!
            GPS mierzy!"</em>
          </div>
        </div>
        <div class="speed-widget">
          <div class="speed-number" id="sprint-dist">0</div>
          <div class="speed-unit">/ 100 m</div>
          <div class="speed-progress-track">
            <div class="speed-progress-fill" id="sprint-fill"></div>
          </div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:4px;" id="sprint-status">
            Nie zatrzymujcie się!
          </div>
        </div>
        <button id="sprint-retry" class="btn-primary" style="display:none;margin-top:12px;">
          🔄 Zatrzymaliście się! Zacznij od nowa
        </button>
      </div>

      <!-- Phase 5: Symbol + Success -->
      <div id="phase-success" style="display:none;">
        <div class="symbol-reveal active">
          <div class="symbol-label">Symbol #4 zdobyty!</div>
          <div class="symbol-big">🔴</div>
          <div class="symbol-name">TŁOK</div>
          <div style="font-size:0.85rem;color:#aaa;margin-top:4px;">To 4. i OSTATNI znak kodu!</div>
        </div>
        <div class="task-card" style="margin-top:16px;border-color:#FFD700;background:rgba(255,215,0,0.08);">
          <div class="task-card-icon">🏆</div>
          <div class="task-card-text">
            <strong>ZEBRALIŚCIE WSZYSTKIE 4 PACZKI!</strong><br><br>
            Złomek: <em>"KA-CZAOW! Macie wszystkie symbole! 
            Wróćcie do bazy i otwórzcie SEJF! 
            Kombinacja to 4 symbole które zebraliście!"</em><br><br>
            <div style="font-size:1.4rem;letter-spacing:12px;text-align:center;margin:8px 0;">
              🔧 🏁 ⚡ 🔴
            </div>
          </div>
        </div>
        <a class="btn-primary" href="../../final/">🏆 DO BAZY! OTWIERAMY SEJF! →</a>
      </div>
    </div>

    <div id="pit-stop-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏁</div><div class="modal-title">PIT STOP!</div>
        <div class="modal-text">Paliwo na零! Zrób <strong>10 pajacyków</strong>!</div>
        <button class="btn-primary" onclick="FuelManager.closePitStop()">✅ Naładowano!</button>
      </div>
    </div>
    <div id="time-fail-modal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">⏰</div>
        <div class="modal-title">CZAS MINĄŁ!</div>
        <div class="modal-text">Odliczanie skończyło się! Złomek mówi: spróbujcie jeszcze raz!</div>
        <button class="btn-primary" id="time-fail-retry">🔄 Zacznij od nowa</button>
      </div>
    </div>
    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    FuelManager.startDrain(); FuelManager.startGPSTracking(); FuelManager.renderFuel();

    const waypoints = STAGE6_WAYPOINTS.length > 0 ? STAGE6_WAYPOINTS : [
      { lat:0, lng:0, hint:'PLACEHOLDER: uzupełnij współrzędne Lokalizacji 4' }
    ];
    Navigation.start(waypoints,
      (a,d,close,last,hint) => { renderNav(a,d,close,last,hint); if(close&&last) setTimeout(showNFC,1500); },
      (i,fin,nh) => { if(!fin&&nh) document.getElementById('nav-hint').textContent='✓ '+nh; }
    );
    document.getElementById('nav-status').addEventListener('dblclick', showNFC);

    // Mission countdown
    let missionDeadline = null;
    let missionFailed   = false;

    function showNFC() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display = 'none';
      document.getElementById('phase-nfc').style.display = 'block';
      setupBackupCodeInput(6, startMission);
      if (checkNFCToken(6)) startMission();
    }

    function startMission() {
      missionDeadline = Date.now() + 5 * 60 * 1000;
      tickMission();
      document.getElementById('phase-nfc').style.display  = 'none';
      document.getElementById('phase-game').style.display = 'block';
      startDodgeGame();
    }

    function tickMission() {
      if (missionFailed) return;
      const left = Math.max(0, missionDeadline - Date.now());
      const m = Math.floor(left/60000), s = Math.floor((left%60000)/1000);
      document.getElementById('mission-timer').textContent = m+':'+String(s).padStart(2,'0');
      if (left <= 0) { showTimeFail(); return; }
      setTimeout(tickMission, 500);
    }

    function showTimeFail() {
      missionFailed = true;
      document.getElementById('time-fail-modal').classList.add('active');
      document.getElementById('time-fail-retry').onclick = () => location.reload();
    }

    // DODGE GAME (Canvas)
    function startDodgeGame() {
      const canvas   = document.getElementById('game-canvas');
      const ctx      = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const timerEl  = document.getElementById('dodge-timer');
      const retryEl  = document.getElementById('game-retry');
      let carY       = H / 2;
      let velocity   = 0;
      const GRAVITY  = 0.4;
      const JUMP     = -8;
      let obstacles  = [];
      let frameCount = 0;
      let survived   = 0;
      let raf        = null;
      let dead       = false;

      canvas.addEventListener('touchstart', e => { e.preventDefault(); if(!dead) velocity = JUMP; }, { passive:false });
      canvas.addEventListener('mousedown',  () => { if(!dead) velocity = JUMP; });

      function spawnObstacle() {
        const gapY = 30 + Math.random() * (H - 90);
        obstacles.push({ x: W, gapY, gap: 65 });
      }

      function loop() {
        if (dead) return;
        frameCount++;
        survived = frameCount / 60;
        timerEl.textContent = Math.max(0, Math.ceil(20 - survived)) + 's';
        if (survived >= 20) { onDodgeWin(); return; }
        if (frameCount % 90 === 0) spawnObstacle();

        velocity += GRAVITY;
        carY     += velocity;
        if (carY < 0) { carY = 0; velocity = 0; }
        if (carY > H - 15) { onDodgeFail(); return; }

        obstacles.forEach(o => o.x -= 3);
        obstacles = obstacles.filter(o => o.x > -30);

        for (const o of obstacles) {
          if (o.x < 55 && o.x > 10) {
            if (carY < o.gapY || carY + 15 > o.gapY + o.gap) { onDodgeFail(); return; }
          }
        }

        ctx.fillStyle = '#0f0f1a';
        ctx.fillRect(0, 0, W, H);
        // Car
        ctx.fillStyle = '#e94560';
        ctx.fillRect(30, carY, 30, 15);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(50, carY+3, 8, 9); // windshield
        // Obstacles
        ctx.fillStyle = '#4CAF50';
        obstacles.forEach(o => {
          ctx.fillRect(o.x, 0, 20, o.gapY);
          ctx.fillRect(o.x, o.gapY + o.gap, 20, H - o.gapY - o.gap);
        });
        // Timer bar
        const pct = survived / 20;
        ctx.fillStyle = 'rgba(255,215,0,0.3)';
        ctx.fillRect(0, 0, W * pct, 4);

        raf = requestAnimationFrame(loop);
      }

      function onDodgeWin() {
        cancelAnimationFrame(raf);
        document.getElementById('phase-game').style.display   = 'none';
        document.getElementById('phase-sprint').style.display = 'block';
        startSprint();
      }

      function onDodgeFail() {
        dead = true;
        cancelAnimationFrame(raf);
        retryEl.style.display = 'block';
        retryEl.onclick = () => {
          retryEl.style.display = 'none';
          carY=H/2; velocity=0; obstacles=[]; frameCount=0; survived=0; dead=false;
          raf = requestAnimationFrame(loop);
        };
      }

      raf = requestAnimationFrame(loop);
    }

    // GPS SPRINT
    function startSprint() {
      const distEl   = document.getElementById('sprint-dist');
      const fillEl   = document.getElementById('sprint-fill');
      const statusEl = document.getElementById('sprint-status');
      const retryEl  = document.getElementById('sprint-retry');
      const TARGET   = 100;
      let totalDist  = 0, prevPos = null, stopped = false;

      const watchId = navigator.geolocation.watchPosition(pos => {
        if (stopped) return;
        const spd = (pos.coords.speed || 0) * 3.6;
        if (spd < 1.5 && prevPos) {
          stopped = true;
          navigator.geolocation.clearWatch(watchId);
          onSprintFail();
          return;
        }
        if (prevPos) {
          const d = haversineM(prevPos.lat, prevPos.lng, pos.coords.latitude, pos.coords.longitude);
          totalDist = Math.min(TARGET, totalDist + d);
        }
        prevPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        distEl.textContent = Math.round(totalDist);
        fillEl.style.width = (totalDist/TARGET*100)+'%';
        if (totalDist >= TARGET) { navigator.geolocation.clearWatch(watchId); onSprintSuccess(); }
      }, null, { enableHighAccuracy:true, maximumAge:500 });

      function onSprintFail() {
        statusEl.textContent  = '❌ Zatrzymaliście się!';
        retryEl.style.display = 'block';
        retryEl.onclick = () => { retryEl.style.display='none'; totalDist=0; stopped=false; prevPos=null; startSprint(); };
      }
    }

    function onSprintSuccess() {
      GameState.addFuel(GAME_CONFIG.fuelTaskBonus);
      FuelManager.renderFuel();
      GameState.addSymbol('piston');
      GameState.markStage(6);
      document.getElementById('phase-sprint').style.display  = 'none';
      document.getElementById('phase-success').style.display = 'block';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify E6**

Open `http://localhost:8080/zadanie/6/`. Check:
- Dbl-click nav-status → NFC phase with countdown
- Backup code `PACZK6` → 5min countdown starts, dodge game loads
- Canvas renders, tap makes car jump, obstacles appear
- Survive 20s → sprint phase
- Sprint phase shows GPS dist meter
- Success → symbol 🔴 + all 4 symbols displayed + "DO BAZY" button

- [ ] **Step 3: Commit**

```bash
git add zadanie/6/index.html
git commit -m "feat: implement Etap 6 - dodge game, GPS sprint, mission timer, piston symbol"
```

---

## Task 12: final/index.html — Strona Finałowa

**Files:**
- Create: `final/index.html`
- Create dir: `final/`

- [ ] **Step 1: Create `final/` directory and write page**

```bash
mkdir -p zadanie/../final
```

Write `final/index.html`:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>🏆 Wygraliście! — Auta Szymon</title>
  <link rel="stylesheet" href="../assets/style.css">
  <style>
    @keyframes confetti-fall {
      0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
      100% { transform: translateY(100vh)  rotate(720deg); opacity:0; }
    }
    .confetti-piece {
      position: fixed; top:-10px; width:10px; height:10px;
      border-radius:2px; animation: confetti-fall linear infinite;
      pointer-events:none; z-index:0;
    }
    .content-above { position:relative; z-index:1; }
  </style>
</head>
<body>
  <div id="confetti-container"></div>

  <div class="page content-above">
    <div class="flag-strip"></div>

    <div class="neon-title" style="margin-top:24px;">🏆 WYGRANA! 🏆</div>
    <div class="gold-text">Urodziny Szymona — 16 maja 2026</div>

    <div class="hero-emoji" style="font-size:5rem;">🎉</div>

    <div class="mission-box" style="margin:16px;">
      <div class="mission-label">📻 Wiadomość od Zygzaka McQueena</div>
      <div class="mission-text">
        <em>"KA-CZAOW! Zebraliście wszystkie 4 paczki i otworzyliście sejf!
        Jesteście NAJLEPSZĄ Ekipą Ratunkową w historii Radiator Springs!
        Złomek przeprasza... i jest z Was naprawdę dumny!"</em>
      </div>
    </div>

    <div class="task-card" style="margin:0 16px 16px;border-color:#FFD700;background:rgba(255,215,0,0.08);">
      <div class="task-card-icon">🎁</div>
      <div class="task-card-text">
        <strong style="color:#FFD700;font-size:1.1rem;">Jest jeszcze jeden prezent!</strong><br><br>
        Złomek ukrył go specjalnie dla Szymona:<br><br>
        <span id="gift-location" style="color:#ffffff;font-size:1rem;line-height:1.7;">
          PLACEHOLDER: opisz gdzie jest schowany dodatkowy prezent
          (np. "Pod poduszką na kanapie w salonie" lub "W samochodzie taty w bagażniku")
        </span>
      </div>
    </div>

    <!-- Symbols collected -->
    <div class="task-card" style="margin:0 16px 16px;">
      <div class="task-card-icon">🔐</div>
      <div class="task-card-text">
        <div style="font-size:0.8rem;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
          Zdobyte symbole sejfu:
        </div>
        <div style="font-size:2.2rem;letter-spacing:16px;text-align:center;">
          🔧 🏁 ⚡ 🔴
        </div>
      </div>
    </div>

    <!-- Time display -->
    <div class="task-card" style="margin:0 16px 16px;">
      <div class="task-card-icon">⏱️</div>
      <div class="task-card-text">
        <div style="font-size:0.8rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Czas misji:</div>
        <div class="task-countdown ok" id="elapsed-time" style="font-size:1.8rem;margin-top:4px;">--:--</div>
      </div>
    </div>

    <div class="bottom-deco">🚗💨🏆<br><span style="font-size:1rem;">✨ ⚡ KA-CZAOW! ⚡ ✨</span></div>
    <div class="flag-strip" style="margin-top:8px;"></div>
  </div>

  <script src="../assets/game.js"></script>
  <script>
    // Elapsed time
    const start = GameState.getStartTime();
    if (start) {
      const ms  = Date.now() - start;
      const m   = Math.floor(ms/60000);
      const s   = Math.floor((ms%60000)/1000);
      document.getElementById('elapsed-time').textContent = m + ' min ' + s + 's';
    }

    // Gift location placeholder
    document.getElementById('gift-location').textContent = EXTRA_GIFT_LOCATION;

    // Confetti
    const colors = ['#e94560','#FFD700','#4CAF50','#2196F3','#FF9800','#ffffff'];
    const cont   = document.getElementById('confetti-container');
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left              = Math.random()*100 + 'vw';
      el.style.background        = colors[Math.floor(Math.random()*colors.length)];
      el.style.animationDuration = (2 + Math.random()*3) + 's';
      el.style.animationDelay    = (Math.random()*3) + 's';
      el.style.width             = (8+Math.random()*10) + 'px';
      el.style.height            = (8+Math.random()*10) + 'px';
      cont.appendChild(el);
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Fill EXTRA_GIFT_LOCATION in game.js**

Replace:
```javascript
const EXTRA_GIFT_LOCATION = 'PLACEHOLDER: opisz gdzie jest schowany dodatkowy prezent';
```
with actual location text before the party.

- [ ] **Step 3: Verify final page**

Open `http://localhost:8080/final/`. Check:
- Confetti falls
- Symbols display: 🔧 🏁 ⚡ 🔴
- Gift location shows PLACEHOLDER text (OK until filled)
- Elapsed time shows "--:--" (no startTime set in fresh session — OK)

- [ ] **Step 4: Commit**

```bash
git add final/index.html
git commit -m "feat: add final celebration page with confetti, elapsed time, gift location"
```

---

## Task 13: print/sejf.html — Wydruk Fizycznego Sejfu

**Files:**
- Create dir: `print/`
- Create: `print/sejf.html`

This page is designed to be printed on A4 paper, cut and folded into a 4-symbol combination lock "safe" card. It includes:
- Instructions for setting the lock combination: 🔧 🏁 ⚡ 🔴
- 4 symbol dials (printable, cut on dotted lines)
- Space for QR code sticker inside
- Backup codes for all 6 NFC tags

- [ ] **Step 1: Create print/sejf.html**

```bash
mkdir -p print
```

Write `print/sejf.html`:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Sejf + Instrukcja — Auta Szymon 2026</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      background: #fff;
      color: #000;
      padding: 20mm;
    }
    @media print {
      body { padding: 10mm; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    h1 { font-size: 20pt; text-align: center; margin-bottom: 6mm; }
    h2 { font-size: 14pt; margin: 8mm 0 4mm; border-bottom: 1px solid #ccc; padding-bottom: 2mm; }
    .instructions { background: #f9f9f9; border: 1px solid #ddd; padding: 6mm; border-radius: 4mm; margin-bottom: 8mm; }
    .safe-box {
      border: 3px solid #000;
      border-radius: 6mm;
      padding: 8mm;
      margin: 6mm 0;
      text-align: center;
    }
    .symbols-row {
      display: flex;
      justify-content: center;
      gap: 8mm;
      margin: 6mm 0;
      font-size: 40pt;
    }
    .dial {
      border: 2px dashed #888;
      border-radius: 4mm;
      padding: 4mm 8mm;
      display: inline-block;
      text-align: center;
    }
    .combination-answer {
      font-size: 36pt;
      letter-spacing: 8mm;
      font-weight: 900;
      margin: 4mm 0;
    }
    .nfc-codes {
      border-collapse: collapse;
      width: 100%;
      margin: 4mm 0;
    }
    .nfc-codes th, .nfc-codes td {
      border: 1px solid #ccc;
      padding: 3mm 4mm;
      text-align: left;
    }
    .nfc-codes th { background: #f0f0f0; font-weight: bold; }
    .code-val { font-family: monospace; font-size: 13pt; font-weight: bold; letter-spacing: 2px; }
    .qr-placeholder {
      border: 2px dashed #888;
      width: 50mm;
      height: 50mm;
      margin: 6mm auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      color: #888;
      text-align: center;
    }
    .cut-here { border-top: 2px dashed red; margin: 8mm 0; padding-top: 4mm; font-size: 9pt; color: red; }
    .btn-print {
      display: block;
      margin: 0 auto 8mm;
      padding: 10px 30px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14pt;
      cursor: pointer;
    }
  </style>
</head>
<body>

<button class="btn-print no-print" onclick="window.print()">🖨️ DRUKUJ</button>

<h1>⚡ AUTA — URODZINY SZYMONA 2026 ⚡</h1>
<h1>🔐 INSTRUKCJA SEJFU + KODY NFC</h1>

<div class="instructions">
  <strong>Dla organizatora:</strong><br>
  1. Wydrukuj tę stronę (najlepiej kolor).<br>
  2. Ustaw sejf na kombinację: <strong>🔧 🏁 ⚡ 🔴</strong> (Klucz → Flaga → Błyskawica → Tłok).<br>
  3. Włóż do środka kartkę z QR kodem prowadzącym do: <code>https://[TWOJA DOMENA]/final/</code><br>
  4. Ukryj sejf przy bazie. Dzieci otworzą go po zebraniu wszystkich 4 symboli.<br>
  5. Programuj tagi NFC adresami URL z tabeli poniżej.<br>
</div>

<h2>🔐 Kombinacja sejfu</h2>
<div class="safe-box">
  <div style="font-size:11pt;color:#666;margin-bottom:4mm;">USTAW POKRĘTŁA W TEJ KOLEJNOŚCI:</div>
  <div class="combination-answer">🔧 🏁 ⚡ 🔴</div>
  <div style="font-size:10pt;color:#444;margin-top:4mm;">
    Klucz &nbsp;&nbsp; Flaga &nbsp;&nbsp; Błyskawica &nbsp;&nbsp; Tłok
  </div>
</div>

<div style="text-align:center;margin:6mm 0;font-size:10pt;color:#666;">
  Dzieci odkryją te symbole po kolei (jeden na każdej z 4 lokalizacji).<br>
  Kombinację zapamiętają z ekranu lub z notatek.
</div>

<div class="cut-here">✂ --- Tutaj wkleić kartkę z kodem QR do środka sejfu ---</div>
<div class="qr-placeholder">
  Wklej tu naklejkę z kodem QR<br>prowadzącą do:<br><code>/final/</code>
</div>
<div class="cut-here">✂ ------</div>

<div class="page-break"></div>

<h2>📡 Kody NFC tagów (backup)</h2>
<p style="margin-bottom:4mm;font-size:10pt;color:#555;">
  Każdy tag NFC jest zaprogramowany adresem URL. Przy każdym tagu nakleij etykietkę z kodem backup.
  Dzieci wpisują go gdy NFC nie działa.
</p>

<table class="nfc-codes">
  <tr>
    <th>#</th>
    <th>Etap</th>
    <th>URL do zaprogramowania w tagu</th>
    <th>Backup kod</th>
    <th>Gdzie ukryć tag</th>
  </tr>
  <tr>
    <td>1</td>
    <td>Etap 1 (Baza)</td>
    <td><code>https://[DOMENA]/zadanie/1/?nfc=1</code></td>
    <td class="code-val">START1</td>
    <td>PLACEHOLDER: przy bazie startowej</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Etap 2</td>
    <td><code>https://[DOMENA]/zadanie/2/?nfc=1</code></td>
    <td class="code-val">FLIK22</td>
    <td>PLACEHOLDER: zagadka z E1 wskazuje miejsce</td>
  </tr>
  <tr>
    <td>3</td>
    <td>Etap 3 — Lok. 1</td>
    <td><code>https://[DOMENA]/zadanie/3/?nfc=1</code></td>
    <td class="code-val">PACZK3</td>
    <td>PLACEHOLDER: przy paczce #1 w Lokalizacji 1</td>
  </tr>
  <tr>
    <td>4</td>
    <td>Etap 4 — Lok. 2</td>
    <td><code>https://[DOMENA]/zadanie/4/?nfc=1</code></td>
    <td class="code-val">PACZK4</td>
    <td>PLACEHOLDER: przy paczce #2 w Lokalizacji 2</td>
  </tr>
  <tr>
    <td>5</td>
    <td>Etap 5 — Lok. 3</td>
    <td><code>https://[DOMENA]/zadanie/5/?nfc=1</code></td>
    <td class="code-val">PACZK5</td>
    <td>PLACEHOLDER: przy beeper + paczce #3</td>
  </tr>
  <tr>
    <td>6</td>
    <td>Etap 6 — Lok. 4</td>
    <td><code>https://[DOMENA]/zadanie/6/?nfc=1</code></td>
    <td class="code-val">PACZK6</td>
    <td>PLACEHOLDER: przy paczce #4 w Lokalizacji 4</td>
  </tr>
</table>

<div style="margin-top:8mm;padding:4mm 6mm;background:#fff3cd;border:1px solid #ffc107;border-radius:4mm;">
  <strong>Uwaga:</strong> Zastąp <code>[DOMENA]</code> prawdziwym adresem GitHub Pages, np.
  <code>username.github.io/auta-szymon</code>
</div>

<h2>📋 Checklist przed imprezą (16 maja 2026)</h2>
<ul style="line-height:2.2;padding-left:6mm;">
  <li>☐ Uzupełnij współrzędne GPS w <code>assets/game.js</code> (STAGE3–6_WAYPOINTS)</li>
  <li>☐ Wpisz wskazówki do waypointów (hint dla każdego punktu trasy)</li>
  <li>☐ Wpisz STAGE2_NFC_HINT (zagadka z E1 → miejsce tagu E2)</li>
  <li>☐ Wpisz STAGE3_NFC_HINT (wskazówka do znalezienia tagu w Lok. 1)</li>
  <li>☐ Wpisz EXTRA_GIFT_LOCATION (opis miejsca dodatkowego prezentu)</li>
  <li>☐ Zastąp [DOMENA] w tabeli NFC powyżej</li>
  <li>☐ Zaprogramuj 6 tagów NFC (app: NFC Tools lub TagWriter)</li>
  <li>☐ Wydrukuj i przykrój etykiety backup-code</li>
  <li>☐ Ukryj tagi + paczki w lokalizacjach</li>
  <li>☐ Ukryj beeper w Lokalizacji 3 (razem z tagiem #5)</li>
  <li>☐ Ustaw sejf na kombinację 🔧🏁⚡🔴 i ukryj przy bazie</li>
  <li>☐ Naładuj telefon do 100%</li>
  <li>☐ Test: otwórz stronę w Chrome Android, sprawdź że GPS i NFC działają</li>
  <li>☐ Push do GitHub Pages i sprawdź HTTPS</li>
</ul>

</body>
</html>
```

- [ ] **Step 2: Verify print page**

Open `http://localhost:8080/print/sejf.html`. Check:
- "DRUKUJ" button visible (print button)
- Combination 🔧 🏁 ⚡ 🔴 displayed clearly
- NFC codes table renders with all 6 codes
- QR placeholder section visible
- Checklist renders

- [ ] **Step 3: Commit**

```bash
git add print/sejf.html
git commit -m "feat: add printable safe card with NFC backup codes and pre-party checklist"
```

---

## Task 14: Self-review + GPS Placeholder Test

**Files:** none created — review and validation

- [ ] **Step 1: Verify all placeholders are findable**

```bash
grep -r "PLACEHOLDER" assets/ zadanie/ final/ print/
```

Expected output lists all files with PLACEHOLDERs. These are intentional — not bugs.
Each corresponds to an item in the print/sejf.html checklist.

- [ ] **Step 2: Verify GPS testing path**

For local testing without real GPS, all stage pages have a `dblclick` on `#nav-status` that skips the navigation phase. Confirm this works on each stage:

Open `/zadanie/3/`, double-click the "Czekam na GPS..." text → should jump to NFC phase.
Open `/zadanie/4/` → same.
Open `/zadanie/5/` → same → shows beeper phase.
Open `/zadanie/6/` → same → shows NFC phase with countdown.

- [ ] **Step 3: Verify fuel persists across stages**

```javascript
// Console on /zadanie/1/?nfc=1
GameState.setFuel(50);
// Navigate to /zadanie/2/?nfc=1
GameState.getFuel(); // should return 50
```

- [ ] **Step 4: Verify symbol collection**

```javascript
// Console:
GameState.addSymbol('wrench');
GameState.addSymbol('flag');
GameState.getSymbols(); // ['wrench','flag']
```

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: complete Złomek Namieszał implementation - all stages, final page, print safe"
git push
```

---

## Post-Implementation: Before the Party

When GPS coordinates and hints are ready, fill these in `assets/game.js`:

```javascript
// STAGE3_WAYPOINTS example:
const STAGE3_WAYPOINTS = [
  { lat: 52.12345, lng: 21.98765, hint: 'Jedź prosto do końca ścieżki' },
  { lat: 52.12400, lng: 21.98800, hint: 'Skręć w lewo przy dużym kamieniu' },
];

// Single-waypoint (simple destination):
const STAGE4_WAYPOINTS = [
  { lat: 52.12500, lng: 21.98900, hint: 'Jesteś blisko! Szukaj znaku!' },
];

const STAGE2_NFC_HINT = 'Pod dużą donicą przy furtce';
const STAGE3_NFC_HINT = 'Tag jest przytwierdzony do płotu po lewej stronie';
const EXTRA_GIFT_LOCATION = 'Dodatkowy prezent jest schowany pod poduszką na kanapie w salonie!';
```

Then run: `git add assets/game.js && git commit -m "config: add GPS coordinates for party day" && git push`
