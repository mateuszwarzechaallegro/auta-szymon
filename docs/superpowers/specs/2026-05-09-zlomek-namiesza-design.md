# Design: "Złomek Namieszał!" — Urodzinowa Przygoda Samochodowa

**Data:** 2026-05-09  
**Projekt:** auta-szymon (GitHub Pages)  
**Przeznaczenie:** Urodzinowa gra terenowa dla dzieci (8 i 12 lat)

---

## 1. Kontekst i cel

Troje dzieci (Szymon — urodzinowy bohater, Amelia, Ania) jako drużyna odbywa misję terenową na gokartach (rowerach). Grają na jednym telefonie Android. Strona hostowana na GitHub Pages (HTTPS).

**Cel gry:** Zebrać 4 paczki prezentowe (zestawy części samochodziku) rozrzucone przez Złomka, a następnie otworzyć sejf na bazie, żeby zobaczyć niespodziankę od Zygzaka McQueena.

---

## 2. Fabuła

Zygzak McQueen nagrał filmik/wiadomość dla Szymona. Złomek (Mater) chciał mu pomóc udekorować, ale wsiadł na lawetę, zakręcił bączka i rozrzucił 4 pudełka z prezentami po całej okolicy. Dzieci = **Ekipa Ratunkowa Radiator Springs**. Mają GPS, licznik paliwa i tracker (urządzenie pikające) — ruszają na poszukiwania.

Złomek pojawia się jako komiczna postać przewodnicząca przez etapy (teksty w stylu "Hej amigo, chyba pomylił mi się wschód ze wschodem!").

---

## 3. Gracze i sprzęt

| Element | Szczegóły |
|---|---|
| Gracze | Szymon 🔴, Amelia 🟡, Ania 🔵 — drużyna, 1 telefon |
| Telefon | Android, Chrome, HTTPS |
| Transport | Gokarty (rowery) |
| Czas gry | ~1–1.5 godziny |
| Teren | Start: podwórko → ścieżki terenowe na osiedlu |
| NFC Tagi | Wiele szt., typ NTAG213/215, programowalne URL |
| Beeper | 1 szt. — pika gdy telefon jest w pobliżu |
| Sejf | Wydrukowany, 4 znaki kombinacja, kryje kartkę z QR |
| Nagrody | 4 lokalizacje × zestaw części samochodziku |

---

## 4. Mapa etapów

```
[START] Etap 1 — Baza (podwórko)
           ↓
        Etap 2 — Pierwsze wyzwanie (blisko bazy)
           ↓
        Etap 3 — Lokalizacja 1 + nagroda + Symbol #1 🔧
           ↓
        Etap 4 — Lokalizacja 2 + nagroda + Symbol #2 🏁
           ↓
        Etap 5 — Lokalizacja 3 + nagroda + Symbol #3 ⚡  ← BEEPER tutaj
           ↓
        Etap 6 — Lokalizacja 4 + nagroda + Symbol #4 🔴
           ↓
 [FINAŁ] Powrót do bazy → Sejf (4 symbole) → QR → Niespodzianka
```

---

## 5. Mechaniki gry

### 5.1 Paliwo (Fuel Gauge)

- Widoczny pasek paliwa w nagłówku każdej strony etapu
- **Start:** 80%
- **Drenaż:** −1% co 45 sekund (JS `setInterval`)
- **Ładowanie przez jazdę:** +15% za każde 60 sekund jazdy z prędkością ≥ 5 km/h (GPS `watchPosition`)
- **Bonus za wyzwanie:** +20% po ukończeniu zadania w danym etapie
- **Paliwo = 0%:** Animacja "PIT STOP! Zrób 10 pajacyków żeby naładować bak!" → przycisk "Naładowano!" → +40%, kontynuuj
- Stan paliwa przechowywany w `localStorage` (persystuje między etapami)

### 5.2 Nawigacja GPS (Waypoint System)

- Używa `navigator.geolocation.watchPosition()` — jeden request uprawnień na początku Etapu 2
- Każdy etap z nawigacją definiuje tablicę `waypoints`:
  ```js
  { lat: 0.0, lng: 0.0, hint: "Skręć przy wielkim kamieniu" }
  ```
- Wyświetlanie: duża strzałka CSS (obrót = `bearing` do celu), dystans w metrach
- `DeviceOrientationEvent` — kompas telefonu orientuje strzałkę względem kierunku jazdy
- Automatyczne przejście do następnego waypointu gdy < 30m od celu
- Podpowiedź tekstowa wyświetlana po dojściu do waypointu (przed przejściem do kolejnego)
- Finalny waypoint: tło strzałki zmienia się na czerwone, pulsuje, komunikat "🔥 JESTEŚ BLISKO!"
- Współrzędne i hinty wpisywane ręcznie po poznaniu lokalizacji

