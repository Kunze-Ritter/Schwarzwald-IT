import { site } from "../data/site.js";
import { services } from "../data/services.js";
import { faq } from "../data/faq.js";
import { referenzen } from "../data/referenzen.js";
import { systemDiagramCanvas, initSystemDiagramCanvas } from "../components/system-diagram-canvas.js";
import { ctaBlock } from "../components/cta-block.js";
import { faqSection, faqJsonLd } from "../components/faq-section.js";

const pains = [
  "„Das Netzwerk lahmt – keiner weiß, warum.“",
  "„Backup? Hoffentlich.“",
  "„Die IT frisst Zeit, statt sie zu sparen.“",
  "„Externe Dienstleister? Nie erreichbar.“",
];

export function home() {
  const html = `
    <section class="hero">
      <div class="container" data-motion-intro>
        <p class="kicker">IT-Systemhaus für den Mittelstand · ${site.regions.join(" · ")}</p>
        <h1>${site.claim}</h1>
        <p class="lead">${site.subclaim}</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="/kontakt/">Kostenloses Erstgespräch</a>
          <a class="btn btn--ghost" href="/leistungen/">Leistungen ansehen</a>
        </div>
      </div>
    </section>

    <section class="section section--pains" aria-label="Typische IT-Probleme">
      <div class="container">
        <ul class="pain-list" data-motion-reveal-group>
          ${pains.map((p) => `<li>${p}</li>`).join("")}
        </ul>
        <p class="pain-answer" data-motion-reveal>Kommt Ihnen bekannt vor?
        Genau dafür gibt es uns.</p>
      </div>
    </section>

    <section class="section section--system">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <p class="kicker">Das System Schwarzwald-IT</p>
          <h2>Drei Fachbereiche, ein System</h2>
          <p class="lead">Infrastruktur, IT-Sicherheit und Computing sind bei uns eng
          verzahnt. So stellen wir sicher, dass Ihre IT nicht nur funktioniert, sondern
          zuverlässig verfügbar, sicher betrieben und optimal auf den Arbeitsalltag
          abgestimmt ist.</p>
        </div>
      </div>
      ${systemDiagramCanvas()}
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <h2>Unsere Leistungen</h2>
        </div>
        <div class="card-grid" data-motion-reveal-group>
          ${services
            .map(
              (s) => `
            <a class="card" href="/leistungen/${s.slug}/">
              <p class="kicker">${s.kicker}</p>
              <h3>${s.title}</h3>
              <p>${s.short}</p>
              <span class="text-link">Mehr erfahren →</span>
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <h2>Warum Schwarzwald-IT?</h2>
        </div>
        <div class="usp-grid" data-motion-reveal-group>
          <div class="usp"><h3>Persönlich</h3><p>Feste Ansprechpartner und ein eigenes
          Support-Team in der Region – keine anonyme Hotline.</p></div>
          <div class="usp"><h3>Erfahren</h3><p>Über 40 Jahre Kunze & Ritter, rund 60
          Mitarbeitende – seit 2019 mit Schwarzwald-IT als IT-Marke.</p></div>
          <div class="usp"><h3>Fördermittel-Know-how</h3><p>Wir integrieren passende
          Förderprogramme in Ihr Digitalisierungsprojekt.</p></div>
          <div class="usp"><h3>Planbar</h3><p>Individuelle Konzepte mit klaren
          Reaktionszeiten und kalkulierbaren monatlichen Kosten.</p></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <h2>Das sagen unsere Kunden</h2>
        </div>
        <div class="quote-grid" data-motion-reveal-group>
          ${referenzen
            .map(
              (r) => `
            <blockquote class="quote">
              <p>„${r.quote}"</p>
              <footer>${r.author} · ${r.company}</footer>
            </blockquote>`
            )
            .join("")}
        </div>
        <p class="center" data-motion-reveal>
          <a class="text-link" href="/referenzen/">Alle Referenzen ansehen →</a>
        </p>
      </div>
    </section>

    ${faqSection(faq)}
    ${ctaBlock()}
  `;

  return {
    title: "IT-Systemhaus für den Mittelstand in Südbaden",
    description:
      "Schwarzwald-IT: IT-Infrastruktur, IT-Sicherheit, Computing und Managed Services aus Freiburg – persönlich, regional, planbar. Jetzt kostenloses Erstgespräch vereinbaren.",
    html,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: site.name,
        legalName: site.legalName,
        url: site.baseUrl,
        telephone: site.phone,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: site.address.zip,
          addressLocality: site.address.city,
          addressCountry: "DE",
        },
        areaServed: site.regions,
      },
      faqJsonLd(faq),
    ],
    mount: (main) => initSystemDiagramCanvas(main),
  };
}
