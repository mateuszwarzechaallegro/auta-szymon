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
