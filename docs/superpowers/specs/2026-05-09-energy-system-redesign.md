# Spec: Energy System Redesign + Role Handoffs
Date: 2026-05-09  
Project: Złomek Namieszał — Urodziny Szymona

---

## 1. Overview

Replace the existing single "fuel" mechanic with a dual-resource system (Benzyna + Bateria), add a persistent fixed header visible on all pages, introduce role-based handoff screens before each child's task, replace the emoji cipher in E2 with Cars movie trivia, and redesign the E4 speed challenge as a sequential multi-child driving test.

---

## 2. Persistent Fixed Header

### Display
A thin bar fixed to the top of the viewport on every page, rendered by `game.js` injecting HTML on `DOMContentLoaded`. Two progress bars side by side:

```
⛽ [████████░░] 80%    ⚡ [░░░░░░░░░░] 0%
```

### Implementation
- `position: fixed; top: 0; left: 0; right: 0; z-index: 200`
- Height: ~44px
- Background: `rgba(15,15,26,0.97)` with bottom border `1px solid rgba(233,69,96,0.3)`
- Each page adds `padding-top: 44px` to `.page` to prevent content overlap
- `game.js` creates and inserts the header element before any other content, replacing the old in-flow `.fuel-widget` divs that were manually added to each HTML page
- HTML pages no longer contain `<div class="fuel-widget">` — it is injected automatically

### CSS classes (new)
```css
#game-header          /* fixed container */
.header-bar-wrap      /* one resource: icon + track + label */
.header-fuel-fill     /* benzyna fill (green→orange→red) */
.header-energy-fill   /* bateria fill (blue→gold) */
```

---

## 3. Dual Resource System

### 3.1 Benzyna ⛽ (Fuel)

| Property | Value |
|---|---|
| Starting value | **20%** |
| Maximum | 100% |
| Minimum | 0% |
| localStorage key | `auta_szymon_26_benzyna` |

**Gains:**
- Physical "fuel bottle" code at each location: **+30%** (capped at 100%)

**Losses:**
- Each shake during shake-to-charge: **−1%** benzyna

Benzyna does NOT drain passively. It is only consumed by shaking.

### 3.2 Bateria ⚡ (Energy)

| Property | Value |
|---|---|
| Starting value | **0%** |
| Maximum | 100% |
| Minimum | 0% |
| localStorage key | `auta_szymon_26_bateria` |

**Gains:**
- Moving: **+1% per 10 metres** (GPS haversine between consecutive positions)
- Shaking (any mode): **+2% per shake**

**Losses:**
- Idle (not moving): **−1% per 20 seconds**
- "Moving" defined as: GPS displacement ≥ 1m in last 2 seconds

**Justification for rates:**
- 300m leg → +30% bateria from riding
- 5-minute task stop → −15% bateria drain
- Net result: kids maintain ~50–80% bateria during normal play
- E1 start: 20 shakes → −20% benzyna, +40% bateria (enough for first leg)

### 3.3 Conversion: Shake to Charge
Each detected shake:
- −1% benzyna
- +2% bateria

Shake detection threshold and cooldown unchanged from existing `Sensors.startShake`.

---

## 4. Game States & Logic

### 4.1 Normal State
- Bateria ≥ 5%
- Tasks unlocked, header shows both bars normally

### 4.2 Low Energy State (bateria < 5%, benzyna > 0%)
- **Shake-to-charge modal** appears (non-dismissable)
- Message: *"Silnik pada! Potrząśnij telefonem żeby naładować baterię!"*
- Shows shake counter and benzyna cost
- Modal dismisses automatically when bateria ≥ 15%
- Tasks remain blocked until modal dismissed

### 4.3 Dead State (bateria = 0%, benzyna = 0%)
- **Emergency navigation modal** appears
- Message: *"Brak paliwa i energii! Jedźcie z powrotem do ostatniego punktu tankowania!"*
- Navigation widget shows direction + distance to last refuel point
- `lastRefuelLocation` stored in localStorage when each fuel code is accepted
- Initial refuel location = base (stage 1) coordinates

### 4.4 Task Block
Any stage challenge interaction (buttons, inputs, canvas) is disabled when bateria < 5%, replaced by shake-to-charge prompt.

---

## 5. Refueling System

### Physical Setup
At each stage location (E1 base, E3, E4, E5, E6) there is a physical "fuel bottle" prop (bottle or card) with a printed 5-character alphanumeric code.

