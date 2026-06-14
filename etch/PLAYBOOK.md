# Etch-Deploy-Playbook (für Claude / Agenten)

Schritt-für-Schritt-Runbook, um Seiten dieses Repos nach **WordPress + Etch** zu deployen.
Wenn du am Etch-Deploy arbeitest: **dieses Dokument zuerst lesen**, dann handeln.

> Kontext: Etch Public API ist eine **In-Browser-Scripting-API** (`window.etch`), nur im
> geöffneten Etch-Builder. Kein Remote-/REST-Deploy. Stand `0.x` (instabil → Feature-Detection).

---

## 0. Doku zuerst

Vor jeder Etch-Arbeit aktuelle Doku prüfen — bevorzugt **context7** (`resolve-library-id` →
`query-docs` mit `/websites/etchwp`), sonst <https://docs.etchwp.com/public-api>. Die API ist
`0.x` und ändert sich; nicht aus dem Gedächtnis arbeiten.

`window.etch`-Namespaces: `blocks, styles, stylesheets, components, loops, navigation, fields,
ui, history` + `saveAsync()`. **Ein eigenes „Scripts"-Namespace gibt es nicht** — JS läuft
ausschließlich über das `script`-Feld eines Blocks (`EtchBlockScript { code }`).

---

## 1. Generator bauen (im Repo)

```bash
npm run etch:build
```

Erzeugt nach `etch/dist/` (git-ignoriert):
- `components.json` – Component-Defs (Name, Key, Properties, Blocks)
- `home-blocks.json` – Seitenbaum (Wiederholungen + Viz als `{__comp}`-Platzhalter)
- `import-home.js` – **der Browser-Runner** (provisioniert Components, baut die Seite, speichert)

Quell-Dateien:
- `etch/blocks.mjs` – `el`, `text`, `elText`, `comp`, `svg`, `raw`, `materialize`
- `etch/components.mjs` – Inhalts-Components (Props) **und** Viz-Components (HeroGrid/OpsConsole/GearDiagram) mit eingebettetem `script`
- `etch/home-blocks.mjs` – Seitenbaum (alles als `comp()`-Instanzen)
- `etch/runtime/{hero-grid,ops-console,gear-diagram}.js` – instanz-lokale Frontend-Skripte
- `etch/build.mjs` – Build + Runner-Erzeugung

---

## 2. Live-Deploy via chrome-devtools MCP

### Voraussetzungen (macht der User)
1. Im gesteuerten Browser bei WordPress **einloggen**.
2. Zielseite im **Etch-Builder** öffnen: `https://<site>/?etch=magic&post_id=<id>`
   (Test-Instanz: `schwarzwald-it.1wp.site`, Startseite `post_id=9`).

### Wichtige Tab-Regel
`window.etch` existiert **nur im Builder-Tab**, NICHT im Frontend-Tab. Vor jedem Schreibzugriff
mit `list_pages` + `select_page` den **Builder-Tab** wählen und `!!window.etch` prüfen.

### Code-Transfer (der Runner ist zu groß für einen `evaluate_script`-Aufruf)
Ein einzelner `evaluate_script` mit ~14 KB+ String wird **abgeschnitten** (Parse-Fehler).
Deshalb gestückelt übertragen:

```bash
gzip -9 -c etch/dist/import-home.js | base64 -w0 > etch/dist/import-home.gz.b64
cd etch/dist && rm -f part_* && split -b 3000 -d import-home.gz.b64 part_   # → ~6 Teile
```

Dann pro Teil ein `evaluate_script` auf dem **Builder-Tab**:
- Teil 0: `window.__parts = ["<teil0>"]; return window.__parts.length;`  (setzt das Array)
- Teil 1..n: `window.__parts[N] = "<teilN>"; return window.__parts.length;`  (Slots, parallel ok)

### Ausführen + verifizieren (ein `evaluate_script`)
```js
const bytes = Uint8Array.from(atob(window.__parts.join("")), c => c.charCodeAt(0));
const code = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
const run = (0, eval)(code); if (run && run.then) await run;   // Runner: Components + Seite + saveAsync
delete window.__parts;
return { components: etch.components.list().map(c => c.key), topLevel: etch.blocks.getTree().length };
```

