// Orchestrator für das System-Diagramm: Umschalter zwischen zwei Varianten
// (Zahnräder & Netzwerk-Datenfluss) auf einer gemeinsamen Bühne + geteilten Karten.
// Default ist „Zahnräder". Beim Wechsel wird der aktive Renderer sauber gestoppt.
import { services } from "../data/services.js";
import { onCleanup } from "../lib/lifecycle.js";
import { NODES } from "./sysdiag-shared.js";
import { initGears } from "./system-diagram-canvas.js";
import { initNetwork } from "./system-diagram-network.js";
import { initStack } from "./system-diagram-stack.js";
import { initIso } from "./system-diagram-iso.js";

const VIEWS = [
  { id: "gears", label: "Zahnräder" },
  { id: "network", label: "Netzwerk" },
  { id: "stack", label: "Schichten" },
  { id: "iso", label: "Isometrisch" },
];

export function systemDiagram() {
  const cards = NODES.map(({ slug }) => {
    const s = services.find((sv) => sv.slug === slug);
    return `
      <article class="gear-card" data-node="${slug}">
        <div class="gear-card__role">${s.node.role}</div>
        <h3>${s.title}</h3>
        <p>${s.system}</p>
        <a class="text-link" href="/leistungen/${slug}/">Mehr zu ${s.title} →</a>
      </article>`;
  }).join("");

  const toggle = VIEWS.map(
    (v, i) =>
      `<button type="button" role="tab" data-view="${v.id}"${i === 0 ? ' class="is-active" aria-selected="true"' : ' aria-selected="false"'}>${v.label}</button>`
  ).join("");
  const canvases = VIEWS.map(
    (v, i) =>
      `<canvas class="gears__canvas" data-view="${v.id}" role="img"${i === 0 ? "" : " hidden"}
        aria-label="Diagramm der drei Fachbereiche (${v.label})"></canvas>`
  ).join("");

  return `
    <div class="gears">
      <div class="sysdiag__toggle" role="tablist" aria-label="Darstellung wählen">${toggle}</div>
      <div class="gears__stage">${canvases}</div>
      <div class="gears__cards">${cards}</div>
    </div>`;
}

export function initSystemDiagram(main) {
  const stage = main.querySelector(".gears__stage");
  if (!stage) return;
  const cards = [...main.querySelectorAll(".gear-card")];
  const canvases = {
    gears: main.querySelector('canvas[data-view="gears"]'),
    network: main.querySelector('canvas[data-view="network"]'),
  };
  const buttons = [...main.querySelectorAll(".sysdiag__toggle button")];
  const renderers = { gears: initGears, network: initNetwork, stack: initStack, iso: initIso };
  const canvasFor = {};
  main.querySelectorAll(".gears__canvas").forEach((c) => { canvasFor[c.dataset.view] = c; });

  let stop = null, current = null;
  function activate(view) {
    if (view === current || !renderers[view]) return;
    if (stop) stop();
    current = view;
    buttons.forEach((b) => {
      const on = b.dataset.view === view;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    Object.entries(canvasFor).forEach(([v, c]) => { c.hidden = v !== view; });
    stop = renderers[view](canvasFor[view], stage, cards);
  }

  buttons.forEach((b) => b.addEventListener("click", () => activate(b.dataset.view)));
  activate("gears");

  onCleanup(() => { if (stop) stop(); });
}
