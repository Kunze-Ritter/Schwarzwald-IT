# CLAUDE.md

Leitfaden für Claude Code in diesem Repository.

## Was das ist

**Vite-Prototyp** für die neue Website von [schwarzwald-it.com](https://schwarzwald-it.com).
Dieses Repo ist die **Validierungsstufe** – nicht das Produktiv-System. Die fertige Seite
läuft am Ende in **WordPress + [Etch](https://etchwp.com)**.

Reihenfolge: hier Inhalte/Layout/Animationen iterieren → später nach Etch migrieren.
Details: `README.md`, Konzept: `docs/website-konzept.md`.

## Stack

- **Vite 8** + **Vanilla JS** (kein Framework), eigener History-API-SPA-Router (`src/router.js`)
- **motion** (motion.dev) für Scroll-Reveals und Hero-Intro
- **Canvas 2D** für interaktive Visualisierungen – bewusst **ohne** 3D/WebGL
- Token-basiertes CSS (`src/styles/main.css`), ACSS-kompatible Benennung (später Automatic.css)

## Architektur

```
src/
├── data/          Inhalte als Single Source of Truth (→ später WordPress-CPTs/Custom Fields)
├── pages/         eine Render-Funktion pro Route
├── components/    Header, Footer, Hero-Grid, Ops-Console, Zahnrad-Diagramm, CTA, FAQ
├── lib/           Inline-SVG-Icons, Mini-Lifecycle (Loop-/Interval-Cleanup)
├── motion/        zentrale Animations-Init (data-motion-* Attribute)
├── styles/        Token-basiertes CSS
├── router.js      SPA-Router
└── main.js        Einstiegspunkt
```

Inhalte liegen ausschließlich in `src/data/*` und werden von Render-Funktionen konsumiert –
**niemals Texte/Stammdaten in Komponenten hartkodieren**, immer aus `data/` ziehen. Das ist
auch die Grundlage der Etch-Migration.

## Konventionen

- **Sprache:** Deutsch in Code-Kommentaren, UI-Texten und Doku. Vollständige Orthografie
  inkl. Umlaute/ß (kein „ae/oe/ue/ss"-Ersatz).
- **DSGVO / Local-First (hart):** **ausschließlich lokale Ressourcen.** Keine externen Fonts
  (Overused Grotesk & Geist Mono als WOFF2 lokal in `public/fonts/`), keine CDNs, kein Tracking,
  keine Drittanbieter-Embeds, keine einwilligungspflichtigen Cookies. Keine Karte (OSM-Tiles =
  externer Request). `prefers-reduced-motion` respektieren.
- **Design:** „v3"-Entwurf (IT-Ops-Ästhetik). **Cyan = Daten/Live**, **Rot = Marke/Aktion**,
  dunkle Flächen als Kontrast-Anker.
- **Animationen:** über `data-motion-*`-Attribute + zentrale Init in `src/motion/`. Canvas-Loops
  sauber über `src/lib/lifecycle.js` aufräumen (kein Leak bei Routenwechsel).

## Befehle

```bash
npm install
npm run dev       # Dev-Server
npm run build     # Produktions-Build nach dist/
npm run preview   # Build-Vorschau
```

## Deployment

- **Vorschau (Stufe 1):** Cloudflare Pages via GitHub Actions (`.github/workflows/deploy.yml`).
  Push auf `main` → Production-Preview, Push auf `claude/**` → eigene Preview-URL.
  `public/_redirects` = SPA-Fallback. Das ist **nur** die Prototyp-Vorschau.
- **Produktion (Stufe 2):** WordPress + Etch.

### Etch Public API – wichtig

> **Beim Etch-Deploy zuerst [`etch/PLAYBOOK.md`](etch/PLAYBOOK.md) lesen** – das vollständige
> Schritt-für-Schritt-Runbook (Live-Deploy via chrome-devtools, Transfer-Mechanik, alle Fallstricke).

Die [Etch Public API](https://docs.etchwp.com/public-api) ist eine **In-Browser-Scripting-API**
(`window.etch`), die **nur innerhalb des Etch-Builders** läuft. Es gibt **keinen Remote-/HTTP-/
REST-Endpunkt** – man kann **nicht** aus diesem Repo oder aus CI heraus nach Etch deployen.
Das npm-Paket `@digital-gravy/etch-public-api` liefert nur Typen + dünnen Accessor; die Runtime
stellt der Builder bereit. Stand `0.x` (experimentell → Feature-Detection statt Versions-Pinning).

Migrationsweg (Details in `etch/PLAYBOOK.md`):
1. `npm run etch:build` → `etch/dist/import-home.js` (Generator: `etch/components.mjs`,
   `etch/home-blocks.mjs`, `etch/runtime/{hero-grid,ops-console,gear-diagram}.js`, `etch/build.mjs`).
2. Runner **im geöffneten Etch-Builder** ausführen (Live via chrome-devtools: gzip+base64 in
   ~3 KB-Teilen über `window.__parts` übertragen, dann `DecompressionStream` + `eval`).
   Legt Components an, baut die Seite, `etch.saveAsync()`. Verifikation immer auf dem **Frontend**.

Wiederkehrende Strukturen = **Etch-Components mit Props** (`etch.components`), Bindings via
`{props.<key>}`, Instanzen als `etch/component`-Blocks.

Im Builder gelernte Fallstricke (`0.x`):
- `etch/raw-html` strippt `<canvas>`/`<svg>` → diese als `etch/element` (`tag:"canvas"`).
- Component-Block-Klassen NICHT als `class`-Attribut, sondern als **Style-IDs in `styles[]`**
  (pro Klasse leere `etch.styles`-Regel anlegen; CSS aus globalem Stylesheet). Gestylte
  Component-Blocks brauchen zudem `styles: []`.
- Block-`script` läuft erst auf der **publizierten Seite**, nicht im Builder → dort verifizieren.
- Visualisierungen (Hero-Gitter, Ops-Console, Zahnrad-Diagramm) sind Components mit eingebettetem
  `script`. Da Components Markup+Script duplizieren, sind die Skripte **instanz-lokal + idempotent**
  (`init(element)` nur auf eigenem Element, `dataset`-Guard, eigene Closures, IIFE) →
  mehrfach-verwendbar ohne Konflikte. Quelle: `etch/runtime/{hero-grid,ops-console,gear-diagram}.js`.

Wenn am Etch-Deploy gearbeitet wird, **immer zuerst** die aktuelle Doku prüfen — bevorzugt über
**context7** (`/websites/etchwp`) oder `https://docs.etchwp.com/public-api` (API ist `0.x`).
