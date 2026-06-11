# Schwarzwald-IT – Website

Vite-Prototyp für die neue Website von [schwarzwald-it.com](https://schwarzwald-it.com)
zur Validierung von Inhalten, Layout und Animationen vor der WordPress/Etch-Migration
(analog [Fewo-Roesslewald](https://github.com/Kunze-Ritter/Fewo-Roesslewald)).

Konzept, Sitemap und Best Practices: [`docs/website-konzept.md`](docs/website-konzept.md)

## Stack

- **Vite 8** + Vanilla JS, eigener History-API-SPA-Router
- **motion** (motion.dev) für Scroll-Reveals und das System-Diagramm
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

## Das System-Diagramm

`src/components/system-diagram.js` visualisiert die drei ineinandergreifenden
Fachbereiche als Netzwerk-Topologie: Infrastruktur (Fundament) und Computing
(Arbeitsalltag) sind verbunden, IT-Sicherheit legt sich als Schutzring um das
System. Nach der Aufbau-Animation fließen Datenimpulse über die Verbindungen;
Hover/Tap auf einen Node zeigt den zugehörigen Text.
