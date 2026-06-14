# Schwarzwald-IT – Website

Vite-Prototyp für die neue Website von [schwarzwald-it.com](https://schwarzwald-it.com)
zur Validierung von Inhalten, Layout und Animationen vor der WordPress/Etch-Migration
(analog [Fewo-Roesslewald](https://github.com/Kunze-Ritter/Fewo-Roesslewald)).

Konzept, Sitemap und Best Practices: [`docs/website-konzept.md`](docs/website-konzept.md)

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

- Keine externen Fonts (System-Font-Stack; später optional selbst gehostete WOFF2 unter `public/fonts/`)
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
├── components/    Header, Footer, System-Diagramm, CTA, FAQ
├── motion/        Zentrale Animations-Init (data-motion-* Attribute)
├── styles/        Token-basiertes CSS
└── router.js      SPA-Router
```

## Das System-Diagramm – „Drei Zahnräder"

`src/components/system-diagram-canvas.js` visualisiert die drei Fachbereiche als
**ineinandergreifende Zahnräder** (Metapher aus der PPT „Vorstellung Schwarzwald-IT"):
IT-Sicherheit ist das zentrale Zahnrad und greift in Infrastruktur (Fundament) und
Computing (Arbeitsalltag). Die Räder kämmen physikalisch korrekt (1:1, gegenläufig)
und drehen gemeinsam; an den Kämmpunkten leuchtet ein cyaner Funke. Hover/Tap auf ein
Rad oder die zugehörige Karte hebt den Bereich rot hervor und führt zur Detailseite.
`prefers-reduced-motion` wird respektiert (statische, gekämmte Darstellung).
