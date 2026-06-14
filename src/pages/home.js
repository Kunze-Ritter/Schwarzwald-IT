import { site } from "../data/site.js";
import { services } from "../data/services.js";
import { faq } from "../data/faq.js";
import { referenzen } from "../data/referenzen.js";
import { icon } from "../lib/icons.js";
import { systemDiagramCanvas, initSystemDiagramCanvas } from "../components/system-diagram-canvas.js";
import { opsPanel, initOpsPanel } from "../components/hero-ops-panel.js";
import { initHeroGrid } from "../components/hero-grid.js";
import { ctaBlock } from "../components/cta-block.js";
import { faqSection, faqJsonLd } from "../components/faq-section.js";

const pains = [
  "„Das Netzwerk lahmt – keiner weiß, warum.“",
  "„Backup? Hoffentlich.“",
  "„Die IT frisst Zeit, statt sie zu sparen.“",
  "„Externe Dienstleister? Nie erreichbar.“",
];

const pillars = [
  { num: "01", title: "Zukunft gestalten", body: "Holen Sie das Maximum aus Ihrer IT heraus – sie ist mehr als nur Technologie, sie ist der Wegbereiter für Ihre Zukunft." },
  { num: "02", title: "Effizienz steigern", body: "Optimieren Sie Ihre Prozesse mit cleveren IT-Lösungen und heben Sie die Effizienz Ihres Unternehmens auf das nächste Level." },
  { num: "03", title: "Informationen schützen", body: "Bewahren Sie, was Ihnen wichtig ist – mit Sicherheitslösungen, die Ihre Daten und Systeme vor Bedrohungen schützen." },
];

const partners = ["HP", "Sophos", "Microsoft", "Veeam", "baramundi", "Mailstore", "servereye", "TERRA", "REINER SCT", "AvePoint", "Hornetsecurity", "REDDOXX"];

const stats = [
  { num: "40", label: "Jahre Erfahrung" },
  { num: "60", label: "Mitarbeitende" },
  { num: "100%", label: "aus der Region" },
];

export function home() {
  const html = `
    <section class="hero" data-hover="0">
      <div class="hero__bg"></div>
      <canvas class="hero__grid" aria-hidden="true"></canvas>
      <div class="hero__glow"></div>

      <div class="hero__layout">
        <div class="hero__copy" data-motion-intro>
          <div class="hero__meta">
            <span class="dot"></span>
            <span>SCHWARZWALD-IT // ${site.address.city.toUpperCase()}, DE</span>
          </div>
          <h1 class="hero__headline">IT, die <em>läuft.</em><br>Beratung, die mitdenkt.</h1>
          <p class="hero__sub">${site.subclaim}</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="/leistungen/">Unsere Lösungen <span class="arrow">→</span></a>
            <a class="btn btn--ghost-light" href="/kontakt/">${icon("play")} Erstgespräch</a>
          </div>
        </div>
        ${opsPanel()}
      </div>

      <div class="hero__strip">
        <div><span class="ok">●</span> <span class="label">Status</span> <strong>Support online</strong></div>
        <div><span class="cy">▲</span> <span class="label">Uptime 30d</span> <strong>99.98%</strong></div>
        <div><span class="cy">◆</span> <span class="label">Reaktion Ø</span> <strong>8 min</strong></div>
        <div><span class="label">Hotline</span> <strong>${site.phoneDisplay}</strong></div>
      </div>
    </section>

    <section class="section section--pains" aria-label="Typische IT-Probleme">
      <div class="container">
        <ul class="pain-list" data-motion-reveal-group>
          ${pains.map((p) => `<li>${p}</li>`).join("")}
        </ul>
        <p class="pain-answer" data-motion-reveal>Kommt Ihnen bekannt vor? Genau dafür gibt es uns.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head container--narrow" data-motion-reveal>
          <p class="kicker">Ihr Partner für IT-Sicherheit</p>
          <h2>Unser Versprechen</h2>
          <p class="lead">Als IT-Dienstleister wissen wir, dass einzelne Projekte nicht
          ausreichen. Wir sehen uns als Partner auf Ihrer Digitalisierungsreise – und
          helfen Ihnen, Chancen wie Risiken frühzeitig zu erkennen.</p>
        </div>
        <div class="pillars" data-motion-reveal-group>
          ${pillars
            .map(
              (p) => `
            <article class="pillar">
              <div class="pillar__num">${p.num} / 03</div>
              <h3>${p.title}</h3>
              <p>${p.body}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section section--system section--dark">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <p class="kicker">Das System Schwarzwald-IT</p>
          <h2>Drei IT-Fachbereiche, die wie Zahnräder ineinandergreifen</h2>
          <p class="lead">Infrastruktur, IT-Sicherheit und Computing sind bei uns eng
          verzahnt. So stellen wir sicher, dass Ihre IT nicht nur funktioniert, sondern
          zuverlässig verfügbar, sicher betrieben und optimal auf den Arbeitsalltag
          abgestimmt ist.</p>
        </div>
        ${systemDiagramCanvas()}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <p class="kicker">Unser Portfolio</p>
          <h2>Leistungen, die zusammenspielen</h2>
          <p class="lead">Beratung, Aufbau, Schutz und Betrieb – alles aus einer Hand und
          auf Ihre Größe zugeschnitten.</p>
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
        <div class="bignum">
          <div class="bignum__media" data-motion-reveal>
            <img src="/images/startbild.png" alt="Schwarzwald-IT – Team und Firmengebäude" loading="lazy" />
          </div>
          <div class="bignum__copy" data-motion-reveal>
            <p class="kicker">Über 40 Jahre Erfahrung</p>
            <h2>Immer einen Schritt voraus.</h2>
            <p class="lead">Mit unseren IT-Sicherheitslösungen erfüllen Sie die drei
            Schutzziele der Informationssicherheit: Verfügbarkeit, Integrität und
            Vertraulichkeit.</p>
            <ul class="check-list">
              <li>Daten verfügbar, wenn sie benötigt werden</li>
              <li>Veränderbar nur durch autorisierte Personen</li>
              <li>Zugänglich nur für die richtigen Menschen</li>
              <li>Schnelle Reaktionszeiten &amp; persönliche Ansprechpartner</li>
            </ul>
            <div class="bignum__stats">
              ${stats
                .map(
                  (s) => `<div class="stat"><div class="stat__num">${s.num}</div><div class="stat__label">${s.label}</div></div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <p class="kicker">Unsere Partner</p>
          <h2>Nur das Beste für Sie</h2>
          <p class="lead">Wir arbeiten mit den führenden Herstellern der IT-Branche, um
          Ihnen beste Qualität bieten zu können.</p>
        </div>
        <div class="partners" data-motion-reveal-group>
          ${partners.map((p) => `<div class="partner">${p}</div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head" data-motion-reveal>
          <p class="kicker">Kundenstimmen</p>
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
        <p class="center" style="margin-top:32px" data-motion-reveal>
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
    mount: (main) => {
      initHeroGrid(main);
      initOpsPanel(main);
      initSystemDiagramCanvas(main);
    },
  };
}
