// Etch-Component-Definitionen für die Startseite.
// Jede Component: { name, key, properties, blocks }.
//   - properties → EtchComponentsApi.updateAsync(..., { properties })
//   - blocks     → vollständiger EtchBlockJson[]-Baum mit {props.<key>}-Bindings
//
// Zwei Sorten:
//   1. Inhalts-Components (Props) für Wiederholungen: ServiceCard, Pillar, Stat, …
//   2. Visualisierungs-Components mit eingebettetem Frontend-`script` (Hero-Gitter, Ops-Console,
//      Zahnrad-Diagramm). Die Skripte sind instanz-lokal + idempotent (siehe etch/runtime/*.js),
//      laufen also auch bei mehrfacher Verwendung der Component sauber nebeneinander.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { el, elText, text, materialize } from "./blocks.mjs";
import { services } from "../src/data/services.js";

const here = dirname(fileURLToPath(import.meta.url));
const script = (file) => readFileSync(join(here, "runtime", file), "utf8");
const heroGridScript = script("hero-grid.js");
const opsConsoleScript = script("ops-console.js");
const gearDiagramScript = script("gear-diagram.js");

// String-Property-Kurzschreibweise.
const p = (key, name, def = "", specialized) => ({
  name,
  key,
  type: specialized ? { primitive: "string", specialized } : { primitive: "string" },
  default: def,
});

const define = (name, key, properties, blockNodes) => ({
  name,
  key,
  properties,
  blocks: blockNodes.map(materialize),
});

// Hängt ein Frontend-`script` an einen Block (läuft auf der publizierten Seite). */
const withScript = (node, code) => ({ ...node, script: { code } });

const W = 432, H = 64; // Ops-Sparkline-Koordinatenraum

export function componentSpecs() {
  const opsConsole = withScript(
    el("aside", { class: "ops", "aria-hidden": "true" }, [
      el("div", { class: "ops__head" }, [
        elText("div", "ops__title", "Ops Console · Live"),
        el("div", { class: "ops__dots" }, [el("span", {}, []), el("span", {}, []), el("span", {}, [])]),
      ]),
      el("div", { class: "ops__metrics" }, [
        el("div", { class: "ops__metric" }, [
          elText("div", "label", "Uptime · 30d"),
          el("div", { class: "value" }, [el("span", { "data-uptime": "" }, [text("99.98")]), elText("sup", null, "%")]),
          elText("div", "delta", "▲ 0.04 vs. last"),
        ]),
        el("div", { class: "ops__metric" }, [
          elText("div", "label", "Tickets heute"),
          el("div", { class: "value" }, [el("span", { "data-tickets": "" }, [text("47")]), elText("sup", null, "/h")]),
          elText("div", "delta", "Ø Reaktion 8 min"),
        ]),
      ]),
      el("div", { class: "ops__chart" }, [
        el("div", { class: "label" }, [
          elText("span", null, "Traffic · vlan-corp"),
          el("span", { class: "now" }, [el("span", { "data-now": "" }, [text("30")]), text(" Mb/s")]),
        ]),
        el("canvas", { class: "ops__spark", width: String(W), height: String(H) }, []),
        el("div", { class: "axis" }, [elText("span", null, "−15 min"), elText("span", null, "jetzt")]),
      ]),
      el("div", { class: "ops__log" }, [
        elText("div", "label", "System log"),
        el("div", { "data-log": "" }, []),
      ]),
    ]),
    opsConsoleScript
  );

  const gearCards = ["it-sicherheit", "it-infrastruktur", "computing"].map((slug) => {
    const s = services.find((sv) => sv.slug === slug);
    return el("article", { class: "gear-card", "data-node": slug }, [
      elText("div", "gear-card__role", s.node.role),
      elText("h3", null, s.title),
      elText("p", null, s.system),
      el("a", { class: "text-link", href: `/leistungen/${slug}/` }, [text(`Mehr zu ${s.title} →`)]),
    ]);
  });
  const gearDiagram = withScript(
    el("div", { class: "gears" }, [
      el("div", { class: "gears__stage" }, [
        el("canvas", {
          class: "gears__canvas", role: "img",
          "aria-label": "Diagramm: Infrastruktur, IT-Sicherheit und Computing greifen wie Zahnräder ineinander",
        }, []),
      ]),
      el("div", { class: "gears__cards" }, gearCards),
    ]),
    gearDiagramScript
  );

  return [
    // ── Inhalts-Components (Props) ────────────────────────────────────────────
    define("ServiceCard", "ServiceCard",
      [p("kicker", "Kicker"), p("title", "Titel"), p("short", "Kurztext"), p("href", "Link", "", "url")],
      [
        el("a", { class: "card", href: "{props.href}" }, [
          elText("p", "kicker", "{props.kicker}"),
          elText("h3", null, "{props.title}"),
          elText("p", null, "{props.short}"),
          elText("span", "text-link", "Mehr erfahren →"),
        ]),
      ]),
    define("Pillar", "Pillar",
      [p("num", "Nummer"), p("title", "Titel"), p("body", "Text")],
      [
        el("article", { class: "pillar" }, [
          elText("div", "pillar__num", "{props.num} / 03"),
          elText("h3", null, "{props.title}"),
          elText("p", null, "{props.body}"),
        ]),
      ]),
    define("Stat", "Stat",
      [p("num", "Zahl"), p("label", "Label")],
      [
        el("div", { class: "stat" }, [
          elText("div", "stat__num", "{props.num}"),
          elText("div", "stat__label", "{props.label}"),
        ]),
      ]),
    define("PartnerChip", "PartnerChip",
      [p("name", "Name")],
      [elText("div", "partner", "{props.name}")]),
    define("Quote", "Quote",
      [p("quote", "Zitat"), p("author", "Person"), p("company", "Firma")],
      [
        el("blockquote", { class: "quote" }, [
          elText("p", null, "„{props.quote}“"),
          elText("footer", null, "{props.author} · {props.company}"),
        ]),
      ]),
    define("FaqItem", "FaqItem",
      [p("question", "Frage"), p("answer", "Antwort")],
      [
        el("details", { class: "faq-item" }, [
          elText("summary", null, "{props.question}"),
          elText("p", null, "{props.answer}"),
        ]),
      ]),
    define("PainChip", "PainChip",
      [p("text", "Text")],
      [elText("li", null, "{props.text}")]),
    define("HeroStripItem", "HeroStripItem",
      [p("label", "Label"), p("value", "Wert")],
      [
        el("div", {}, [
          elText("span", "label", "{props.label}"),
          elText("strong", null, "{props.value}"),
        ]),
      ]),

    // ── Visualisierungs-Components (eingebettetes Frontend-script) ─────────────
    define("HeroGrid", "HeroGrid", [],
      [withScript(el("canvas", { class: "hero__grid", "aria-hidden": "true" }, []), heroGridScript)]),
    define("OpsConsole", "OpsConsole", [], [opsConsole]),
    define("GearDiagram", "GearDiagram", [], [gearDiagram]),
  ];
}
