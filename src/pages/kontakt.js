import { site } from "../data/site.js";
import { icon } from "../lib/icons.js";

export function kontakt() {
  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">Kontakt</p>
        <h1>Lassen Sie uns sprechen.</h1>
        <p class="lead">15 Minuten, eine ehrliche Einschätzung Ihrer IT – kostenlos
        und unverbindlich.</p>
      </div>
    </section>
    <section class="section">
      <div class="container contact-grid">
        <div class="contact-info" data-motion-reveal>
          <div>${icon("phone")}<div><strong>Telefon</strong>
            <a href="tel:${site.phone.replace(/[\s/]/g, "")}" style="display:inline">${site.phoneDisplay}</a></div></div>
          <div>${icon("envelope")}<div><strong>E-Mail</strong>
            <a href="mailto:${site.email}" style="display:inline">${site.email}</a></div></div>
          <div>${icon("location-dot")}<div><strong>Adresse</strong>
            ${site.legalName}<br>${site.address.street}, ${site.address.zip} ${site.address.city}</div></div>
          <p class="footer-note" style="color:var(--fg-3)">Hinweis: Wir betreuen ausschließlich
          Unternehmen (B2B) – keinen Privatkunden-Support.</p>
          <!-- DSGVO: Bewusst keine eingebettete Karte von Drittservern. -->
        </div>
        <form class="contact-form" data-motion-reveal action="#" method="post">
          <label>Name<input type="text" name="name" required autocomplete="name"></label>
          <label>Firma<input type="text" name="company" required autocomplete="organization"></label>
          <label>E-Mail oder Telefon<input type="text" name="contact" required></label>
          <label>Worum geht es? (optional)<textarea name="message" rows="4"></textarea></label>
          <button class="btn btn--primary" type="submit">Anfrage senden <span class="arrow">→</span></button>
          <p class="footer-note" style="color:var(--fg-3);margin-top:16px">Prototyp: Der Versand ist
          noch nicht angebunden. Es werden keine Daten an Dritte übertragen, kein Tracking.</p>
        </form>
      </div>
    </section>
  `;
  return {
    title: "Kontakt – kostenloses Erstgespräch",
    description:
      "Kontakt zu Schwarzwald-IT in Freiburg: kostenloses Erstgespräch für Unternehmen in Südbaden. Telefon, E-Mail oder Kontaktformular.",
    html,
    mount: (main) => {
      main.querySelector(".contact-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Prototyp: Der Formularversand wird im nächsten Schritt angebunden.");
      });
    },
  };
}
