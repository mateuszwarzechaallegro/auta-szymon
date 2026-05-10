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

// E1: 2-segment tutorial route ~100m total; segment 1 = mid-point, segment 2 = Location 0
const STAGE1_WAYPOINTS = [
  { lat: 0, lng: 0, hint: 'PLACEHOLDER: punkt pośredni (~50m od bazy)' },
  { lat: 0, lng: 0, hint: 'PLACEHOLDER: Lokalizacja 0 — bezpieczne miejsce' },
];

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
// SUCCESS OVERLAY — shown after each child completes a task
// ============================================================
function showSuccess(player, message, onContinue) {
  const colors = { szymon: '#e94560', amelia: '#FFD700', ania: '#4fc3f7' };
  const names  = { szymon: '🔴 Szymon', amelia: '🟡 Amelia', ania: '🔵 Ania' };
  const col = colors[player] || '#fff';
  const ov = document.createElement('div');
  ov.className = 'success-overlay';
  ov.innerHTML = `
    <div class="success-box">
      <div class="success-stars">⭐ ⭐ ⭐</div>
      <div class="success-player" style="color:${col};">${names[player] || player}</div>
      <div class="success-msg">${message}</div>
      <button class="btn-primary success-btn" style="border-color:${col};">Dalej! →</button>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('active'));
  ov.querySelector('.success-btn').addEventListener('click', () => { ov.remove(); if (onContinue) onContinue(); });
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
    if (b) { b.disabled = true; b.textContent = '⛽ Zatankowane ✓'; }
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
      if (b) { b.disabled = true; b.textContent = '⛽ Zatankowane ✓'; b.style.display = 'block'; }
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
// LEGACY SHIM — Navigation uses gpsArrivalRadiusM (hardcoded in Navigation module above)
// GAME_CONFIG kept for backwards compat in case any page references it
// ============================================================
const GAME_CONFIG = { fuelGPSMinSpeedKmh: 5, waypointRadiusM: 30, gpsArrivalRadiusM: 25 };

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