### Codes (printed on bottles)
| Location | Stage | Code | GPS enforcement |
|---|---|---|---|
| Base | E1 | `BENZ1` | No (base, always available) |
| Lokalizacja 1 | E3 | `BENZ3` | Within 50m of E3 NFC tag coords |
| Lokalizacja 2 | E4 | `BENZ4` | Within 50m of E4 NFC tag coords |
| Lokalizacja 3 | E5 | `BENZ5` | Within 50m of E5 NFC tag coords |
| Lokalizacja 4 | E6 | `BENZ6` | Within 50m of E6 NFC tag coords |

### UI
A **"Zatankuj ⛽"** button appears on each stage page. Tapping it:
1. Checks GPS — if outside 50m radius: *"Jesteście za daleko od punktu tankowania!"*
2. If within radius: shows code input field
3. Correct code → +30% benzyna, saves `lastRefuelLocation`, button disabled for this stage
4. Wrong code → red flash, try again

E2 has no refuel point (too close to base, kids just go back to base if needed).

---

## 6. Role Handoff System

### Handoff Screen
Before every role-specific task within a stage, a full-screen overlay appears:

```
╔══════════════════════════════════╗
║  🔵 ANIA                         ║
║  Twoja kolej, Pilotko!           ║
║                                  ║
║  Twoje zadanie:                  ║
║  [one-line task description]     ║
║                                  ║
║  [ ✅ Jestem gotowa! ]           ║
╚══════════════════════════════════╝
```

- Background/accent colour per player: 🔴 `#e94560`, 🟡 `#FFD700`, 🔵 `#2196F3`
- Task only starts (timers, GPS watchers, etc.) AFTER confirm button tapped
- Title text varies by gender: Szymon → "Nawigatorze!", Amelia → "Mechaniku!", Ania → "Pilotko!"

### Role Definitions
| Role | Player | Colour | Difficulty |
|---|---|---|---|
| Nawigator | 🔴 Szymon | Red | Medium |
| Mechanik | 🟡 Amelia | Gold | Harder |
| Pilot | 🔵 Ania | Blue | Easiest |

---

## 7. Stage Task Breakdown

### E1 — Baza: Rozruch Silnika

Sequential tasks (handoff before each):

1. **🟡 Amelia (Mechanik)** — Wpisuje kod startowy NFC/backup (`START1`)
2. **🔵 Ania (Pilot)** — Shake challenge: potrząsa telefonem 20 razy w 15s → −20% benzyna, +40% bateria
3. **🔴 Szymon (Nawigator)** — Odczytuje wskazówkę do E2 na głos drużynie (tekst `STAGE2_NFC_HINT` wyświetlony na ekranie)

### E2 — Szyfr Filka: Cars Trivia + GPS Ride

Sequential tasks:

1. **🟡 Amelia (Mechanik)** — Cars Trivia (3 pytania, wymagane 2/3 poprawne — patrz sekcja 8)
2. **🔵 Ania (Pilot)** — Jedzie ≥5 km/h przez 60s (GPS speed challenge, bez górnego limitu prędkości)
3. **🔴 Szymon (Nawigator)** — Potwierdza na GPS że jadą we właściwym kierunku (dblclick dev skip lub GPS arrival przy E3)

Po sukcesie wszystkich trzech: ekran sukcesu z wskazówką do Lokalizacji 1.

### E3 — Lokalizacja 1: GPS Nav + Reaction Game

1. **🔴 Szymon (Nawigator)** — Nawiguje GPS do lokalizacji (strzałka kompasu, jest "kierowcą" nawigacji)
2. **🟡 Amelia (Mechanik)** — Wpisuje kod NFC/backup (`PACZK3`) po przybyciu
3. **🔵 Ania (Pilot)** — Gra w reaction button game (wersja uproszczona: 4 przyciski zamiast 6, sekwencja 4 zamiast 5, limit czasu 10s)

Symbol: 🔧 Klucz

### E4 — Lokalizacja 2: GPS Nav + Memory + Sekwencja Prędkości

1. **🔴 Szymon (Nawigator)** — Nawiguje GPS (multi-waypoint)
2. **🟡 Amelia (Mechanik)** — Memory match (8 kart, 90s)
3. **Sekwencja prędkości** (cztery podfazy po kolei, handoff przed każdą):
   - **🔵 Ania** — Tester: jedź 5–10 km/h przez **10 sekund**
   - **🔴 Szymon** — Kierowca: jedź 5–10 km/h przez **25 sekund**
   - **🟡 Amelia** — Mechanik: wyciągnij ≥15 km/h przez **3 sekundy**
   - **🔴 Szymon** — Finał: wyciągnij ≥15 km/h przez **6 sekund**

Symbol: 🏁 Flaga

