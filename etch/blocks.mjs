// Mini-Helfer zum Aufbau von Etch-Block-JSON (https://docs.etchwp.com/public-api/types-reference).
//
// Wir erzeugen hier nur die *fachliche* Baumstruktur als schlanke Plain-Objects.
// version/context/children werden erst im Browser-Runner (siehe build.mjs) auf das
// vollständige EtchBlockJson aufgefüllt, damit dieselbe Definition für create() taugt.

/** etch/element – generischer HTML-Tag-Block. */
export const el = (tag, attributes = {}, children = []) => ({
  type: "etch/element",
  tag,
  attributes,
  children,
});

/** etch/text – reiner Textknoten (lebt als Kind eines element-Blocks). */
export const text = (value) => ({ type: "etch/text", text: String(value) });

/** Bequemer Element-Helfer mit Klassen + einzelnem Textkind. */
export const elText = (tag, className, value) =>
  el(tag, className ? { class: className } : {}, [text(value)]);

/** etch/svg – lädt ein SVG aus der Media-Library und kann Farben überschreiben. */
export const svg = (src, { stripColors = true, ...rest } = {}) => ({
  type: "etch/svg",
  attributes: { src, stripColors: String(stripColors), ...rest },
  children: [],
});

/** etch/raw-html – exaktes HTML (z. B. Inline-SVG/Canvas-Markup) unverändert übernehmen. */
export const raw = (html) => ({
  type: "etch/raw-html",
  content: html,
  unsafe: html,
  children: [],
});

/**
 * Platzhalter für eine Etch-Component-Instanz im Seitenbaum. Wird beim Import (Browser)
 * zu { type:"etch/component", componentId, attributes } aufgelöst, sobald die Component-IDs
 * feststehen. `attributes`-Keys = Property-Keys der Component, Werte = gebundene Werte.
 */
export const comp = (key, attributes = {}) => ({ __comp: key, attributes, children: [] });

/**
 * Materialisiert einen schlanken Knoten (el/text/…) rekursiv zu vollständigem EtchBlockJson
 * (version/context + verschachtelte children). Nötig für Component-`blocks`, die als
 * komplette EtchBlockJson[]-Bäume an updateAsync übergeben werden.
 */
const STYLED = new Set(["etch/element", "etch/component", "etch/dynamic-element", "etch/dynamic-image", "etch/svg"]);
export function materialize(node) {
  const { children = [], ...rest } = node;
  const out = { version: 1, context: {}, ...rest, children: children.map(materialize) };
  // Der Component-Block-Validator erwartet auf gestylten Blöcken ein (leeres) styles-Array.
  if (STYLED.has(out.type) && out.styles === undefined) out.styles = [];
  return out;
}

/** Unsichtbarer Träger-Block, an dem ein Frontend-`script` hängt (läuft beim Rendern der Seite). */
export const scriptCarrier = (code, name = "runtime") => ({
  type: "etch/element",
  tag: "div",
  attributes: { "data-runtime": name, hidden: "" },
  script: { code },
  children: [],
});
