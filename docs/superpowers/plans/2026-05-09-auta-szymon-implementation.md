# Auta Szymon — GitHub Pages Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a static GitHub Pages site for Szymon's birthday outdoor scavenger hunt game, themed after Pixar's "Cars" (Piston Cup Night Race style), with 6 task pages and automatic GitHub Actions deployment.

**Architecture:** Plain HTML/CSS with a single shared stylesheet. Each page (`index.html` and `zadanie/N/index.html`) imports `../../assets/style.css` (or `../assets/style.css` for index). No JavaScript framework — vanilla HTML only. GitHub Actions deploys the root directory to GitHub Pages on every push to `main`.

**Tech Stack:** HTML5, CSS3, GitHub Actions (`actions/deploy-pages@v4`), GitHub Pages

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `.gitignore` | Modify | Add `.superpowers/` entry |
| `assets/style.css` | Create | Full Piston Cup theme — colors, typography, shared components |
| `index.html` | Create | Welcome/landing page — names, mission, START button |
| `zadanie/1/index.html` | Create | Task 1 page (template) |
| `zadanie/2/index.html` | Create | Task 2 page |
| `zadanie/3/index.html` | Create | Task 3 page |
| `zadanie/4/index.html` | Create | Task 4 page |
| `zadanie/5/index.html` | Create | Task 5 page |
| `zadanie/6/index.html` | Create | Task 6 page (last — no "next" hint) |
| `.github/workflows/deploy.yml` | Create | Auto-deploy to GitHub Pages on push to `main` |

---

## Task 1: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `.superpowers/` to .gitignore**

Append to the end of `.gitignore`:

```
# Superpowers brainstorm session files
.superpowers/
```

- [ ] **Step 2: Verify .gitignore is correct**

Run:
```bash
cat .gitignore
```
Expected: file ends with `.superpowers/` entry.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorm session files"
```

---

## Task 2: Shared CSS — Piston Cup Night Race Theme

**Files:**
- Create: `assets/style.css`

- [ ] **Step 1: Create assets directory and style.css**

Create `assets/style.css` with full content:

```css
/* ============================================================
   AUTA SZYMON — Piston Cup Night Race Theme
   Mobile-first: Galaxy S25 Ultra (412×915px portrait)
   ============================================================ */

/* --- Reset & base --- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

body {
  background: linear-gradient(180deg, #0f0f1a 0%, #16213e 60%, #0f3460 100%);
  background-attachment: fixed;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  color: #ffffff;
  font-size: 18px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}

/* --- CSS Variables --- */
:root {
  --color-bg:        #0f0f1a;
  --color-bg2:       #16213e;
  --color-neon:      #e94560;
  --color-gold:      #FFD700;
  --color-white:     #ffffff;
  --color-muted:     #aaaaaa;
  --color-border:    rgba(233, 69, 96, 0.3);
  --font-heading:    'Arial Black', 'Arial Bold', Arial, sans-serif;
  --touch-target:    48px;
}

/* --- Checkered flag strip --- */
.flag-strip {
  width: 100%;
  height: 16px;
  background: repeating-linear-gradient(
    90deg,
    #ffffff 0px, #ffffff 12px,
    #000000 12px, #000000 24px
  );
  flex-shrink: 0;
}

/* --- Page wrapper --- */
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* --- Neon heading --- */
.neon-title {
  font-family: var(--font-heading);
  font-size: 2.6rem;
  font-weight: 900;
  color: var(--color-neon);
  text-shadow:
    0 0 10px var(--color-neon),
    0 0 30px rgba(233, 69, 96, 0.4);
  letter-spacing: 4px;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.1;
  margin: 20px 0 6px;
}

