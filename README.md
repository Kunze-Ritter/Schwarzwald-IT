# Schwarzwald-IT – Website

Vite-Prototyp für die neue Website von [schwarzwald-it.com](https://schwarzwald-it.com)
zur Validierung von Inhalten, Layout und Animationen vor der WordPress/Etch-Migration
(analog [Fewo-Roesslewald](https://github.com/Kunze-Ritter/Fewo-Roesslewald)).

Konzept, Sitemap und Best Practices: [`docs/website-konzept.md`](docs/website-konzept.md)

## Zwei-Stufen-Modell: Prototyp → WordPress + Etch

Dieses Repo ist **nicht** das finale Produktiv-System. Es ist die **Prototyp- und
Validierungsstufe**. Die fertige Website läuft am Ende in **WordPress** und wird dort mit
**[Etch](https://etchwp.com)** (Digital Gravy) gebaut.

| Stufe | Tooling | Zweck |
|---|---|---|
| **1 – Prototyp** (dieses Repo) | Vite + Vanilla JS, Cloudflare Pages | Inhalte, Layout, Animationen, Copy schnell iterieren und mit Stakeholdern abstimmen |
| **2 – Produktion** | WordPress + Etch | Finale Seite, redaktionell pflegbar, CPTs, SEO |

Der Vite-Prototyp ist damit die **Single Source of Truth für Inhalt und Design-Intent**;
die Etch-Migration überführt diese Inhalte in das Etch-Block-Modell (siehe
[Etch-Migration](#etch-migration--deployment)).

## Design

Das Look-and-feel basiert auf dem mit **Claude Design** erstellten „v3"-Entwurf
(IT-Ops-Ästhetik): kühl & technisch, **Cyan = Daten/Live**, **Rot = Marke/Aktion**,
dunkle Flächen als Kontrast-Anker. Schriften: **Overused Grotesk** (Display/Body)
und **Geist Mono** (Tech-Akzente) – lokal gebündelt unter `public/fonts/`.

## Stack

- **Vite 8** + Vanilla JS, eigener History-API-SPA-Router
- **motion** (motion.dev) für Scroll-Reveals und Hero-Intro
- **Canvas 2D** für die interaktiven Visualisierungen (Hero-Gitternetz, Ops-Console,
  System-Diagramm) – bewusst ohne 3D-/WebGL-Dependency
- Token-basiertes CSS (ACSS-kompatible Benennung, später Automatic.css)
- Deployment-Ziel: Cloudflare Pages (`public/_redirects` als SPA-Fallback)

## DSGVO: Local-First-Grundsatz

Diese Website lädt **ausschließlich lokale Ressourcen**:

- Keine externen Fonts – Overused Grotesk & Geist Mono werden als WOFF2 lokal aus `public/fonts/` geladen (kein Google Fonts/CDN)
- Keine CDNs – alle Pakete werden via npm gebündelt
- Kein Tracking, keine Drittanbieter-Embeds, keine einwilligungspflichtigen Cookies
- Bewusst (noch) keine Karte: OSM-Tiles wären ein externer Request – Optionen siehe Konzept
- `prefers-reduced-motion` wird respektiert

## Entwicklung

```bash
npm install
npm run dev       # Dev-Server
npm run build     # Produktions-Build nach dist/
npm run preview   # Build-Vorschau
```

## Struktur

```
src/
├── data/          Inhalte als Single Source of Truth (→ später WordPress-CPTs)
├── pages/         Render-Funktion pro Route
├── components/    Header, Footer, Hero-Grid, Ops-Console, Zahnrad-Diagramm, CTA, FAQ
├── lib/           Inline-SVG-Icons, Mini-Lifecycle (Loop-/Interval-Cleanup)
├── motion/        Zentrale Animations-Init (data-motion-* Attribute)
├── styles/        Token-basiertes CSS
└── router.js      SPA-Router
```

## Vorschau-Deployment (Cloudflare Pages)

> Hinweis: Cloudflare Pages ist **nur die Prototyp-Vorschau** (Stufe 1), nicht das
> Produktiv-Ziel. Die finale Auslieferung erfolgt über WordPress + Etch (siehe unten).

Auto-Deploy via GitHub Actions (`.github/workflows/deploy.yml`):

- Push auf **`main`** → Production-Deploy
- Push auf **`claude/**`-Branches** → Preview-Deploy mit eigener URL

Einmalig im GitHub-Repo unter **Settings → Secrets and variables → Actions** hinterlegen:

| Secret | Woher |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token, Berechtigung **Account · Cloudflare Pages · Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare-Dashboard (rechte Seitenleiste / Account-Übersicht) |

Der Workflow legt das Pages-Projekt `schwarzwald-it` beim ersten Lauf automatisch an;
`public/_redirects` sorgt für den SPA-Fallback.

## Etch-Migration & Deployment

Die finale Seite wird in **WordPress mit Etch** gebaut. Etch stellt dafür eine
**[Public API](https://docs.etchwp.com/public-api)** bereit.

> **Wichtig – kein Remote-Deploy:** Die Etch Public API ist eine **In-Browser-Scripting-API**
> (`window.etch`), die ausschließlich **innerhalb des Etch-Builders** im eingeloggten
> WordPress läuft. Es gibt **keinen** HTTP-/REST-Endpunkt, über den man von außen (z. B. aus
> CI oder diesem Repo) Seiten pushen könnte. Das npm-Paket
> [`@digital-gravy/etch-public-api`](https://www.npmjs.com/package/@digital-gravy/etch-public-api)
> liefert nur TypeScript-Typen plus einen dünnen Accessor – die Runtime kommt vom Builder auf
> der Seite. Der Versionsstand ist `0.x` (experimentell; Feature-Detection statt Versions-Pinning).

### Wie der Inhalt nach Etch kommt

Das Etch-Dokument besteht aus **Blocks** (diskriminierte JSON-Union auf `type`, z. B.
`etch/element`, `etch/text`, `etch/svg`). Der Migrationsweg:

1. **Block-JSON erzeugen** – Ein Generator liest die Inhalte aus `src/data/*` und bildet sie
   auf das Etch-Block-Modell ab (`etch/element` für Container/Tags, `etch/text` für Texte,
   `etch/svg` für Icons …).
2. **Im Builder importieren** – Ein Import-Skript läuft **im Browser im geöffneten Etch-Builder**
   und legt die Blocks an:

   ```js
   import { getEtch, isEtchAvailable } from "@digital-gravy/etch-public-api";

   if (!isEtchAvailable()) throw new Error("Nicht im Etch-Builder");
   const etch = getEtch();

   const rootId = etch.blocks.create({
     type: "etch/element", version: 1, context: {}, children: [],
     tag: "section", attributes: { class: "hero" },
   });
   const headingId = etch.blocks.create({
     type: "etch/element", version: 1, context: {}, children: [],
     tag: "h1", attributes: {},
   }, rootId);
   etch.blocks.create({ type: "etch/text", version: 1, context: {}, children: [],
     text: "IT, die einfach läuft." }, headingId);

   await etch.saveAsync(); // persistiert blocks/styles/loops (UI-identischer Save)
   ```

3. **Persistenz beachten** – `blocks` / `styles` / `loops` werden gepuffert und mit
   `etch.saveAsync()` geschrieben; `stylesheets` / `components` / `fields` haben eigene
   `*Async`-Methoden, die sofort persistieren.

Wiederkehrende Strukturen werden als **Etch-Components mit Props** angelegt (`etch.components`),
nicht als wiederholte Block-Bäume. Im Seitenbaum stehen dafür `etch/component`-Instanzen, die
Werte über `attributes` (= Property-Keys) binden; in den Component-Blocks wird per
`{props.<key>}` referenziert.

Inhalts-Mapping Prototyp → Etch:

| Prototyp | Etch-Ziel |
|---|---|
| `src/data/site.js` (Stammdaten) | Werte direkt in den Blocks (später Custom Fields via `etch.fields`) |
| Karten/Pillars/Quotes/FAQ/… (Wiederholungen) | **Etch-Components mit Props** (`etch.components`) |
| `src/styles/main.css` (Token-CSS) | globales Stylesheet via `etch.stylesheets` |
| Canvas-Visualisierungen (Hero-Gitter, Ops-Console, Zahnräder) | `<canvas>`-Blocks + Frontend-`script` (Runtime) |

> Da der Import zwingend im authentifizierten Browser-Builder läuft, ist er **halb-automatisiert**:
> Generierung passiert hier im Repo, der eigentliche Schreibvorgang per Skript/Console im Etch-Builder.

### Im Builder gelernte Eigenheiten der API (`0.x`)

- **`etch/raw-html` strippt `<canvas>` und `<svg>`** (Sanitizer). Diese Elemente daher als
  `etch/element` (`tag: "canvas"` …) aufbauen, nicht als raw-html. Der Ops-Chart läuft deshalb
  auf `<canvas>` statt SVG.
- **Klassen ≠ `class`-Attribut.** `etch.blocks.create()` übernimmt `attributes.class` und legt
  automatisch eine Style-Regel an. Bei **Component-Blocks** (`etch.components.updateAsync({blocks})`)
  wird `class` jedoch verworfen – Klassen müssen als **Style-IDs im `styles[]`-Array** stehen.
  Der Generator-Runner erzeugt dafür pro Klasse eine (leere) `etch.styles`-Regel und schreibt
  deren ID ins `styles[]`; die eigentliche CSS-Definition liefert das globale Stylesheet.
- **Component-Blocks brauchen `styles: []`** (leeres Array) auf gestylten Block-Typen, sonst
  schlägt die Block-JSON-Validierung fehl.
- **Frontend-`script`** an einem Block läuft **nicht im Builder**, sondern erst auf der
  veröffentlichten Seite. Verifikation daher immer auf dem Frontend.
- **Components duplizieren Markup *und* `script`.** Die Visualisierungen (Hero-Gitter,
  Ops-Console, Zahnrad-Diagramm) sind Components mit eingebettetem `script` am Wurzel-Block.
  Damit mehrere Instanzen sich nicht stören, sind die Skripte **instanz-lokal + idempotent**:
  jede `init(element)` arbeitet nur auf *ihrem* Element (alle Queries `root.querySelector`),
  ein `dataset`-Guard verhindert Doppel-Init, jede Instanz hat eigene Closures (RAF/Observer/
  Intervalle), und alles steckt in einer IIFE. Egal ob Etch das Script 1× oder N× ausführt.

### Generator im Repo (`etch/`)

```bash
npm run etch:build
```

erzeugt nach `etch/dist/` (git-ignoriert):

| Datei | Zweck |
|---|---|
| `components.json` | Etch-Component-Definitionen (Name, Key, Properties, Blocks) |
| `home-blocks.json` | Seitenbaum (Wiederholungen als `{__comp}`-Platzhalter) |
| `import-home.js` | Browser-Runner: provisioniert Components, baut die Seite, speichert |

So importierst du die Startseite:

1. In WordPress die Zielseite im **Etch-Builder** öffnen (leere Seite empfohlen).
2. Browser-DevTools → Console öffnen.
3. Inhalt von `etch/dist/import-home.js` einfügen und ausführen.
4. Konsole bestätigt `[Etch] Fertig: N Components, M Blocks, gespeichert.`

Der Runner: (1) Klassen→Style-IDs auflösen, (2) Components per `key` anlegen/aktualisieren,
(3) `{__comp}`-Platzhalter → `etch/component` mit aufgelöster `componentId`, (4) alte Blocks
löschen, Seitenbaum anlegen, `etch.saveAsync()`.

Dateien:

- `etch/blocks.mjs` – Block-Helfer (`el`, `text`, `comp`, `materialize`, …)
- `etch/components.mjs` – Component-Definitionen: Inhalts-Components mit Props + die drei
  Visualisierungs-Components (HeroGrid, OpsConsole, GearDiagram) mit eingebettetem `script`
- `etch/home-blocks.mjs` – Seitenbaum der Startseite (referenziert alles als `comp()`-Instanzen)
- `etch/runtime/{hero-grid,ops-console,gear-diagram}.js` – je eine eigenständige, instanz-lokale
  + idempotente Frontend-Runtime (in die jeweilige Viz-Component eingebettet)
- `etch/build.mjs` – Build-Step (`npm run etch:build`)

## Das System-Diagramm – „Drei Zahnräder"

`src/components/system-diagram-canvas.js` visualisiert die drei Fachbereiche als
**ineinandergreifende Zahnräder** (Metapher aus der PPT „Vorstellung Schwarzwald-IT"):
IT-Sicherheit ist das zentrale Zahnrad und greift in Infrastruktur (Fundament) und
Computing (Arbeitsalltag). Die Räder kämmen physikalisch korrekt (1:1, gegenläufig)
und drehen gemeinsam; an den Kämmpunkten leuchtet ein cyaner Funke. Hover/Tap auf ein
Rad oder die zugehörige Karte hebt den Bereich rot hervor und führt zur Detailseite.
`prefers-reduced-motion` wird respektiert (statische, gekämmte Darstellung).
