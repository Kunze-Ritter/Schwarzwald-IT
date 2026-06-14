// Orchestrator für das System-Diagramm: Umschalter zwischen zwei Varianten
// (Zahnräder & Netzwerk-Datenfluss) auf einer gemeinsamen Bühne + geteilten Karten.
// Default ist „Zahnräder". Beim Wechsel wird der aktive Renderer sauber gestoppt.
import { services } from "../data/services.js";
import { onCleanup } from "../lib/lifecycle.js";
import { NODES } from "./sysdiag-shared.js";
import { initGears } from "./system-diagram-canvas.js";
import { initNetwork } from "./system-diagram-network.js";

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

  return `
    <div class="gears">
      <div class="sysdiag__toggle" role="tablist" aria-label="Darstellung wählen">
        <button type="button" role="tab" data-view="gears" class="is-active" aria-selected="true">Zahnräder</button>
        <button type="button" role="tab" data-view="network" aria-selected="false">Netzwerk</button>
      </div>
      <div class="gears__stage">
        <canvas class="gears__canvas" data-view="gears" role="img"
          aria-label="Diagramm: Infrastruktur, IT-Sicherheit und Computing greifen wie Zahnräder ineinander"></canvas>
        <canvas class="gears__canvas" data-view="network" role="img" hidden
          aria-label="Netzwerk-Diagramm: Infrastruktur, IT-Sicherheit und Computing tauschen Daten aus"></canvas>
      </div>
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
  const renderers = { gears: initGears, network: initNetwork };

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
    canvases.gears.hidden = view !== "gears";
    canvases.network.hidden = view !== "network";
    stop = renderers[view](canvases[view], stage, cards);
  }

  buttons.forEach((b) => b.addEventListener("click", () => activate(b.dataset.view)));
  activate("gears");

  onCleanup(() => { if (stop) stop(); });
}