/* --- Gold subtitle --- */
.gold-text {
  font-size: 0.85rem;
  color: var(--color-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

/* --- Big center emoji --- */
.hero-emoji {
  font-size: 4rem;
  margin: 12px 0 4px;
  text-align: center;
  line-height: 1;
}

/* --- Racer chips (name badges) --- */
.racers {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 16px 14px;
}

.racer-chip {
  background: rgba(233, 69, 96, 0.12);
  border: 1.5px solid var(--color-neon);
  border-radius: 24px;
  padding: 6px 16px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
  min-height: var(--touch-target);
  display: flex;
  align-items: center;
}

/* --- Mission box --- */
.mission-box {
  background: rgba(255, 215, 0, 0.06);
  border: 2px solid var(--color-gold);
  border-radius: 12px;
  margin: 0 16px;
  padding: 14px 16px;
  text-align: center;
  width: calc(100% - 32px);
}

.mission-label {
  font-size: 0.7rem;
  color: var(--color-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 6px;
  font-weight: 700;
}

.mission-text {
  font-size: 1rem;
  color: #eeeeee;
  line-height: 1.5;
}

/* --- Primary button (START) --- */
.btn-primary {
  display: block;
  margin: 16px 16px 0;
  width: calc(100% - 32px);
  background: linear-gradient(135deg, #e94560, #c0392b);
  border: none;
  border-radius: 12px;
  color: var(--color-white);
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 900;
  padding: 14px;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
  min-height: var(--touch-target);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary:active {
  opacity: 0.85;
  transform: scale(0.98);
}

/* --- Decorative bottom area --- */
.bottom-deco {
  margin-top: auto;
  padding: 12px 0 8px;
  text-align: center;
  font-size: 1.8rem;
  opacity: 0.7;
}

/* ============================================================
   TASK PAGE specific styles
   ============================================================ */

/* --- Task page header bar --- */
.task-header {
  width: 100%;
  background: rgba(15, 15, 26, 0.95);
  border-bottom: 2px solid var(--color-neon);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.task-header .site-name {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  color: var(--color-neon);
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.task-badge {
  background: var(--color-neon);
  color: var(--color-white);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* --- Task body --- */
.task-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  width: 100%;
}

/* --- Task step label --- */
.task-step-label {
  font-size: 0.75rem;
  color: var(--color-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
  font-weight: 700;
  text-align: center;
}

/* --- Task title --- */
.task-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--color-white);
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(233, 69, 96, 0.3);
  line-height: 1.2;
}

/* --- Task content card --- */
.task-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid var(--color-border);
  border-radius: 14px;
  padding: 20px 16px;
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
}

.task-card-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  line-height: 1;
}

.task-card-text {
  font-size: 1rem;
  color: #cccccc;
  line-height: 1.6;
}

/* --- Neon divider --- */
.neon-divider {
  width: 60%;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, var(--color-neon), transparent);
  margin: 4px auto 16px;
}

/* --- Hint text --- */
.task-hint {
  font-size: 0.85rem;
  color: var(--color-gold);
  text-align: center;
  letter-spacing: 1px;
  padding: 0 16px;
  line-height: 1.5;
}
```

- [ ] **Step 2: Verify file was created**

```bash
ls -la assets/style.css
```
Expected: file exists, non-zero size.

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "feat: add Piston Cup Night Race shared CSS theme"
```

---

## Task 3: index.html — Landing Page

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f0f1a">
  <title>Auta — Urodziny Szymona ⚡</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <div class="page">
    <div class="flag-strip"></div>

    <div class="neon-title">⚡ AUTA ⚡</div>
    <div class="gold-text">Urodziny Szymona 🏆</div>

    <div class="hero-emoji">🏎️</div>
    <div class="gold-text" style="letter-spacing: 1px; font-size: 0.75rem;">PISTON CUP CHALLENGE</div>

    <div class="racers">
      <div class="racer-chip">🔴 Szymon</div>
      <div class="racer-chip">🟡 Amelia</div>
      <div class="racer-chip">🔵 Ania</div>
    </div>

    <div class="mission-box">
      <div class="mission-label">🏁 Wasza misja</div>
      <div class="mission-text">
        Znajdźcie wszystkie etapy i zdobądźcie Puchar Tłokowy!
      </div>
    </div>

    <a class="btn-primary" href="zadanie/1/">⚡ START RACE ⚡</a>

    <div class="bottom-deco">🚗💨<br><span style="font-size:1rem;">✨ ⚡ ✨</span></div>

    <div class="flag-strip" style="margin-top: 8px;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify visually in browser**

Open `index.html` in Chrome. Then open DevTools → Toggle device toolbar → set to **Galaxy S25 Ultra** (or 412×915). Verify:
- Dark gradient background fills the screen
- "⚡ AUTA ⚡" title glows red
- Three racer chips visible (Szymon / Amelia / Ania)
- Gold mission box visible
- Red START RACE button is large and tappable
- Checkered flag strips at top and bottom
- No horizontal scroll

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add landing page (index.html) with Piston Cup theme"
```

---

## Task 4: Task Page Template — Zadanie 1

**Files:**
- Create: `zadanie/1/index.html`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p zadanie/1
```

Create `zadanie/1/index.html`:

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

    <div class="task-body">
      <div class="task-step-label">🏁 Zadanie pierwsze</div>
      <div class="task-title"><!-- Tytuł zadania --></div>

      <div class="task-card">
        <div class="task-card-icon">🔍</div>
        <div class="task-card-text">
          <!-- Treść zadania / zagadki --><br>
          <em style="color:#666; font-size:0.85em;">[uzupełnij treść zadania tutaj]</em>
        </div>
      </div>

      <div class="neon-divider"></div>
      <div class="task-hint">⚡ Znajdź następny QR kod w terenie ⚡</div>
    </div>

    <div class="flag-strip" style="margin-top: auto;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify visually in browser**

Open `zadanie/1/index.html` in Chrome, DevTools → Galaxy S25 Ultra (412×915). Verify:
- Header bar shows "⚡ Auta — Szymon" (left) and "ETAP 1 / 6" badge (right, red pill)
- Gold step label "🏁 ZADANIE PIERWSZE" visible
- Task card with icon and placeholder text visible
- Neon red divider line below card
- Gold hint text "⚡ Znajdź następny QR kod w terenie ⚡" at bottom
- Checkered flag strips at top and bottom
- CSS loaded correctly (dark background, not white)

- [ ] **Step 3: Commit**

```bash
git add zadanie/
git commit -m "feat: add task page template (zadanie/1)"
```

---

## Task 5: Task Pages 2–5

**Files:**
- Create: `zadanie/2/index.html`, `zadanie/3/index.html`, `zadanie/4/index.html`, `zadanie/5/index.html`

- [ ] **Step 1: Create directories**

```bash
mkdir -p zadanie/2 zadanie/3 zadanie/4 zadanie/5
```

- [ ] **Step 2: Create zadanie/2/index.html**

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
    <div class="task-body">
      <div class="task-step-label">🏁 Zadanie drugie</div>
      <div class="task-title"><!-- Tytuł zadania --></div>
      <div class="task-card">
        <div class="task-card-icon">🔍</div>
        <div class="task-card-text">
          <em style="color:#666; font-size:0.85em;">[uzupełnij treść zadania tutaj]</em>
        </div>
      </div>
      <div class="neon-divider"></div>
      <div class="task-hint">⚡ Znajdź następny QR kod w terenie ⚡</div>
    </div>
    <div class="flag-strip" style="margin-top: auto;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 3: Create zadanie/3/index.html**

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
    <div class="task-body">
      <div class="task-step-label">🏁 Zadanie trzecie</div>
      <div class="task-title"><!-- Tytuł zadania --></div>
      <div class="task-card">
        <div class="task-card-icon">🔍</div>
        <div class="task-card-text">
          <em style="color:#666; font-size:0.85em;">[uzupełnij treść zadania tutaj]</em>
        </div>
      </div>
      <div class="neon-divider"></div>
      <div class="task-hint">⚡ Znajdź następny QR kod w terenie ⚡</div>
    </div>
    <div class="flag-strip" style="margin-top: auto;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 4: Create zadanie/4/index.html**

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
    <div class="task-body">
      <div class="task-step-label">🏁 Zadanie czwarte</div>
      <div class="task-title"><!-- Tytuł zadania --></div>
      <div class="task-card">
        <div class="task-card-icon">🔍</div>
        <div class="task-card-text">
          <em style="color:#666; font-size:0.85em;">[uzupełnij treść zadania tutaj]</em>
        </div>
      </div>
      <div class="neon-divider"></div>
      <div class="task-hint">⚡ Znajdź następny QR kod w terenie ⚡</div>
    </div>
    <div class="flag-strip" style="margin-top: auto;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 5: Create zadanie/5/index.html**

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
    <div class="task-body">
      <div class="task-step-label">🏁 Zadanie piąte</div>
      <div class="task-title"><!-- Tytuł zadania --></div>
      <div class="task-card">
        <div class="task-card-icon">🔍</div>
        <div class="task-card-text">
          <em style="color:#666; font-size:0.85em;">[uzupełnij treść zadania tutaj]</em>
        </div>
      </div>
      <div class="neon-divider"></div>
      <div class="task-hint">⚡ Znajdź następny QR kod w terenie ⚡</div>
    </div>
    <div class="flag-strip" style="margin-top: auto;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add zadanie/
git commit -m "feat: add task pages 2-5 with placeholder content"
```

---

## Task 6: Final Task Page — Zadanie 6 (Last Stage)

**Files:**
- Create: `zadanie/6/index.html`

The last task page has a victory message instead of the "find next QR code" hint.

- [ ] **Step 1: Create directory**

```bash
mkdir -p zadanie/6
```

- [ ] **Step 2: Create zadanie/6/index.html**

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
    <div class="task-header">
      <span class="site-name">⚡ Auta — Szymon</span>
      <span class="task-badge">ETAP 6 / 6</span>
    </div>
    <div class="task-body">
      <div class="task-step-label">🏁 Zadanie ostatnie</div>
      <div class="task-title"><!-- Tytuł zadania --></div>
      <div class="task-card">
        <div class="task-card-icon">🔍</div>
        <div class="task-card-text">
          <em style="color:#666; font-size:0.85em;">[uzupełnij treść zadania tutaj]</em>
        </div>
      </div>
      <div class="neon-divider"></div>
      <div class="task-hint" style="color: #FFD700; font-size: 1rem; font-weight: 700;">
        🏆 GRATULACJE! 🏆<br>
        <span style="font-size: 0.85rem; font-weight: 400;">Zdobyliście Puchar Tłokowy!</span>
      </div>
      <div style="font-size: 3rem; margin-top: 16px; text-align: center;">🏆🎉🏎️</div>
    </div>
    <div class="flag-strip" style="margin-top: auto;"></div>
  </div>
</body>
</html>
```

- [ ] **Step 3: Verify in browser**

Open `zadanie/6/index.html`, Galaxy S25 Ultra viewport. Verify:
- Badge shows "ETAP 6 / 6"
- No "Znajdź następny QR kod" text — replaced by gold "GRATULACJE!" 
- Trophy + confetti emoji visible

- [ ] **Step 4: Commit**

```bash
git add zadanie/6/
git commit -m "feat: add final task page (zadanie/6) with victory message"
```

---

## Task 7: GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create .github/workflows/deploy.yml**

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
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for automatic GitHub Pages deploy"
git push origin main
```

- [ ] **Step 4: Enable GitHub Pages in repo settings**

In the GitHub repository:
1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

- [ ] **Step 5: Verify GitHub Actions ran successfully**

1. Go to the repository on GitHub
2. Click **Actions** tab
3. Verify the "Deploy to GitHub Pages" workflow shows a green checkmark
4. Click the workflow run → copy the deployed URL from the `deploy` step output
5. Open the URL — you should see the Auta Szymon landing page

Expected URL format: `https://mateuszwarzechaallegro.github.io/auta-szymon/`

---

## Self-Review Checklist

- [x] `.gitignore` updated with `.superpowers/`
- [x] `assets/style.css` covers all components used in HTML files (`.flag-strip`, `.page`, `.neon-title`, `.gold-text`, `.hero-emoji`, `.racers`, `.racer-chip`, `.mission-box`, `.btn-primary`, `.bottom-deco`, `.task-header`, `.site-name`, `.task-badge`, `.task-body`, `.task-step-label`, `.task-title`, `.task-card`, `.task-card-icon`, `.task-card-text`, `.neon-divider`, `.task-hint`)
- [x] `index.html` links CSS as `assets/style.css` (root level)
- [x] All `zadanie/N/index.html` link CSS as `../../assets/style.css` (two levels deep)
- [x] Task 6 has victory message, not QR hint
- [x] Tasks 1–5 all have QR hint
- [x] GitHub Actions workflow uses official actions only, no external dependencies
- [x] No TBD or TODO in plan steps
- [x] Each task has a commit step
