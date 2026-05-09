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
