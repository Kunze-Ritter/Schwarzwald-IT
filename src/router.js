// Leichtgewichtiger SPA-Router auf Basis der History-API (analog Fewo-Roesslewald).
// Routen liefern { title, description, html, mount? } – mount() läuft nach dem Rendern.
import { home } from "./pages/home.js";
import { leistungen, leistungDetail } from "./pages/leistungen.js";
import { ueberUns } from "./pages/ueber-uns.js";
import { referenzenPage } from "./pages/referenzen.js";
import { ratgeber } from "./pages/ratgeber.js";
import { kontakt } from "./pages/kontakt.js";
import { support } from "./pages/support.js";
import { impressum, datenschutz } from "./pages/legal.js";
import { notFound } from "./pages/not-found.js";
import { initMotion } from "./motion/index.js";
import { runCleanups } from "./lib/lifecycle.js";
import { site } from "./data/site.js";

const routes = [
  { pattern: /^\/$/, page: home },
  { pattern: /^\/leistungen\/$/, page: leistungen },
  { pattern: /^\/leistungen\/([a-z0-9-]+)\/$/, page: leistungDetail },
  { pattern: /^\/ueber-uns\/$/, page: ueberUns },
  { pattern: /^\/referenzen\/$/, page: referenzenPage },
  { pattern: /^\/ratgeber\/$/, page: ratgeber },
  { pattern: /^\/kontakt\/$/, page: kontakt },
  { pattern: /^\/support\/$/, page: support },
  { pattern: /^\/impressum\/$/, page: impressum },
  { pattern: /^\/datenschutz\/$/, page: datenschutz },
];

function normalize(pathname) {
  let p = pathname;
  if (!p.endsWith("/")) p += "/";
  return p;
}

function resolve(pathname) {
  const path = normalize(pathname);
  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) return route.page(...match.slice(1));
  }
  return notFound();
}

function setMeta(view) {
  document.title = view.title
    ? `${view.title} | ${site.name}`
    : `${site.name} – IT-Systemhaus für den Mittelstand in Südbaden`;

  let desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", view.description ?? site.subclaim);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", site.baseUrl + normalize(location.pathname));

  // Route-spezifisches JSON-LD austauschen
  document.querySelectorAll('script[data-route-jsonld]').forEach((s) => s.remove());
  if (view.jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.routeJsonld = "";
    script.textContent = JSON.stringify(view.jsonLd);
    document.head.appendChild(script);
  }
}

let main;

function render(view, { focus = false } = {}) {
  runCleanups(); // Loops/Intervalle der vorherigen Seite stoppen
  main.innerHTML = view.html;
  setMeta(view);
  view.mount?.(main);
  initMotion(main);
  updateActiveNav();
  window.dispatchEvent(new Event("route-change")); // Header-Chrome aktualisieren
  if (focus) {
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function updateActiveNav() {
  const path = normalize(location.pathname);
  document.querySelectorAll("#site-header a[href]").forEach((a) => {
    const href = normalize(new URL(a.href).pathname);
    const active = href === "/" ? path === "/" : path.startsWith(href);
    a.setAttribute("aria-current", active ? "page" : "false");
  });
}

export function navigate(pathname) {
  history.pushState({}, "", pathname);
  render(resolve(pathname), { focus: true });
}

export function startRouter() {
  main = document.getElementById("main");

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; // Anker auf gleicher Seite
    e.preventDefault();
    navigate(url.pathname);
    document.body.classList.remove("nav-open");
  });

  window.addEventListener("popstate", () => {
    render(resolve(location.pathname), { focus: true });
  });

  render(resolve(location.pathname));
}
