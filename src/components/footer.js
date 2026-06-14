import { site } from "../data/site.js";
import { services } from "../data/services.js";
import { icon } from "../lib/icons.js";

export function renderFooter() {
  const el = document.getElementById("site-footer");
  el.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="/images/logo-weiss.png" alt="${site.name}" />
        <p>Schwarzwald-IT ist die IT-Marke der ${site.legalName} – seit über 40 Jahren
        verlässlicher Partner für IT-Lösungen in der Region.</p>
        <div class="footer-social">
          <a href="#" aria-label="Facebook">${icon("facebook-f")}</a>
          <a href="#" aria-label="Instagram">${icon("instagram")}</a>
          <a href="#" aria-label="LinkedIn">${icon("linkedin-in")}</a>
          <a href="#" aria-label="YouTube">${icon("youtube")}</a>
        </div>
      </div>
      <nav aria-label="Leistungen">
        <p class="footer-heading">Leistungen</p>
        ${services.map((s) => `<a href="/leistungen/${s.slug}/">${s.title}</a>`).join("")}
      </nav>
      <nav aria-label="Unternehmen">
        <p class="footer-heading">Unternehmen</p>
        <a href="/ueber-uns/">Über uns</a>
        <a href="/referenzen/">Referenzen</a>
        <a href="/ratgeber/">Ratgeber</a>
        <a href="/kontakt/">Kontakt</a>
        <a href="/support/">Support</a>
      </nav>
      <div>
        <p class="footer-heading">Kontakt</p>
        <p><strong>Adresse</strong>${site.address.street}<br>${site.address.zip} ${site.address.city}</p>
        <p><strong>Telefon</strong><a href="tel:${site.phone.replace(/[\s/]/g, "")}" style="display:inline">${site.phoneDisplay}</a></p>
        <p><strong>E-Mail</strong><a href="mailto:${site.email}" style="display:inline">${site.email}</a></p>
      </div>
    </div>
    <div class="footer-legal">
      <span>© ${new Date().getFullYear()} ${site.legalName}</span>
      <span><a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span>
    </div>
  `;
}