### Frontend-Verifikation (Pflicht!)
Block-Skripte laufen **nur auf der publizierten Seite**, nicht im Builder. Also:
1. `select_page` → Frontend-Tab, `navigate_page` auf `https://<site>/` (nicht die Builder-URL).
2. DOM prüfen: Component-Counts (`.card`, `.gear-card`, …), Canvas-Größen
   (`.hero__grid`.width > 0, `.gears__canvas`.width > 0), `dataset`-Guards = "1",
   `[data-tickets]` tickt. Screenshot.

---

## 3. Harte Regeln / Fallstricke (alle im Builder verifiziert)

1. **`etch/raw-html` strippt `<canvas>` und `<svg>`** (Sanitizer). → Canvas/SVG als
   `etch/element` (`tag:"canvas"`) bauen. Der Ops-Chart läuft deshalb auf `<canvas>` statt SVG.

2. **Klassen ≠ `class`-Attribut bei Components.** `etch.blocks.create()` übernimmt
   `attributes.class` und legt automatisch eine Style-Regel an. `etch.components.updateAsync({blocks})`
   **verwirft `class`** → Klassen müssen als **Style-IDs in `styles[]`** stehen. Der Runner legt
   pro Klasse eine leere `etch.styles.create(".x","")`-Regel an und schreibt deren ID ins `styles[]`;
   die echte CSS-Definition kommt aus dem **globalen Stylesheet**.

3. **Gestylte Block-Typen brauchen `styles: []`** (leeres Array) in Component-Blocks, sonst
   schlägt die Block-JSON-Validierung fehl (`materialize` setzt das).

4. **Block-`script` läuft nur auf der publizierten Seite**, nicht im Builder.

5. **Components duplizieren Markup *und* `script`.** Viz-Scripts daher **instanz-lokal + idempotent**:
   `init(element)` nur auf eigenem Element (Queries `root.querySelector`), `dataset`-Guard gegen
   Doppel-Init, eigene Closures (RAF/Observer/Intervalle), IIFE-Kapselung.

6. **Persistenz:** `blocks`/`styles`/`loops` puffern → `etch.saveAsync()`. `stylesheets`/
   `components`/`fields` haben eigene `*Async`-Methoden und persistieren sofort.

7. **Transfer-Mechanik:** ein einzelner `evaluate_script` > ~14 KB wird abgeschnitten → splitten.
   `__parts` immer auf dem **Builder-Tab** ablegen (nicht Frontend).

---

## 4. Architektur-Konventionen

- **Wiederkehrende Strukturen → Etch-Components mit Props** (`etch.components`), Bindings
  `{props.<key>}` in Text und Attributen, Instanzen als `etch/component` (componentId + attributes).
- **Visualisierungen → eigene Components** mit eingebettetem `script` (self-contained).
- **CSS → ein globales Stylesheet** (`etch.stylesheets.createAsync`/`updateAsync`), Inhalt = `src/styles/main.css`.
  Transfer wie der Runner (gzip+base64+split); Integrität über UTF-8-Bytelänge prüfen
  (`new TextEncoder().encode(css).length`), nicht `css.length` (Umlaute!).
- **Inhalt bleibt Single Source of Truth in `src/data/*`** — Generator mappt nur.

---

## 5. Neue Seite migrieren (Kurz-Rezept)

1. `etch/<seite>-blocks.mjs` analog zu `home-blocks.mjs` (nutzt vorhandene Components via `comp()`).
2. Falls neue Wiederholungen: Component in `etch/components.mjs` ergänzen (Props + `{props.*}`).
3. `etch/build.mjs` um die Seite erweitern (eigener Runner / Output).
4. Deploy wie Abschnitt 2; Components sind idempotent (per `key`), nur die Seitenblöcke werden ersetzt.
5. Auf dem **Frontend** verifizieren.

---

## 6. Verifikations-Checkliste

- [ ] `etch.components.list()` enthält alle erwarteten Keys
- [ ] `etch.blocks.getTree().length` = erwartete Top-Level-Sections
- [ ] Frontend: Component-Counts korrekt, kein `{props.` im DOM
- [ ] Frontend: Canvas-Größen > 0, `dataset`-Guards gesetzt, Live-Werte ticken
- [ ] Screenshot vom Frontend
