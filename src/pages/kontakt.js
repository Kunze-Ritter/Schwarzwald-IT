import { site } from "../data/site.js";

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
        <div data-motion-reveal>
          <h2 class="h3">Direkt erreichen</h2>
          <p>
            <strong>Telefon:</strong>
            <a href="tel:${site.phone.replace(/[\s/]/g, "")}">${site.phoneDisplay}</a><br>
            <strong>E-Mail:</strong>
            <a href="mailto:${site.email}">${site.email}</a>
          </p>
          <p>${site.legalName}<br>
          ${site.address.street}<br>
          ${site.address.zip} ${site.address.city}</p>
          <p class="footer-note">Hinweis: Wir betreuen ausschließlich Unternehmen
          (B2B) – keinen Privatkunden-Support.</p>
          <!-- DSGVO: Bewusst keine eingebettete Karte von Drittservern.
               Option für später: selbst gehostete Tiles oder statisches Kartenbild. -->
        </div>
        <form class="contact-form" data-motion-reveal action="#" method="post">
          <h2 class="h3">Oder schreiben Sie uns</h2>
          <label>Name<input type="text" name="name" required autocomplete="name"></label>
          <label>Firma<input type="text" name="company" required autocomplete="organization"></label>
          <label>E-Mail oder Telefon<input type="text" name="contact" required></label>
          <label>Worum geht es? (optional)<textarea name="message" rows="4"></textarea></label>
          <button class="btn btn--primary" type="submit">Anfrage senden</button>
          <p class="footer-note">Prototyp: Der Versand ist noch nicht angebunden
          (geplant: Übermittlung an eigenes Postfach, ohne Drittanbieter).
          Es werden keine Daten an Dritte übertragen, kein Tracking.</p>
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
