# Simplify Game to 5 Stages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the game from 7 stages (E0-E6 + Final) to 5 stages (E0-E4 + Final gift riddle) to match the organizer's intended flow.

**Architecture:** Remove E5 and E6 entirely. Modify E4 to transition to a simplified E5 (final stage with gift riddle). Change Memory Match assignment from Amelia to Szymon. Add missing NFC location hints for E4. Update all "X / 6" badges to "X / 5". Update sejf.html organizer instructions.

**Tech Stack:** Vanilla HTML/JS, no build tools. Static files served via GitHub Pages.

---

## Current vs Target Flow

| # | Current | Target |
|---|---------|--------|
| E0 | Printed poem -> sandbox | Same |
| E1 | Fuel + Shake + Nav + E2 hint | Same (badge: 1/5) |
| E2 | NFC -> Quiz + Speed + Confirm + E3 hint | Same (badge: 2/5) |
| E3 | Nav -> NFC + Fuel -> Pit Stop -> symbol wrench -> link E4 | Nav -> NFC + Fuel -> Pit Stop -> E4 hint -> link E4 (badge: 3/5, no symbol) |
| E4 | Nav -> NFC -> Memory(Amelia) -> Speed Seq -> symbol flag -> link E5 | Nav -> NFC -> Memory(**Szymon**) -> Speed Seq -> fuel -> link E5 (badge: 4/5) |
| E5 | Nav -> Beeper -> NFC -> Riddle -> Level -> symbol lightning | Nav -> NFC -> **Gift riddle (placeholder)** -> END (badge: 5/5) |
| E6 | Nav -> NFC -> 5min -> Sprint -> Dodge -> symbol piston | **DELETED** |
| Final | Victory + safe symbols + gift location | **Simplified: confetti + gift riddle result + go get gift** |

