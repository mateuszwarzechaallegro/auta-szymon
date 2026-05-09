# Design: Auta Szymon — GitHub Pages Gra Plenerowa

**Data:** 2026-05-09  
**Repo:** https://github.com/mateuszwarzechaallegro/auta-szymon  
**Status:** Zatwierdzony

---

## Kontekst

Strona internetowa na urodziny Szymona (8 lat). Motyw: bajka Pixar "Cars" (Auta), konkretnie styl "Piston Cup Night Race" — ciemne tło, neonowe akcenty, złoto. Gra plenerowa dla trojga dzieci: Szymon (8 l.), Amelia (11 l.), Ania (8 l.), którzy wspólnie rozwiązują zadania.

---

## Cel

Hostowana na GitHub Pages statyczna strona z:
1. Stroną powitalną (`index.html`) uruchamiającą grę
2. 6 stronami zadań (domyślnie), każda pod unikalnym URL — łatwo rozszerzyć do 8
3. Automatycznym deployem przez GitHub Actions przy każdym push do `main`

---

## Mechanika gry

- Dzieci poruszają się w terenie i szukają QR kodów lub NFC tagów ukrytych w lokacji
- Każdy QR/NFC prowadzi do URL kolejnego zadania (np. `/zadanie/3/`)
- Zadania rozwiązywane są wspólnie przez wszystkich uczestników
- Strony zadań są samodzielne — nie wymagają stanu ani logowania
- Treść poszczególnych zadań zostanie uzupełniona później

---

## Architektura

### Technologia

- **Czysty HTML/CSS/JS** — zero zależności, zero buildu lokalnie
- **GitHub Pages** — hosting (source: GitHub Actions)
- **GitHub Actions** — automatyczny deploy przy push do `main`

### Struktura plików

```
auta-szymon/
├── index.html                 ← Strona powitalna
├── zadanie/
│   ├── 1/index.html           ← Zadanie 1 → URL: /zadanie/1/
│   ├── 2/index.html           ← Zadanie 2 → URL: /zadanie/2/
│   ├── 3/index.html
│   ├── 4/index.html
│   ├── 5/index.html
│   ├── 6/index.html
│   └── (7/, 8/ opcjonalnie)
├── assets/
│   ├── style.css              ← Motyw Piston Cup (wspólny dla wszystkich stron)
│   └── cars-bg.svg            ← Dekoracje (checkered flag, iskry) — opcjonalne
├── docs/
│   └── superpowers/specs/     ← Dokumentacja projektu
└── .github/
    └── workflows/
        └── deploy.yml         ← GitHub Actions deploy workflow
```

### URL-e zadań

| Etap | URL                                                      |
|------|----------------------------------------------------------|
| 1    | `https://mateuszwarzechaallegro.github.io/auta-szymon/zadanie/1/` |
| 2    | `https://mateuszwarzechaallegro.github.io/auta-szymon/zadanie/2/` |
| …    | …                                                        |

---

## Styl wizualny — Piston Cup Night Race

### Paleta kolorów

| Rola           | Wartość     |
|----------------|-------------|
| Tło główne     | `#0f0f1a`   |
| Tło drugorzędne| `#16213e`   |
| Akcent neonowy | `#e94560`   |
| Złoto / trofea | `#FFD700`   |
| Tekst główny   | `#ffffff`   |
| Tekst muted    | `#aaaaaa`   |

### Typografia

- Nagłówki: **Arial Black** / bold, uppercase, letter-spacing
- Tekst: systemowy sans-serif (czytelny dla dzieci 8–11 lat)
- Rozmiary: min. 16px body, 14px minimum dla wskazówek

### Elementy dekoracyjne

- Pasy szachownicy (checkered flag) — górna i dolna krawędź stron
- Neonowy glow na akcentach (`text-shadow`, `box-shadow`)
- Ikony emoji: 🏎️ 🏁 ⚡ 🏆 🔴 🟡 🔵

### Responsywność

- **Mobile-first**: zoptymalizowane pod Galaxy S25 Ultra (412 × 915 px, portrait)
- Viewport meta tag obowiązkowy
- Brak poziomego scrollowania
- Duże strefy klikalne (min. 44px touch target)

---

## Strony

### `index.html` — Strona powitalna

Elementy (od góry):
1. Checkered flag strip (dekoracja)
2. Tytuł: **⚡ AUTA ⚡** (neonowy, czerwony)
3. Podtytuł: "Urodziny Szymona 🏆"
4. Emoji samochodu (🏎️)
5. "PISTON CUP CHALLENGE"
6. Chipsety z imionami: `🔴 Szymon` / `🟡 Amelia` / `🔵 Ania`
7. Ramka misji: "Znajdźcie wszystkie etapy i zdobądźcie Puchar Tłokowy!"
8. Przycisk `⚡ START RACE ⚡` (link do `/zadanie/1/`)
9. Dekoracja dolna (emoji + checkered flag)

### `zadanie/N/index.html` — Strona zadania

Elementy:
1. Checkered flag strip (góra)
2. Header: nazwa strony (lewo) + badge `ETAP N / 6` (prawo; liczba "6" = łączna liczba zadań, edytowalna)
3. Numer zadania (złoty, uppercase)
4. Tytuł zadania (biały, bold)
5. Ramka z treścią zadania (tekst / zdjęcie / zagadka — uzupełniane ręcznie)
6. Separator neonowy
7. Wskazówka: "⚡ Znajdź następny QR kod w terenie ⚡"
8. Checkered flag strip (dół)

Pierwsza wersja plików zadań będzie zawierać placeholder `[treść zadania]` gotowy do edycji.

---

## GitHub Actions — Deploy

Plik: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Wymagana konfiguracja repo (jednorazowa)

W ustawieniach repozytorium na GitHub:  
**Settings → Pages → Source → GitHub Actions**

---

## Co NIE jest w zakresie

- Backend / baza danych / logowanie
- Weryfikacja odpowiedzi (dzieci nie wpisują hasła — to osobna faza)
- Scoreboard / licznik punktów
- Obsługa wielu grup jednocześnie
- Generator QR kodów (wygenerować zewnętrznie, np. qr-code-generator.com)

---

## Kryteria sukcesu

- Strona ładuje się poprawnie na Galaxy S25 Ultra (portrait, Chrome/Samsung Browser)
- Każdy URL zadania (`/zadanie/1/` … `/zadanie/6/`) działa niezależnie
- Push do `main` → automatyczny deploy w < 2 minuty
- Treść zadań można edytować przez zmianę HTML i push do `main`
