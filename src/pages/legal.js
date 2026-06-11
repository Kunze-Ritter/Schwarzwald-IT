import { site } from "../data/site.js";

// Platzhalter – finale Texte müssen juristisch geprüft übernommen werden
// (Bestandstexte von kunze-ritter.de/schwarzwald-it.com).
export function impressum() {
  const html = `
    <section class="page-head"><div class="container">
      <h1>Impressum</h1>
    </div></section>
    <section class="section"><div class="container container--narrow">
      <p>${site.legalName}<br>${site.address.street}<br>${site.address.zip} ${site.address.city}</p>
      <p>Telefon: ${site.phoneDisplay}<br>E-Mail: ${site.email}</p>
      <p><em>Platzhalter – vollständiges Impressum (Geschäftsführung, Registergericht,
      USt-IdNr.) vor Launch von der bestehenden Website übernehmen.</em></p>
    </div></section>
  `;
  return { title: "Impressum", description: "Impressum der Schwarzwald-IT.", html };
}

export function datenschutz() {
  const html = `
    <section class="page-head"><div class="container">
      <h1>Datenschutzerklärung</h1>
    </div></section>
    <section class="section"><div class="container container--narrow">
      <p><em>Platzhalter – finale Datenschutzerklärung vor Launch ergänzen.</em></p>
      <p>Grundsatz dieser Website: Alle Ressourcen (Schriften, Skripte, Bilder)
      werden lokal vom eigenen Server geladen. Es werden keine externen Dienste,
      CDNs, Tracking- oder Analyse-Tools von Drittanbietern eingebunden und keine
      Cookies gesetzt, die einer Einwilligung bedürfen.</p>
    </div></section>
  `;
  return {
    title: "Datenschutz",
    description: "Datenschutzerklärung der Schwarzwald-IT.",
    html,
  };
}
