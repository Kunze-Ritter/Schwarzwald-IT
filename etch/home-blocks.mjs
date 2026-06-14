// Baut den Etch-Block-Baum der Startseite aus denselben Inhaltsdaten wie der Vite-Prototyp.
// Single Source of Truth bleibt src/data/* – hier wird nur auf das Etch-Block-Modell gemappt.
//
// Wiederkehrende Strukturen UND die drei Visualisierungen (Hero-Gitter, Ops-Console,
// Zahnrad-Diagramm) sind Etch-Components (siehe etch/components.mjs); hier nur als comp()-
// Instanzen referenziert. Die Viz-Components tragen ihr Frontend-`script` selbst und sind
// mehrfach-verwendbar (instanz-lokale, idempotente Skripte).

import { el, elText, text, comp } from "./blocks.mjs";
import { site } from "../src/data/site.js";
import { services } from "../src/data/services.js";
import { faq } from "../src/data/faq.js";
import { referenzen } from "../src/data/referenzen.js";

const pillars = [
  { num: "01", title: "Zukunft gestalten", body: "Holen Sie das Maximum aus Ihrer IT heraus – sie ist mehr als nur Technologie, sie ist der Wegbereiter für Ihre Zukunft." },
  { num: "02", title: "Effizienz steigern", body: "Optimieren Sie Ihre Prozesse mit cleveren IT-Lösungen und heben Sie die Effizienz Ihres Unternehmens auf das nächste Level." },
  { num: "03", title: "Informationen schützen", body: "Bewahren Sie, was Ihnen wichtig ist – mit Sicherheitslösungen, die Ihre Daten und Systeme vor Bedrohungen schützen." },
];
const pains = [
  "„Das Netzwerk lahmt – keiner weiß, warum.“",
  "„Backup? Hoffentlich.“",
  "„Die IT frisst Zeit, statt sie zu sparen.“",
  "„Externe Dienstleister? Nie erreichbar.“",
];
const partners = ["HP", "Sophos", "Microsoft", "Veeam", "baramundi", "Mailstore", "servereye", "TERRA", "REINER SCT", "AvePoint", "Hornetsecurity", "REDDOXX"];
const stats = [
  { num: "40", label: "Jahre Erfahrung" },
  { num: "60", label: "Mitarbeitende" },
  { num: "100%", label: "aus der Region" },
];

// Wiederkehrende Bausteine ------------------------------------------------------

const sectionHead = (kicker, headline, lead, extraClass = "") =>
  el("div", { class: `section-head${extraClass ? " " + extraClass : ""}` }, [
    ...(kicker ? [elText("p", "kicker", kicker)] : []),
    elText("h2", null, headline),
    ...(lead ? [elText("p", "lead", lead)] : []),
  ]);

// Sections ----------------------------------------------------------------------

const hero = () =>
  el("section", { class: "hero", "data-hover": "0" }, [
    el("div", { class: "hero__bg" }, []),
    comp("HeroGrid"),
    el("div", { class: "hero__glow" }, []),
    el("div", { class: "hero__layout" }, [
      el("div", { class: "hero__copy" }, [
        el("div", { class: "hero__meta" }, [
          el("span", { class: "dot" }, []),
          elText("span", null, `SCHWARZWALD-IT // ${site.address.city.toUpperCase()}, DE`),
        ]),
        el("h1", { class: "hero__headline" }, [
          text("IT, die "), el("em", {}, [text("läuft.")]), el("br", {}, []),
          text("Beratung, die mitdenkt."),
        ]),
        elText("p", "hero__sub", site.subclaim),
        el("div", { class: "hero__actions" }, [
          el("a", { class: "btn btn--primary", href: "/leistungen/" }, [
            text("Unsere Lösungen "), elText("span", "arrow", "→"),
          ]),
          el("a", { class: "btn btn--ghost-light", href: "/kontakt/" }, [text("Erstgespräch")]),
        ]),
      ]),
      comp("OpsConsole"),
    ]),
    el("div", { class: "hero__strip" }, [
      comp("HeroStripItem", { label: "Status", value: "Support online" }),
      comp("HeroStripItem", { label: "Uptime 30d", value: "99.98%" }),
      comp("HeroStripItem", { label: "Reaktion Ø", value: "8 min" }),
      comp("HeroStripItem", { label: "Hotline", value: site.phoneDisplay }),
    ]),
  ]);

const painsSection = () =>
  el("section", { class: "section section--pains", "aria-label": "Typische IT-Probleme" }, [
    el("div", { class: "container" }, [
      el("ul", { class: "pain-list" }, pains.map((p) => comp("PainChip", { text: p }))),
      elText("p", "pain-answer", "Kommt Ihnen bekannt vor? Genau dafür gibt es uns."),
    ]),
  ]);

const versprechen = () =>
  el("section", { class: "section" }, [
    el("div", { class: "container" }, [
      sectionHead(
        "Ihr Partner für IT-Sicherheit",
        "Unser Versprechen",
        "Als IT-Dienstleister wissen wir, dass einzelne Projekte nicht ausreichen. Wir sehen uns als Partner auf Ihrer Digitalisierungsreise – und helfen Ihnen, Chancen wie Risiken frühzeitig zu erkennen.",
        "container--narrow"
      ),
      el("div", { class: "pillars" }, pillars.map((p) =>
        comp("Pillar", { num: p.num, title: p.title, body: p.body })
      )),
    ]),
  ]);

