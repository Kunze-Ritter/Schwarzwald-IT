import { site } from "../data/site.js";
import { icon } from "../lib/icons.js";

const nav = [
  ["/leistungen/", "Leistungen"],
  ["/referenzen/", "Referenzen"],
  ["/ueber-uns/", "Über uns"],
  ["/ratgeber/", "Ratgeber"],
  ["/support/", "Support"],
];

// Header ist über dem dunklen Hero transluzent, sonst (gescrollt oder auf
// Unterseiten) solide mit hellem Hintergrund.
function syncChrome(el) {
  const overHero = location.pathname === "/" && window.scrollY <= 40;
  el.classList.toggle("is-translucent", overHero);
  el.classList.toggle("is-solid", !overHero);
}

export function renderHeader() {
  const el = document.getElementById("site-header");
  el.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="/" aria-label="${site.name} – Startseite">
        <img class="logo-light" src="/images/logo-weiss.png" alt="${site.name}" />
        <img class="logo-dark" src="/images/logo.png" alt="${site.name}" />
      </a>
      <button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        ${icon("bars")}
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Hauptnavigation">
        ${nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
        <a class="nav-cta" href="/kontakt/">${icon("phone")} ${site.phoneDisplay}</a>
      </nav>
    </div>
  `;

  const toggle = el.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  });

  syncChrome(el);
  window.addEventListener("scroll", () => syncChrome(el), { passive: true });
  // Router meldet nach jedem Seitenwechsel „route-change".
  window.addEventListener("route-change", () => syncChrome(el));
}
