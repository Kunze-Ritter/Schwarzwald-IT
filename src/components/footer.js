import { site } from "../data/site.js";
import { services } from "../data/services.js";

export function renderFooter() {
  const el = document.getElementById("site-footer");
  el.innerHTML = `
    <div class="container footer-grid">
      <div>
        <p class="footer-brand">Schwarzwald<span class="brand-accent">-IT</span></p>
        <p>Eine Marke der ${site.legalName}<br>
        ${site.address.street}, ${site.address.zip} ${site.address.city}</p>
        <p>
          <a href="tel:${site.phone.replace(/[\s/]/g, "")}">${site.phoneDisplay}</a><br>
          <a href="mailto:${site.email}">${site.email}</a>
        </p>
      </div>
      <nav aria-label="Leistungen">
        <p class="footer-heading">Leistungen</p>
        ${services
          .map((s) => `<a href="/leistungen/${s.slug}/">${s.title}</a>`)
          .join("")}
      </nav>
      <nav aria-label="Unternehmen">
        <p class="footer-heading">Unternehmen</p>
        <a href="/ueber-uns/">Über uns</a>
        <a href="/referenzen/">Referenzen</a>
        <a href="/ratgeber/">Ratgeber</a>
        <a href="/kontakt/">Kontakt</a>
        <a href="/support/">Support für Bestandskunden</a>
      </nav>
      <div>
        <p class="footer-heading">Region</p>
        <p>IT-Systemhaus für ${site.regions.join(", ")}.</p>
        <p class="footer-note">Diese Website lädt alle Inhalte lokal – ohne externe
        Dienste, Fonts oder Tracking.</p>
      </div>
    </div>
    <div class="container footer-legal">
      <span>© ${new Date().getFullYear()} ${site.legalName}</span>
      <span><a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span>
    </div>
  `;
}