### 5.3 NFC Tagi (Web NFC API)

- API: `NDEFReader` dostępne w Chrome Android na HTTPS
- Każdy tag zawiera URL do strony etapu z tokenem: `?token=abc123`
- Token weryfikowany w JS na stronie — bez tokenu pokazuje "Błąd: Zły tag, szukaj dalej!"
- Skanowanie odbywa się po kliknięciu przycisku "Skanuj tag NFC" (wymagane ze względu na UX)
- Etap 1: tag w bazie (np. pod balonem, na drzwiach)
- Etap 2: tag ukryty, wskazówka tekstowa jak go znaleźć
- Etapy 3–6: tag ukryty w terenie (przy nagrodzie), znaleziony przez nawigację i/lub beeper

### 5.4 Urządzenie Pikające (Beeper)

- Używane TYLKO w Etapie 5 (Lokalizacja 3)
- Ukryte razem z NFC tagiem
- Narracja: *"Tracker Złomka odżył! Słyszysz pikanie? Idź za dźwiękiem!"*
- Dzieci docierają GPS do rejonu, potem szukają chodząc/jeżdżąc — gdy pikanie przyspiesza, są blisko

### 5.5 Sejf (4 Symbole)

- Fizyczny wydruk A4 złożony jak teczka, z 4 pokrętłami/slotami na symbole
- Symbole: 🔧 Klucz | 🏁 Flaga | ⚡ Błyskawica | 🔴 Tłok
- Kolejność kombinacji ustalona przed grą (np. 🔧🏁⚡🔴)
- Każdy etap 3–6 ujawnia JEDEN symbol na ekranie po zakończeniu wyzwania
- Wewnątrz sejfu: kartka z kodem QR prowadzącym do strony z finałową wiadomością/filmem

---

## 6. Szczegóły etapów

### Etap 1 — "Alarm w Radiator Springs" (Baza)

**URL:** `/zadanie/1/`  
**NFC:** tag na bazie → skanuj aby zacząć  
**Typ wyzwania:** Accelerometer  
**Opis:**
- Intro filmik/wiadomość od Zygzaka (wbudowana w HTML, np. GIF lub tekst z animacją)
- Animowany pasek paliwa pojawia się
- Złomek: *"Ej amigo! Chyba coś strąciłem... może kilka pudełek... może cztery. KA-CZAOW! Potrzeba śmiałków!"*
- **Wyzwanie:** "Rozgrzej silnik! Potrząśnij telefonem 20 razy w 10 sekund" — `DeviceMotion` API mierzy wstrząsy
- **Sukces:** Paliwo +30%, tekst *"Silnik gotowy! Teraz szukaj wiadomości od Filka..."*
- **Wskazówka do E2:** Zagadka: *"Złomek zostawił wiadomość tam gdzie kwitnie [opis miejsca z zagadką]"* → Prowadzi do tagu NFC w ogrodzie

### Etap 2 — "Skrzynka od Filka" (Podwórko/blisko bazy)

**URL:** `/zadanie/2/`  
**NFC:** tag ukryty (znaleziony przez zagadkę z E1)  
**Typ wyzwania:** Mini-gra logiczna + GPS Speed  
**Opis:**
- Złomek: *"Flik mi coś nakodował! Czy ty wiesz co to znaczy?"*
- **Wyzwanie 1 — Szyfr Samochodowy:** Na ekranie równanie emoji (np. 🚗+🏎️=? gdzie 🚗=1, 🏎️=2) — odpowiedź to PIN 4-cyfrowy
- **Wyzwanie 2 — Prędkość:** *"Złomek mówi: Jedźcie szybko! 60 sekund jazdy bez zatrzymania!"* — GPS mierzy prędkość ≥ 5 km/h, licznik odlicza
- **Reset:** Jeśli zatrzymają się za długo — "Silnik zgasł! Ruszaj od nowa!" z przyciskiem
- **Sukces:** +20% paliwa + współrzędne (lub opis słowny) do Lokalizacji 1

### Etap 3 — Lokalizacja 1 (Pierwsza paczka 🔧)