const systemSection = () =>
  el("section", { class: "section section--system section--dark" }, [
    el("div", { class: "container" }, [
      sectionHead(
        "Das System Schwarzwald-IT",
        "Drei IT-Fachbereiche, die wie Zahnräder ineinandergreifen",
        "Infrastruktur, IT-Sicherheit und Computing sind bei uns eng verzahnt. So stellen wir sicher, dass Ihre IT nicht nur funktioniert, sondern zuverlässig verfügbar, sicher betrieben und optimal auf den Arbeitsalltag abgestimmt ist."
      ),
      comp("GearDiagram"),
    ]),
  ]);

const portfolio = () =>
  el("section", { class: "section" }, [
    el("div", { class: "container" }, [
      sectionHead(
        "Unser Portfolio",
        "Leistungen, die zusammenspielen",
        "Beratung, Aufbau, Schutz und Betrieb – alles aus einer Hand und auf Ihre Größe zugeschnitten."
      ),
      el("div", { class: "card-grid" }, services.map((s) =>
        comp("ServiceCard", { kicker: s.kicker, title: s.title, short: s.short, href: `/leistungen/${s.slug}/` })
      )),
    ]),
  ]);

const bignum = () =>
  el("section", { class: "section section--alt" }, [
    el("div", { class: "container" }, [
      el("div", { class: "bignum" }, [
        el("div", { class: "bignum__media" }, [
          el("img", { src: "/images/startbild.png", alt: "Schwarzwald-IT – Team und Firmengebäude", loading: "lazy" }, []),
        ]),
        el("div", { class: "bignum__copy" }, [
          elText("p", "kicker", "Über 40 Jahre Erfahrung"),
          elText("h2", null, "Immer einen Schritt voraus."),
          elText("p", "lead", "Mit unseren IT-Sicherheitslösungen erfüllen Sie die drei Schutzziele der Informationssicherheit: Verfügbarkeit, Integrität und Vertraulichkeit."),
          el("ul", { class: "check-list" }, [
            "Daten verfügbar, wenn sie benötigt werden",
            "Veränderbar nur durch autorisierte Personen",
            "Zugänglich nur für die richtigen Menschen",
            "Schnelle Reaktionszeiten & persönliche Ansprechpartner",
          ].map((li) => elText("li", null, li))),
          el("div", { class: "bignum__stats" }, stats.map((s) =>
            comp("Stat", { num: s.num, label: s.label })
          )),
        ]),
      ]),
    ]),
  ]);

const partnersSection = () =>
  el("section", { class: "section section--dark" }, [
    el("div", { class: "container" }, [
      sectionHead(
        "Unsere Partner",
        "Nur das Beste für Sie",
        "Wir arbeiten mit den führenden Herstellern der IT-Branche, um Ihnen beste Qualität bieten zu können."
      ),
      el("div", { class: "partners" }, partners.map((p) => comp("PartnerChip", { name: p }))),
    ]),
  ]);

const quotes = () =>
  el("section", { class: "section" }, [
    el("div", { class: "container" }, [
      sectionHead("Kundenstimmen", "Das sagen unsere Kunden"),
      el("div", { class: "quote-grid" }, referenzen.map((r) =>
        comp("Quote", { quote: r.quote, author: r.author, company: r.company })
      )),
      el("p", { class: "center" }, [
        el("a", { class: "text-link", href: "/referenzen/" }, [text("Alle Referenzen ansehen →")]),
      ]),
    ]),
  ]);

const faqBlock = () =>
  el("section", { class: "section section--faq" }, [
    el("div", { class: "container container--narrow" }, [
      el("div", { class: "section-head" }, [elText("h2", null, "Häufige Fragen")]),
      el("div", {}, faq.map((f) =>
        comp("FaqItem", { question: f.q, answer: f.a })
      )),
    ]),
  ]);

const cta = () =>
  el("section", { class: "section section--cta" }, [
    el("div", { class: "container container--narrow" }, [
      elText("p", "kicker", "Erstgespräch"),
      elText("h2", null, "Lassen Sie uns über Ihre IT sprechen."),
      elText("p", "lead", "15 Minuten, eine ehrliche Einschätzung, keine Verkaufsshow."),
      el("div", { class: "btn-row" }, [
        el("a", { class: "btn btn--primary", href: "/kontakt/" }, [
          text("Kostenloses Erstgespräch "), elText("span", "arrow", "→"),
        ]),
        el("a", { class: "btn btn--ghost-light", href: `tel:${site.phone.replace(/[\s/]/g, "")}` }, [
          text(site.phoneDisplay),
        ]),
      ]),
    ]),
  ]);

/** Top-Level-Blockbaum der Startseite (Array von etch/element-Sections). */
export function homeTree() {
  return [
    hero(),
    painsSection(),
    versprechen(),
    systemSection(),
    portfolio(),
    bignum(),
    partnersSection(),
    quotes(),
    faqBlock(),
    cta(),
  ];
}