#### Speed UI for "sweet spot" (5–10 km/h)
- Gauge shows 0–20 km/h range
- Green zone highlighted between 5 and 10 km/h markers
- Red markers at 5 and 10 km/h
- Fill bar turns green when inside zone, red when outside
- Timer only counts while speed is inside zone (stops if outside, does NOT reset)

#### Speed UI for "burst" (≥15 km/h)
- Gauge shows 0–30 km/h, red marker at 15 km/h
- Fill bar turns red/hot when ≥15 km/h
- Hold timer counts continuously while ≥15 km/h, resets to 0 if drops below

### E5 — Lokalizacja 3: Beeper + Level + Riddle

1. **🔴 Szymon (Nawigator)** — Nawiguje GPS + szuka beepera (narrative)
2. **🟡 Amelia (Mechanik)** — Zagadka słowna (odpowiedź: opona/koło/guma)
3. **🔵 Ania (Pilot)** — Level challenge: trzymaj telefon poziomo przez 15s (tolerancja 20°, fail po 3s złego kąta)

Symbol: ⚡ Błyskawica

### E6 — Lokalizacja 4: Dodge + Sprint + Finał

1. **🔴 Szymon (Nawigator)** — Nawiguje GPS do ostatniej lokalizacji
2. **🟡 Amelia (Mechanik)** — GPS sprint: jedź 100m bez zatrzymania
3. **🔵 Ania (Pilot)** — Gra w dodge game (canvas, przeżyj 20s)

Po sukcesie: ekran z symbolem 🔴 Tłok + przycisk "DO BAZY! OTWIERAMY SEJF!"

Note: kolejność E6 zmieniona vs. poprzedni plan — Ania dostaje prostsze zadanie (dodge game jest reaktywne, łatwe do obsługi), Amelia sprint jest trudniejszy fizycznie.

Symbol: 🔴 Tłok

---

## 8. E2 Cars Trivia (zastępuje emoji cipher)

Mechanik Amelia odpowiada. 3 pytania, wymagane 2 z 3 poprawnych. Po błędzie pytanie wraca (bez limitu prób per pytanie, ale po 3 złych odpowiedziach na jedno pytanie pojawia się podpowiedź).

| # | Pytanie | Odpowiedzi | Poprawna |
|---|---|---|---|
| 1 | Jakiego koloru jest Zygzak McQueen? | 🔴 Czerwony / 🔵 Niebieski / 🟢 Zielony | 🔴 Czerwony |
| 2 | Jak nazywa się laweta przyjaciela Zygzaka? | Złomek / Filk / Ramona | Złomek |
| 3 | W jakim mieście mieszka Zygzak po wyścigu? | Radiator Springs / Nowy Jork / Las Vegas | Radiator Springs |

---

## 9. Files Changed

| File | Change type |
|---|---|
| `assets/style.css` | Add `#game-header`, `.header-*` styles; add handoff overlay styles; add speed zone styles |
| `assets/game.js` | Rewrite resource system (Benzyna+Bateria); add header injection; add `FuelManager` → `ResourceManager`; add `HandoffScreen`; add refuel GPS check; add emergency nav |
| `index.html` | Remove manual fuel widget; minor copy |
| `zadanie/1/index.html` | Full rewrite: 3-role sequential structure |
| `zadanie/2/index.html` | Replace cipher with Cars trivia; 3-role structure |
| `zadanie/3/index.html` | 3-role structure; simplified reaction game for Ania |
| `zadanie/4/index.html` | 3-role structure; replace speed burst with 4-phase speed sequence |
| `zadanie/5/index.html` | Swap Amelia/Ania task order; 3-role structure |
| `zadanie/6/index.html` | 3-role structure; Ania gets dodge game |
| `print/sejf.html` | Add fuel bottle codes to table |

---

## 10. localStorage Keys (full list)

| Key | Type | Description |
|---|---|---|
| `auta_szymon_26_benzyna` | number | Current benzyna % |
| `auta_szymon_26_bateria` | number | Current bateria % |
| `auta_szymon_26_symbols` | array | Collected safe symbols |
| `auta_szymon_26_stages` | array | Completed stage numbers |
| `auta_szymon_26_startTime` | number | Unix timestamp race start |
| `auta_szymon_26_nfc_N` | bool | NFC unlocked for stage N |
| `auta_szymon_26_refuel_N` | bool | Fuel bottle used at location N |
| `auta_szymon_26_lastRefuelLat` | number | GPS lat of last refuel point |
| `auta_szymon_26_lastRefuelLng` | number | GPS lng of last refuel point |

---

## 11. Out of Scope

- Multiplayer / server sync (single device)
- Audio for beeper (handled by physical device)
- Changing NFC backup codes (unchanged: START1, FLIK22, PACZK3–6)
- GPS coordinates for waypoints (filled before party day)