**URL:** `/zadanie/3/`  
**NFC:** tag przy nagrodzie, znaleziony przez zagadkę opisową  
**Nawigacja:** GPS waypoint(s) → destination  
**Typ wyzwania:** Mini-gra reakcji  
**Opis:**
- Nawigacja GPS z jednym lub kilkoma waypointami, hinty tekstowe na zakrętach
- NFC tag przy paczce (bez bipera)
- Złomek: *"Zgubiłem tam gdzie coś błyszczy o poranku... albo po południu... w sumie zawsze błyszczy!"*
- **Wyzwanie — Pit Stop Chaos:** Sekwencja kolorowych przycisków pojawia się w kolejności — kliknij je wszystkie zanim znikną (pattern: 5 kliknięć w 8 sekund). Nieograniczone próby z przyciskiem "Spróbuj ponownie".
- **Sukces:** Symbol #1 🔧 pojawia się na ekranie z animacją, paczka #1 fizycznie przy tagu
- Wskazówka do L2

### Etap 4 — Lokalizacja 2 (Druga paczka 🏁)

**URL:** `/zadanie/4/`  
**NFC:** tag przy nagrodzie  
**Nawigacja:** GPS waypoints z podpowiedziami  
**Typ wyzwania:** Memory Match + GPS Speed Burst (15 km/h)  
**Opis:**
- Nawigacja wielopunktowa (kompleksowa trasa) — tu zastosowany multi-waypoint system
- **Wyzwanie 1 — Memory:** 8 kart (4 pary) z postaciami z Aut — musisz zebrać wszystkie pary w < 90 sekund. Reset możliwy.
- **Wyzwanie 2 — Sprint 15 km/h:** *"Złomek mówi: Jedźcie PEŁNĄ PRĘDKOŚCIĄ! Musicie osiągnąć 15 km/h!"* — GPS mierzy prędkość w czasie rzeczywistym; wymagane utrzymanie ≥15 km/h przez 3 sekundy z rzędu; limit 2 minut; duży prędkościomierz na ekranie z czerwoną linią na 15.
- **Sukces:** Symbol #2 🏁 + paczka #2
- Wskazówka do L3

### Etap 5 — Lokalizacja 3 (Trzecia paczka ⚡) — BEEPER

**URL:** `/zadanie/5/`  
**NFC:** tag ukryty razem z BEEPER'em  
**Nawigacja:** GPS → rejon, potem beeper  
**Typ wyzwania:** Accelerometer "Poziomy Ładunek" + Zagadka słowna  
**Opis:**
- GPS prowadzi do rejonu ~50m od celu
- Strona: *"Tracker Złomka odżył! 📡 Słyszysz pikanie? Szukajcie źródła dźwięku!"*
- Gdy znajdą: skanują NFC tag (obok urządzenia)
- **Wyzwanie 1 — Poziomy Transport:** *"Złomek wiezie jajka! Trzymaj telefon poziomo przez 15 sekund jadąc"* — `DeviceMotion` / `DeviceOrientation` mierzy odchylenie; > 20° przez 3 sekundy = fail, reset
- **Wyzwanie 2 — Zagadka Auciarz:** *"Jestem czarny, okrągły, z gumy i bez mnie auto nie ruszy. Jestem...?"* — odpowiedź: OPONA (pole tekstowe, case-insensitive)
- **Sukces:** Symbol #3 ⚡ + paczka #3
- Wskazówka do L4

### Etap 6 — Lokalizacja 4 (Czwarta paczka 🔴) — FINAŁ TRASY

**URL:** `/zadanie/6/`  
**NFC:** tag przy nagrodzie  
**Nawigacja:** GPS waypoints  
**Typ wyzwania:** Mini-gra zręcznościowa + sprint GPS  
**Opis:**
- Napięcie narracyjne: *"To ostatnia paczka Szymona! Złomek mówi że to największa!"*
- **Wyzwanie 1 — Wyścig Zygzaka:** Canvas mini-game — samochód jedzie w prawo, tappy/swipe żeby unikać przeszkód przez 30 sekund (próg: przeżyj 20s). Reset po fail.
- **Wyzwanie 2 — Sprint:** *"Ostatni sprint! GPS mierzy — jedź 100m bez zatrzymania"*
- Licznik na żywo po skanowaniu NFC (5 minut na wykonanie)
- **Sukces:** Symbol #4 🔴 + paczka #4
- Komunikat: *"ZEBRALIŚCIE WSZYSTKO! Złomek jest w szoku! Wróćcie do bazy i otwórzcie SEJF! Kombinacja: [hint przypominający że mają 4 symbole]"*

### Ekran Finalny — Sejf

