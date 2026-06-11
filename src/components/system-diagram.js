// „Das System Schwarzwald-IT" – die ineinandergreifenden Fachbereiche als
// Netzwerk-Topologie statt Zahnräder: Infrastruktur als Fundament, Computing
// dockt an, IT-Sicherheit legt sich als Schutzring um das System. Danach
// fließen Datenimpulse über die Verbindungen.
import { animate, inView, spring } from "motion";
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";

const NODES = [
  { slug: "it-infrastruktur", cx: 320, cy: 448, r: 62 },
  { slug: "computing", cx: 320, cy: 192, r: 62 },
  { slug: "it-sicherheit", cx: 60, cy: 320, r: 54 },
];

const RING = { cx: 320, cy: 320, r: 260 };

export function systemDiagram() {
  const nodeMarkup = NODES.map((n) => {
    const s = services.find((sv) => sv.slug === n.slug);
    return `
      <g class="sd-node" data-service="${n.slug}" tabindex="0" role="button"
         aria-label="${s.title}: ${s.node.role}">
        <circle class="sd-node-glow" cx="${n.cx}" cy="${n.cy}" r="${n.r + 10}"/>
        <circle class="sd-node-circle" cx="${n.cx}" cy="${n.cy}" r="${n.r}"/>
        <text class="sd-node-label" x="${n.cx}" y="${n.cy - 4}" text-anchor="middle">${s.node.label}</text>
        <text class="sd-node-role" x="${n.cx}" y="${n.cy + 18}" text-anchor="middle">${s.node.role}</text>
      </g>`;
  }).join("");

  const panels = NODES.map((n, i) => {
    const s = services.find((sv) => sv.slug === n.slug);
    return `
      <div class="sd-panel${i === 0 ? " is-active" : ""}" data-panel="${n.slug}" ${i === 0 ? "" : "hidden"}>
        <p class="kicker">${s.node.role}</p>
        <h3>${s.title}</h3>
        <p>${s.system}</p>
        <a class="text-link" href="/leistungen/${s.slug}/">Mehr zu ${s.title} →</a>
      </div>`;
  }).join("");

  return `
    <div class="system-diagram">
      <div class="sd-figure">
        <svg viewBox="0 0 640 640" role="img"
             aria-label="Diagramm: IT-Infrastruktur und Computing sind verbunden, IT-Sicherheit umschließt beide als Schutzring.">
          <circle class="sd-ring" cx="${RING.cx}" cy="${RING.cy}" r="${RING.r}" pathLength="1"/>
          <path class="sd-link" d="M320 384 L320 256" pathLength="1"/>
          <circle class="sd-pulse" data-pulse-path="link" r="5"/>
          <circle class="sd-pulse" data-pulse-path="link" data-pulse-reverse r="5"/>
          <circle class="sd-pulse sd-pulse--ring" data-pulse-path="ring" r="5"/>
          ${nodeMarkup}
        </svg>
      </div>
      <div class="sd-panels" aria-live="polite">${panels}</div>
    </div>
  `;
}

function activate(root, slug) {
  root.querySelectorAll(".sd-node").forEach((n) => {
    n.classList.toggle("is-active", n.dataset.service === slug);
  });
  root.querySelectorAll(".sd-panel").forEach((p) => {
    const active = p.dataset.panel === slug;
    p.classList.toggle("is-active", active);
    p.hidden = !active;
  });
}

// Bewegt einen Punkt entlang eines SVG-Pfads (für die Datenimpulse).
function runPulse(dot, pathEl, { duration, reverse = false, delay = 0 }) {
  const length = pathEl.getTotalLength();
  return animate(0, 1, {
    duration,
    delay,
    repeat: Infinity,
    ease: "easeInOut",
    onUpdate: (t) => {
      const at = reverse ? 1 - t : t;
      const point = pathEl.getPointAtLength(at * length);
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
    },
  });
}

export function initSystemDiagram(main) {
  const root = main.querySelector(".system-diagram");
  if (!root) return;

  // Interaktion: Hover/Fokus/Tap auf einen Node zeigt dessen Text-Panel.
  root.querySelectorAll(".sd-node").forEach((node) => {
    const show = () => activate(root, node.dataset.service);
    node.addEventListener("pointerenter", show);
    node.addEventListener("focus", show);
    node.addEventListener("click", show);
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        show();
      }
    });
  });

  const svg = root.querySelector("svg");
  const ring = svg.querySelector(".sd-ring");
  const link = svg.querySelector(".sd-link");
  const nodes = svg.querySelectorAll(".sd-node");
  const pulses = svg.querySelectorAll(".sd-pulse");

  // Ohne Animationswunsch: fertiges Diagramm, keine Impulse.
  if (reducedMotion()) {
    pulses.forEach((p) => p.remove());
    return;
  }

  // Ausgangszustand (nur mit JS/Motion – ohne JS bleibt alles sichtbar).
  svg.classList.add("sd-animating");
  pulses.forEach((p) => (p.style.opacity = "0"));

  inView(
    root,
    () => {
      const pop = { type: spring, bounce: 0.45, duration: 0.7 };
      // 1. Fundament: Infrastruktur
      animate(nodes[0], { scale: [0, 1], opacity: [0, 1] }, { ...pop, delay: 0.1 });
      // 2. Verbindung zeichnet sich
      animate(link, { strokeDashoffset: [1, 0] }, { duration: 0.5, delay: 0.6, ease: "easeInOut" });
      // 3. Computing dockt an
      animate(nodes[1], { scale: [0, 1], opacity: [0, 1] }, { ...pop, delay: 1.0 });
      // 4. Sicherheit legt sich als Ring um das System
      animate(ring, { strokeDashoffset: [1, 0] }, { duration: 1.1, delay: 1.5, ease: "easeInOut" });
      animate(nodes[2], { scale: [0, 1], opacity: [0, 1] }, { ...pop, delay: 2.2 });
      // 5. Das System läuft: Datenimpulse
      animate(pulses, { opacity: 0.9 }, { duration: 0.4, delay: 2.8 });
      svg.querySelectorAll('[data-pulse-path="link"]').forEach((dot, i) => {
        runPulse(dot, link, { duration: 2.4, reverse: i % 2 === 1, delay: 2.8 });
      });
      svg.querySelectorAll('[data-pulse-path="ring"]').forEach((dot) => {
        runPulse(dot, ring, { duration: 10, delay: 2.8 });
      });
    },
    { amount: 0.35 }
  );
}
