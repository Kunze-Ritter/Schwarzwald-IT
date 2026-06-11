import { site } from "../data/site.js";

// Eigener Bereich für Bestandskunden – bewusst getrennt vom Vertriebskontakt.
export function support() {
  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">Support</p>
        <h1>Hilfe für Bestandskunden</h1>
        <p class="lead">Schnelle Unterstützung durch unser Support-Team in der Region.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="card-grid card-grid--small" data-motion-reveal-group>
          <div class="card">
            <h2 class="h3">Support-Hotline</h2>
            <p>Bei dringenden Störungen erreichen Sie uns telefonisch:</p>
            <p><a class="text-link" href="tel:${site.phone.replace(/[\s/]/g, "")}">${site.phoneDisplay}</a></p>
          </div>
          <div class="card">
            <h2 class="h3">Ticket per E-Mail</h2>
            <p>Beschreiben Sie Ihr Anliegen – wir melden uns mit fester Bearbeitungszusage.</p>
            <p><a class="text-link" href="mailto:${site.email}">${site.email}</a></p>
          </div>
          <div class="card">
            <h2 class="h3">Fernwartung</h2>
            <p>Download des Fernwartungs-Tools nach Absprache mit Ihrem Ansprechpartner.</p>
            <!-- TODO: Fernwartungs-Tool lokal hosten und hier verlinken (DSGVO: kein Fremd-CDN). -->
            <p class="footer-note">Link folgt – Tool wird lokal gehostet.</p>
          </div>
        </div>
      </div>
    </section>
  `;
  return {
    title: "Support für Bestandskunden",
    description:
      "Support von Schwarzwald-IT: Hotline, Ticket und Fernwartung für Bestandskunden in Südbaden.",
    html,
  };
}
