import { site } from "../data/site.js";

const nav = [
  ["/leistungen/", "Leistungen"],
  ["/referenzen/", "Referenzen"],
  ["/ueber-uns/", "Über uns"],
  ["/ratgeber/", "Ratgeber"],
  ["/support/", "Support"],
];

export function renderHeader() {
  const el = document.getElementById("site-header");
  el.innerHTML = `
    <div class="header-inner container">
      <a class="brand" href="/" aria-label="${site.name} – Startseite">
        <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3 L27 22 H21 L26 29 H6 L11 22 H5 Z" fill="currentColor"/>
        </svg>
        <span class="brand-name">Schwarzwald<span class="brand-accent">-IT</span></span>
      </a>
      <button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Hauptnavigation">
        ${nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
        <a class="btn btn--primary nav-cta" href="/kontakt/">Erstgespräch</a>
      </nav>
    </div>
  `;

  const toggle = el.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  });
}