**URL:** `/final/` (nowa strona)  
**Dostęp:** QR kod w sejfie lub po zakończeniu Etapu 6  
**Opis:**
- Ekran uroczysty z konfetti CSS
- Wiadomość od Zygzaka: *"KA-CZAOW! Jesteście najlepszą ekipą w Radiator Springs! Złomek jest wam bardzo wdzięczny. Teraz złóżcie wszystkie części razem i zobaczcie co zbudowaliście!"*
- Lista zebranych symboli z animacją
- Opcjonalnie: licznik czasu całej przygody

---

## 7. System resetów i failsafe

| Sytuacja | Zachowanie |
|---|---|
| Wyzwanie reaction / game fail | Przycisk "Spróbuj ponownie" — nieograniczone próby |
| Wyzwanie GPS speed fail | Przycisk "Zacznij od nowa" — reset licznika |
| Paliwo = 0% | Modal "PIT STOP" — mini-wyzwanie fizyczne → +40% paliwo |
| NFC nie działa | Przycisk "Wpisz kod ręcznie" — 6-cyfrowy backup code wydrukowany na tagu |
| GPS brak sygnału | Fallback: tekst opisowy zamiast strzałki + ostrzeżenie |
| Zły token NFC | Komunikat "To nie ten tag, szukaj dalej!" |

---

## 8. Architektura techniczna

### Pliki

```
index.html              — Strona startowa
assets/style.css        — Istniejące style (rozszerzone)
assets/game.js          — Wspólny moduł: fuel, GPS, NFC, accelerometer
zadanie/1/index.html    — Etap 1
zadanie/2/index.html    — Etap 2
zadanie/3/index.html    — Etap 3
zadanie/4/index.html    — Etap 4
zadanie/5/index.html    — Etap 5
zadanie/6/index.html    — Etap 6
final/index.html        — Ekran finałowy (po otwarciu sejfu)
print/sejf.html         — Strona do wydrukowania (sejf + instrukcja)
```

### Moduł game.js — API

```js
// Fuel
GameState.getFuel()           // → number 0–100
GameState.addFuel(amount)     // dodaj paliwo
GameState.startDrain()        // startuj drenaż (co 45s)
GameState.startGPSTracking()  // GPS speed → fuel

// Navigation  
Navigation.start(waypoints, onUpdate, onArrival)
Navigation.stop()
// waypoint: { lat, lng, hint, radius? }
// onUpdate(bearing, distance, hint)
// onArrival(waypointIndex)

// NFC
NFC.startScan(expectedToken, onSuccess, onFail)

// Accelerometer
Accelerometer.measureShakes(count, timeLimit, onSuccess, onFail)
Accelerometer.measureLevel(duration, tolerance, onSuccess, onFail)

// Helpers
GameState.addSymbol(symbolId)   // zapisz zdobyty symbol
GameState.getSymbols()          // → array
GameState.markStageComplete(n)  // zapisz ukończony etap
```

### Persystencja

Wszystko w `localStorage`:
- `fuel` — aktualny poziom
- `symbols` — tablica zdobytych symboli (["wrench","flag","lightning","piston"])
- `stagesComplete` — tablica ukończonych etapów
- `startTime` — timestamp startu gry
- `gpsGranted` — czy GPS przyznany

---

## 9. Materiały fizyczne do przygotowania

| Element | Szczegóły |
|---|---|
| NFC tagi × 6+ | Zaprogramowane URL: `https://[host]/zadanie/N/?token=XXX` |
| Wydruk sejfu | `print/sejf.html` — teczka z 4 symbolami do ustawienia |
| Backup kody | Wydrukowane na naklejkach przy tagach (6-cyfrowe kody) |
| Kartka QR w sejfie | QR prowadzący do `/final/` |
| 4 paczki z nagrodami | Ukryte przy tagach w lokalizacjach 3–6 |

---

## 10. Otwarte kwestie (do uzupełnienia)

- [ ] Współrzędne GPS 4 lokalizacji (podaje użytkownik przed imprezą)
- [ ] Waypoints i hinty dla tras wielopunktowych (podaje użytkownik)
- [ ] Treści zagadek tekstowych prowadzących do E2 i E3 (lokalne wskazówki — szablony gotowe w kodzie)
- [ ] Backup kody NFC (generowane losowo przy tworzeniu tagów)
- [x] Zawartość wiadomości finalnej: strona `/final/` opisuje gdzie jest dodatkowy prezent
- [x] Data imprezy: 16 maja 2026
- [x] Strona finalna to `/final/index.html` z opisem ukrycia dodatkowego prezentu (tekst placeholder do uzupełnienia)