## Key Decisions
- **Remove safe symbol system** from the flow (user's plan has no safe/sejf)
- **Remove fuel bottles for deleted stages** (E5 old code `WVE7D9`, E6 code `J2CK5C`)
- **Keep fuel bottle in E4** (code `NBFQUM`) - user says they get fuel after speed sequence
- **Add E4 NFC hint** at end of E3 (new constant `STAGE4_NFC_HINT`)
- **Add E5 NFC hint** at end of E4 (new constant `STAGE5_NFC_HINT`)  
- **Final page** shows gift riddle result (placeholder) with confetti, no safe symbols

---

### Task 1: Update game.js constants

**Files:**
- Modify: `assets/game.js:1-45`

- [ ] **Step 1: Remove E6 fuel code, E5/E6 fuel coords, E5/E6 waypoints, safe symbols. Add new hint constants.**

In `assets/game.js`, replace the constants section (lines 1-45) with:

```js
'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const FUEL_BOTTLE_CODES = {
  1: 'ZK9QBX', 3: 'SGM9S7', 4: 'NBFQUM',
};
const FUEL_BOTTLE_COORDS = {
  3: { lat: 52.573077, lng: 17.018660 },
  4: { lat: 0, lng: 0 },
};
const BASE_COORDS = { lat: 52.572285, lng: 17.018412 };

// ============================================================
// LOCATION PLACEHOLDERS — replace before party
// ============================================================
const STAGE2_NFC_HINT    = 'Wraki dwa na podwórku stoją,<br>zardzewiałe, nikogo się nie boją.<br>Obejdźcie je, za nimi jest pniak —<br>w nim ukryty jest kolejny znak!';
const STAGE3_NFC_HINT    = 'PLACEHOLDER: opisz gdzie jest tag NFC w lokalizacji 1';
const STAGE4_NFC_HINT    = 'PLACEHOLDER: opisz gdzie jest tag NFC w lokalizacji 2';
const STAGE5_NFC_HINT    = 'PLACEHOLDER: opisz gdzie jest tag NFC w lokalizacji 3';
const GIFT_RIDDLE        = 'PLACEHOLDER: zagadka/wskazówka gdzie jest prezent';

// E1: tutorial route
const STAGE1_WAYPOINTS = [
  { lat: 52.572708, lng: 17.016759, hint: 'Skręć w prawo w polną drogę' },
  { lat: 52.573394, lng: 17.017269, hint: 'Pierwsza w prawo!' },
  { lat: 52.573091, lng: 17.018629, hint: 'Do końca prosto!' },
];

const STAGE3_WAYPOINTS = [];
const STAGE4_WAYPOINTS = [];
const STAGE5_WAYPOINTS = [];
```

Note: `SAFE_SYMBOLS`, `EXTRA_GIFT_LOCATION`, and `STAGE6_WAYPOINTS` are removed. `STAGE5_WAYPOINTS` is repurposed for the new final location (was Lokalizacja 3 in old E5, now the gift location). Old `FUEL_BOTTLE_CODES[5]` and `[6]` removed. Old `FUEL_BOTTLE_COORDS[5]` and `[6]` removed.

- [ ] **Step 2: Verify no runtime references to removed constants**

Search for: `SAFE_SYMBOLS`, `EXTRA_GIFT_LOCATION`, `STAGE6_WAYPOINTS`, `FUEL_BOTTLE_CODES[5]`, `FUEL_BOTTLE_CODES[6]`, `FUEL_BOTTLE_COORDS[5]`, `FUEL_BOTTLE_COORDS[6]`, `addSymbol`, `markStage(5)`, `markStage(6)` across all HTML files. These will be addressed in subsequent tasks.

---

### Task 2: Update E1 badge (1/6 -> 1/5)

**Files:**
- Modify: `zadanie/1/index.html:16`

- [ ] **Step 1: Change badge text**

Change `ETAP 1 / 6` to `ETAP 1 / 5` on line 16.

No other changes needed in E1 — the hint flow (STAGE2_NFC_HINT) is correct.

---

### Task 3: Update E2 badge (2/6 -> 2/5)

**Files:**
- Modify: `zadanie/2/index.html:16`

- [ ] **Step 1: Change badge text**

Change `ETAP 2 / 6` to `ETAP 2 / 5` on line 16.

No other changes needed in E2 — the E3 hint flow (STAGE3_NFC_HINT) is correct.

---

### Task 4: Rewrite E3 — add E4 hint, remove symbol, update badge

**Files:**
- Modify: `zadanie/3/index.html`

- [ ] **Step 1: Change badge from "ETAP 3 / 6" to "ETAP 3 / 5"**

Line 16: change `ETAP 3 / 6` to `ETAP 3 / 5`.

- [ ] **Step 2: Replace the success phase HTML (remove symbol, add E4 hint)**

Replace the entire `<!-- Phase 4: Success -->` section (lines 69-85) with:

```html
    <!-- Phase 4: Success + E4 hint -->
    <div id="phase-success" class="task-body" style="display:none;">
      <div class="task-card" style="border-color:#4CAF50;">
        <div class="task-card-icon">🎉</div>
        <div class="task-card-text">
          <strong>Pit Stop rozwiązany!</strong><br><br>
          <em>Złomek: "Następny tag NFC jest gdzieś w Lokalizacji 2!"</em><br><br>
          <span style="color:#FFD700;font-weight:700;" id="e4-hint-text">PLACEHOLDER</span>
        </div>
      </div>
      <a class="btn-primary" href="../4/">⚡ JEDŹ DO LOKALIZACJI 2 →</a>
    </div>
```

- [ ] **Step 3: Update the onGameSuccess function to remove symbol logic and show E4 hint**

Replace the `onGameSuccess` function (lines 191-196) with:

```js
    function onGameSuccess() {
      GameState.markStage(3);
      document.getElementById('phase-game').style.display    = 'none';
      document.getElementById('phase-success').style.display = 'block';
      document.getElementById('e4-hint-text').innerHTML = STAGE4_NFC_HINT;
    }
```

Note: `GameState.addSymbol('wrench')` is removed since we're removing the safe symbol system.

---

### Task 5: Rewrite E4 — Memory for Szymon, add E5 hint, remove symbol, update badge

**Files:**
- Modify: `zadanie/4/index.html`

- [ ] **Step 1: Change badge from "ETAP 4 / 6" to "ETAP 4 / 5"**

Line 16: change `ETAP 4 / 6` to `ETAP 4 / 5`.

- [ ] **Step 2: Change Memory Match handoff from Amelia to Szymon**

Line 168: change `showHandoff('amelia',` to `showHandoff('szymon',`.

- [ ] **Step 3: Update memory win success message player**

Line 210: change `showSuccess('amelia',` to `showSuccess('szymon',`.

- [ ] **Step 4: Replace the success phase HTML (remove symbol, add E5 hint + fuel reminder)**

Replace the entire `<!-- Success -->` section (lines 116-131) with:

```html
    <!-- Success + E5 hint -->
    <div id="phase-success" class="task-body" style="display:none;">
      <div class="task-card" style="border-color:#4CAF50;">
        <div class="task-card-icon">🎉</div>
        <div class="task-card-text">
          <strong>Sekwencja prędkości zaliczona!</strong><br><br>
          <em>Złomek: "Ostatnia lokalizacja! Tag NFC czeka!"</em><br><br>
          <span style="color:#FFD700;font-weight:700;" id="e5-hint-text">PLACEHOLDER</span>
        </div>
      </div>
      <a class="btn-primary" href="../5/">⚡ JEDŹ DO OSTATNIEJ LOKALIZACJI →</a>
    </div>
```

- [ ] **Step 5: Update onSpeedPhaseSuccess to remove symbol logic and show E5 hint**

In the `onSpeedPhaseSuccess` function (around line 329-334), replace the else branch:

Old:
```js
        } else {
          GameState.addSymbol('flag');
          GameState.markStage(4);
          document.getElementById('phase-speed').style.display   = 'none';
          document.getElementById('phase-success').style.display = 'block';
        }
```

New:
```js
        } else {
          GameState.markStage(4);
          document.getElementById('phase-speed').style.display   = 'none';
          document.getElementById('phase-success').style.display = 'block';
          document.getElementById('e5-hint-text').innerHTML = STAGE5_NFC_HINT;
        }
```

- [ ] **Step 6: Update organizer skip link from ../5/ to correct target**

Line 154: the triple-click skip already goes to `../5/` which is correct (new E5 = gift riddle page).

---

### Task 6: Rewrite E5 — replace with gift riddle (final stage)

**Files:**
- Modify: `zadanie/5/index.html` (complete rewrite)

- [ ] **Step 1: Replace entire file with the new gift riddle stage**

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
      <span class="task-badge">ETAP 5 / 5</span>
    </div>

    <!-- Phase 1: Szymon GPS nav -->
    <div id="phase-nav" class="task-body">
      <div id="nav-content" style="display:none;">
        <div class="task-step-label">🗺️ Nawiguj do Ostatniej Lokalizacji</div>
        <div class="task-title">Ostatni punkt!</div>
        <div class="task-card">
          <div class="task-card-icon">🏆</div>
          <div class="task-card-text">
            <em>Złomek: "To ostatnia lokalizacja! Jedźcie!"</em>
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
        <div class="task-hint">Jedź za strzałką! Dblclick na status żeby pominąć (dev).</div>
      </div>
    </div>

    <!-- Phase 2: NFC gate -->
    <div id="phase-nfc" class="task-body" style="display:none;">
      <div class="task-step-label">📡 Zeskanuj tag NFC</div>
      <div class="task-card"><div class="task-card-icon">📡</div>
        <div class="task-card-text"><strong>Dotknij tagiem NFC telefonu!</strong></div></div>
    </div>

    <!-- Phase 3: Gift riddle -->
    <div id="phase-riddle" class="task-body" style="display:none;">
      <div id="riddle-content" style="display:none;">
        <div class="task-step-label">🎁 Zagadka Finałowa!</div>
        <div class="task-title">Gdzie jest prezent?</div>
        <div class="task-card" style="border-color:#FFD700;background:rgba(255,215,0,0.08);">
          <div class="task-card-icon">🎁</div>
          <div class="task-card-text" style="font-size:1.1rem;line-height:1.8;color:#FFD700;">
            <strong id="gift-riddle-text">PLACEHOLDER</strong>
          </div>
        </div>
        <div class="task-card" style="margin-top:12px;">
          <div class="task-card-icon">🏆</div>
          <div class="task-card-text">
            <em>Złomek: "KA-CZAOW! Rozwiążcie zagadkę i biegnijcie po prezent!"</em>
          </div>
        </div>
        <a class="btn-primary" href="../../final/" style="margin-top:16px;">🎉 KONIEC GRY! →</a>
      </div>
    </div>

    <div class="flag-strip" style="margin-top:auto;"></div>
  </div>

  <script src="../../assets/game.js"></script>
  <script>
    startEnergyMonitoring();

    // Step 1: Szymon GPS nav
    showHandoff('szymon', 'Nawiguj GPS do ostatniej lokalizacji!', startNav);

    function startNav() {
      document.getElementById('nav-content').style.display = 'block';
      const waypoints = STAGE5_WAYPOINTS.length > 0 ? STAGE5_WAYPOINTS :
        [{ lat: 0, lng: 0, hint: 'PLACEHOLDER: uzupełnij współrzędne ostatniej lokalizacji' }];
      Navigation.start(waypoints,
        (a,d,close,last,hint) => { renderNav(a,d,close,last,hint); if(close&&last) setTimeout(() => showSuccess('szymon','Ostatnia lokalizacja znaleziona! 🏆', showNFCPhase),1500); },
        (i,fin,nh) => { if(!fin&&nh) document.getElementById('nav-hint').textContent='✓ '+nh; }
      );
      addDoubleTap(document.getElementById('nav-status'), showNFCPhase);
      addTripleClick(document.querySelector('.task-badge'), () => { window.location.href = '../../final/'; });
    }

    function showNFCPhase() {
      Navigation.stop();
      document.getElementById('phase-nav').style.display = 'none';
      document.getElementById('phase-nfc').style.display = 'block';
      if (checkNFCToken(5)) startGiftRiddle();
    }

    function startGiftRiddle() {
      document.getElementById('phase-nfc').style.display    = 'none';
      document.getElementById('phase-riddle').style.display = 'block';
      showHandoff('szymon', 'Rozwiąż zagadkę — gdzie jest prezent?', () => {
        document.getElementById('riddle-content').style.display = 'block';
        document.getElementById('gift-riddle-text').innerHTML = GIFT_RIDDLE;
        GameState.markStage(5);
      });
    }
  </script>
</body>
</html>
```

---

### Task 7: Simplify final page — remove safe symbols, keep confetti

**Files:**
- Modify: `final/index.html`

- [ ] **Step 1: Replace the page body content**

Replace the entire `<div class="page content-above">` section with a simplified version that shows:
- Confetti animation (keep as-is)
- "WYGRANA!" title
- McQueen congratulatory message (simplified, no safe references)
- Elapsed mission time
- No safe symbols section
- No gift location (gift riddle was already shown in E5)

New body content for `<div class="page content-above">`:

```html
  <div class="page content-above">
    <div class="flag-strip"></div>

    <div class="neon-title" style="margin-top:24px;">🏆 WYGRANA! 🏆</div>
    <div class="gold-text">Urodziny Szymona — 16 maja 2026</div>

    <div class="hero-emoji" style="font-size:5rem;">🎉</div>

    <div class="mission-box" style="margin:16px;">
      <div class="mission-label">📻 Wiadomość od Zygzaka McQueena</div>
      <div class="mission-text">
        <em>"KA-CZAOW! Ukończyliście wszystkie etapy!
        Jesteście NAJLEPSZĄ Ekipą Ratunkową w historii Radiator Springs!
        Złomek jest z Was naprawdę dumny!"</em>
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
```

- [ ] **Step 2: Remove gift-location JS and EXTRA_GIFT_LOCATION reference**

In the script section, remove line 92: `document.getElementById('gift-location').textContent = EXTRA_GIFT_LOCATION;`

Keep the elapsed time calculation and confetti generation.

---

### Task 8: Delete E6 page (or leave as unused)

**Files:**
- Delete or leave: `zadanie/6/index.html`

- [ ] **Step 1: Delete the file**

Since E6 no longer exists in the game flow, delete `zadanie/6/index.html` to avoid confusion.

Alternatively, leave it in place — it won't be linked from anywhere, so it's harmless. Deletion is cleaner.

---

### Task 9: Update organizer instructions (sejf.html)

**Files:**
- Modify: `print/sejf.html`

This is a large file (590 lines). Key changes needed:

- [ ] **Step 1: Remove safe combination section** (lines 125-134)

Remove or replace the `<h2>🔐 Kombinacja sejfu</h2>` section and the `<div class="safe-combo">` block.

- [ ] **Step 2: Update fuel bottle table** — remove E5 and E6 rows (lines 175-184)

Remove the rows for Lokalizacja 3 (E5, code WVE7D9) and Lokalizacja 4 (E6, code J2CK5C).

- [ ] **Step 3: Update NFC tags table** — remove E5 and E6 rows (lines 219-228), keep E5 but update to new purpose

Replace E5 row: now it's the final gift riddle location (Lokalizacja 3).
Remove E6 row entirely.

- [ ] **Step 4: Rewrite the game sequence section** (lines 234-546)

Update all stages to reflect the new 5-stage flow:
- E0: same
- E1: same (badge 1/5)
- E2: same (badge 2/5)
- E3: Update — no symbol, add E4 hint display. Badge 3/5.
- E4: Update — Memory for Szymon, no symbol, add E5 hint. Badge 4/5.
- E5: Rewrite — Nav + NFC + Gift riddle. Badge 5/5.
- Remove E6 section entirely
- Update FINAŁ to remove safe, just say "kids go get the gift"

- [ ] **Step 5: Update checklist** (lines 560-587)

Remove references to:
- `STAGE6_WAYPOINTS`
- `FUEL_BOTTLE_COORDS[5,6]`
- `SAFE_SYMBOLS`
- Safe setup
- Beeper
- E6 NFC tag

Add references to:
- `STAGE4_NFC_HINT`
- `STAGE5_NFC_HINT`
- `GIFT_RIDDLE`

- [ ] **Step 6: Update the secret skip section if it references "1-6"**

Change "1–6" to "1–5" in the skip description (line 145).

---

### Task 10: Update emergency rescue codes page

**Files:**
- Check: `print/kody_ratunkowe.html`

- [ ] **Step 1: Review and verify**

The rescue codes are independent of stage count — they just add fuel/battery. No changes needed unless they reference "6 etapów" or specific stage numbers.

---

### Task 11: Update fuel bottle labels print page

**Files:**
- Check: `print/butelki.html`

- [ ] **Step 1: Remove labels for E5 and E6 bottles**

Since only 3 fuel bottles remain (E1: ZK9QBX, E3: SGM9S7, E4: NBFQUM), remove the labels for E5 (WVE7D9) and E6 (J2CK5C).

---

### Task 12: Clean up game.js — remove GameState.addSymbol if unused

**Files:**
- Modify: `assets/game.js`

- [ ] **Step 1: Search for all addSymbol calls**

After removing symbol calls from E3, E4, E5, E6, verify no stage pages call `GameState.addSymbol()` anymore. If none do, the method can stay (it's harmless) but won't be invoked.

- [ ] **Step 2: Verify build/deploy works**

Open the site locally and verify:
- E1 -> E2 -> E3 -> E4 -> E5 -> Final all link correctly
- No JS errors in console from missing constants
- NFC gate skip (triple-tap) works on all stages

---

### Task 13: Final verification

- [ ] **Step 1: Walk through the entire flow manually**

Verify each stage:
1. E0: printed poem (no code change)
2. E1 (1/5): Amelia fuel -> Ania shake -> Szymon nav -> Amelia reads E2 hint
3. E2 (2/5): NFC -> Amelia quiz -> Ania speed -> Szymon confirm -> E3 hint -> link to E3
4. E3 (3/5): Szymon nav -> Amelia NFC -> Ania Pit Stop -> E4 hint -> link to E4
5. E4 (4/5): Szymon nav -> NFC -> **Szymon** Memory -> Speed Sequence -> E5 hint -> link to E5
6. E5 (5/5): Szymon nav -> NFC -> Gift riddle (placeholder) -> link to Final
7. Final: Confetti + congratulations + elapsed time

- [ ] **Step 2: Verify no broken references**

Check that no file references:
- `zadanie/6/`
- `STAGE6_WAYPOINTS`
- `SAFE_SYMBOLS`
- `EXTRA_GIFT_LOCATION`
- `GameState.addSymbol()`
