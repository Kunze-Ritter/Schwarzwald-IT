// Erzeugt aus Component-Specs + Home-Block-Baum die Artefakte unter etch/dist/:
//   components.json   – Etch-Component-Definitionen (Name, Key, Properties, Blocks)
//   home-blocks.json  – Seitenbaum (wiederkehrende Items als {__comp}-Platzhalter)
//   import-home.js     – einfügbares Browser-Skript: provisioniert Components + baut die Seite
//
// Nutzung:  node etch/build.mjs
//
// Ablauf des Runners im Etch-Builder (window.etch):
//   1. Components per key anlegen/aktualisieren (etch.components.create/updateAsync) → id-Map
//   2. {__comp}-Platzhalter → etch/component-Blocks mit aufgelöster componentId
//   3. alte Top-Level-Blocks löschen, Seitenbaum anlegen, etch.saveAsync()

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homeTree } from "./home-blocks.mjs";
import { componentSpecs } from "./components.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "dist");
mkdirSync(outDir, { recursive: true });

const tree = homeTree();
const components = componentSpecs();
writeFileSync(join(outDir, "home-blocks.json"), JSON.stringify(tree, null, 2), "utf8");
writeFileSync(join(outDir, "components.json"), JSON.stringify(components, null, 2), "utf8");

// Browser-Runner (siehe Ablauf oben). Wird auch von der gestückelten Live-Übertragung genutzt.
const runner = `// AUTO-GENERIERT von etch/build.mjs – im geöffneten Etch-Builder ausführen.
(async () => {
  const etch = window.etch;
  if (!etch) { console.error("[Etch] window.etch nicht gefunden – im Etch-Builder ausführen."); return; }
  const COMPONENTS = ${JSON.stringify(components)};
  const TREE = ${JSON.stringify(tree)};

  // 0) Klassen der Component-Blocks → Style-IDs (Etch verwaltet Klassen über styles[],
  //    nicht über class-Attribute; bei updateAsync wird class sonst verworfen). Die echte
  //    CSS-Definition liefert das globale Stylesheet; hier genügen leere Style-Regeln je Klasse.
  const classSet = new Set();
  const collect = (b) => {
    if (b.attributes && b.attributes.class) String(b.attributes.class).split(/\\s+/).forEach((c) => c && classSet.add(c));
    (b.children || []).forEach(collect);
  };
  COMPONENTS.forEach((s) => s.blocks.forEach(collect));
  const styleIdByClass = {};
  for (const cls of classSet) {
    const sel = "." + cls;
    const found = etch.styles.list().find((s) => s.selector === sel);
    styleIdByClass[cls] = found ? found.id : etch.styles.create(sel, "");
  }
  await etch.saveAsync(); // Style-Regeln persistieren, bevor Components sie referenzieren
  const applyClasses = (b) => {
    const out = { ...b, children: (b.children || []).map(applyClasses) };
    if (out.attributes && out.attributes.class) {
      const { class: cls, ...rest } = out.attributes;
      out.attributes = rest;
      out.styles = String(cls).split(/\\s+/).filter(Boolean).map((c) => styleIdByClass[c]);
    }
    return out;
  };

  // 1) Components provisionieren (idempotent über key)
  const idByKey = {};
  for (const spec of COMPONENTS) {
    const existing = etch.components.list().find((c) => c.key === spec.key);
    let id = existing ? existing.id : await etch.components.createAsync(spec.name);
    const blocks = spec.blocks.map(applyClasses);
    await etch.components.updateAsync(id, { key: spec.key, properties: spec.properties, blocks });
    idByKey[spec.key] = id;
  }

  // 2) {__comp}-Platzhalter zu etch/component auflösen
  const resolve = (node) => {
    if (node.__comp) {
      return { type: "etch/component", componentId: idByKey[node.__comp], attributes: node.attributes || {}, children: [] };
    }
    return { ...node, children: (node.children || []).map(resolve) };
  };

  // 3) alte Blocks ersetzen, neuen Baum anlegen
  etch.blocks.getTree().forEach((b) => etch.blocks.delete(b.id));
  let count = 0;
  const create = (node, parentId) => {
    const r = resolve(node);
    const { children = [], ...rest } = r;
    const id = etch.blocks.create({ version: 1, context: {}, children: [], ...rest }, parentId);
    count++;
    for (const child of children) create(child, id);
    return id;
  };
  try {
    for (const node of TREE) create(node, undefined);
    await etch.saveAsync();
    console.log("[Etch] Fertig:", Object.keys(idByKey).length, "Components,", count, "Blocks, gespeichert.");
  } catch (err) {
    console.error("[Etch] Fehlgeschlagen:", err && err.code, err && err.message, err);
  }
})();
`;
writeFileSync(join(outDir, "import-home.js"), runner, "utf8");

console.log(`OK – ${components.length} Components, ${tree.length} Top-Level-Sections.`);
console.log(`  etch/dist/components.json`);
console.log(`  etch/dist/home-blocks.json`);
console.log(`  etch/dist/import-home.js`);
