import { inView } from "motion";
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";

const MINT     = "#2dd4a8";
const MINT_RGB = "45,212,168";
const C_BG     = "#061d16";

// Relative Node-Positionen (Anteil an Canvas-Breite/Höhe)
// Infrastruktur unten, Computing oben, IT-Sicherheit links
const NODES = [
  { slug: "it-infrastruktur", rx: 0.60, ry: 0.72, rScale: 0.115 },
  { slug: "computing",        rx: 0.60, ry: 0.23, rScale: 0.100 },
  { slug: "it-sicherheit",   rx: 0.20, ry: 0.50, rScale: 0.092 },
];

const EDGES        = [[0, 1], [0, 2], [1, 2]];
const PULSE_SPEED  = [0.19, 0.16, 0.22];
const ENTRY_DELAY  = [0.1,  0.45, 0.80];   // Sekunden, gestaffelt

let stopLoop = null;

// ── HTML ──────────────────────────────────────────────────────────────────────

export function systemDiagramCanvas() {
  const cards = NODES.map((nc) => {
    const s     = services.find((sv) => sv.slug === nc.slug);
    const short = s.system.length > 145 ? s.system.slice(0, 145) + "…" : s.system;
    return `
      <div class="sd3-card" data-node="${nc.slug}">
        <p class="kicker">${s.node.role}</p>
        <h3>${s.title}</h3>
        <p>${short}</p>
        <a class="text-link" href="/leistungen/${s.slug}/">Mehr zu ${s.title} →</a>
      </div>`;
  }).join("");

  return `
    <div class="sd3-wrap">
      <canvas class="sd3-canvas" aria-hidden="true"></canvas>
      <div class="sd3-cards" aria-label="Die drei Fachbereiche von Schwarzwald-IT">
        ${cards}
      </div>
    </div>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initSystemDiagramCanvas(main) {
  if (stopLoop) { stopLoop(); stopLoop = null; }

  const canvas = main.querySelector(".sd3-canvas");
  const wrap   = main.querySelector(".sd3-wrap");
  if (!canvas || !wrap) return;

  if (reducedMotion()) { canvas.style.display = "none"; return; }

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);

  // Canvas-Größe setzen (setzt auch Context-Transform zurück → re-scale)
  function resize() {
    const cw = Math.min(wrap.clientWidth, 860);
    const ch = Math.round(Math.min(490, Math.max(300, cw * 0.52)));
    canvas.width        = cw * dpr;
    canvas.height       = ch * dpr;
    canvas.style.width  = cw + "px";
    canvas.style.height = ch + "px";
    ctx.scale(dpr, dpr);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  const W = () => canvas.width  / dpr;
  const H = () => canvas.height / dpr;

  function geom(nc) {
    return {
      x: nc.rx   * W(),
      y: nc.ry   * H(),
      r: Math.min(W(), H()) * nc.rScale,
    };
  }

  // ── Zustand ───────────────────────────────────────────────────────
  const entrance   = [0, 0, 0];
  const pulseTimes = EDGES.map(() => Math.random());
  let   hovered    = -1;
  let   running    = true;
  let   lastTs     = null;
  let   elapsed    = 0;
  let   mx         = -9999;
  let   my         = -9999;

  const cardEls = main.querySelectorAll(".sd3-card");

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  canvas.addEventListener("pointerleave", () => { mx = my = -9999; });
  canvas.addEventListener("click", () => {
    if (hovered >= 0) {
      history.pushState({}, "", `/leistungen/${NODES[hovered].slug}/`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  });

  // ── Zeichenfunktionen ─────────────────────────────────────────────

  function drawGrid() {
    const w = W(), h = H(), step = 30;
    ctx.save();
    ctx.strokeStyle = `rgba(${MINT_RGB},0.045)`;
    ctx.lineWidth = 1;
    for (let x = step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  }

  // IT-Sicherheit: animierter Schutzring um alle drei Nodes
  function drawShield(alpha) {
    if (alpha <= 0) return;
    const cx = W() * 0.44;
    const cy = H() * 0.48;
    const rx = W() * 0.30;
    const ry = H() * 0.38;

    ctx.save();

    // Füllung (sehr subtil)
    const fill = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
    fill.addColorStop(0, `rgba(${MINT_RGB},0.055)`);
    fill.addColorStop(1, `rgba(${MINT_RGB},0)`);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();

    // Glow-Ring
    ctx.globalAlpha = alpha * 0.35;
    ctx.strokeStyle = MINT;
    ctx.lineWidth   = 9;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = 22;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Animierter Dash-Ring
    ctx.globalAlpha     = alpha * 0.65;
    ctx.strokeStyle     = MINT;
    ctx.lineWidth       = 1.6;
    ctx.setLineDash([11, 7]);
    ctx.lineDashOffset  = -elapsed * 20;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  // Verbindung zwischen zwei Nodes mit Pulse-Dot
  function drawEdge(aIdx, bIdx, pulseT, alpha) {
    if (alpha <= 0) return;
    const a = geom(NODES[aIdx]);
    const b = geom(NODES[bIdx]);

    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = MINT;
    ctx.lineWidth   = 1.4;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // Pulse-Punkt
    ctx.globalAlpha = alpha * 0.95;
    const px = a.x + (b.x - a.x) * pulseT;
    const py = a.y + (b.y - a.y) * pulseT;
    ctx.beginPath();
    ctx.arc(px, py, 3.8, 0, Math.PI * 2);
    ctx.fillStyle   = "#fff";
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // Node-Kreis mit Glow, Gradient, Labels
  function drawNode(nc, progress, isActive) {
    if (progress <= 0) return;
    const { x, y, r } = geom(nc);
    const s = services.find((sv) => sv.slug === nc.slug);
    const pulse = 0.68 + 0.32 * Math.sin(elapsed * 1.4 + NODES.indexOf(nc) * 2.1);

    ctx.save();
    ctx.globalAlpha = progress;

    // Halo
    const haloR = isActive ? r * 2.3 : r * 1.6;
    const halo  = ctx.createRadialGradient(x, y, r * 0.4, x, y, haloR);
    halo.addColorStop(0, `rgba(${MINT_RGB},${isActive ? 0.22 : 0.10 * pulse})`);
    halo.addColorStop(1, `rgba(${MINT_RGB},0)`);
    ctx.beginPath();
    ctx.arc(x, y, haloR, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Node-Körper
    const nr   = isActive ? r * 1.07 : r;
    const body = ctx.createRadialGradient(x - nr * 0.28, y - nr * 0.28, 0, x, y, nr);
    body.addColorStop(0, "#1e7558");
    body.addColorStop(1, "#071d14");
    ctx.beginPath();
    ctx.arc(x, y, nr, 0, Math.PI * 2);
    ctx.fillStyle   = body;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = isActive ? 36 : 14 + 8 * pulse;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rahmen
    ctx.beginPath();
    ctx.arc(x, y, nr, 0, Math.PI * 2);
    ctx.strokeStyle = isActive
      ? MINT
      : `rgba(${MINT_RGB},${0.42 + 0.38 * pulse})`;
    ctx.lineWidth = isActive ? 2.5 : 1.6;
    ctx.stroke();

    // Text: Titel (mehrzeilig bei Bindestrich-Namen)
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    const parts = s.title.split("-");
    const fs    = Math.max(11, Math.round(nr * 0.34));
    ctx.font      = `700 ${fs}px system-ui,sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 0;

    if (parts.length > 1) {
      ctx.fillText(parts[0] + "-",            x, y - fs * 0.68);
      ctx.fillText(parts.slice(1).join("-"),  x, y + fs * 0.68);
    } else {
      ctx.fillText(s.title, x, y);
    }

    // Rolle unter dem Node
    const rfs = Math.max(9, Math.round(nr * 0.24));
    ctx.font      = `${rfs}px system-ui,sans-serif`;
    ctx.fillStyle = `rgba(${MINT_RGB},0.82)`;
    ctx.fillText(s.node.role, x, y + r + rfs * 1.5);

    ctx.restore();
  }

  // ── Frame-Loop ────────────────────────────────────────────────────

  function frame(ts) {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
    lastTs    = ts;
    elapsed  += dt;

    // Hintergrund
    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W(), H());
    drawGrid();

    // Entrance-Fortschritt
    NODES.forEach((_, i) => {
      const t = elapsed - ENTRY_DELAY[i];
      entrance[i] = t > 0 ? Math.min(1, t / 0.8) : 0;
    });

    // Pulse-Positionen
    EDGES.forEach((_, i) => {
      pulseTimes[i] = (pulseTimes[i] + dt * PULSE_SPEED[i]) % 1;
    });

    // Hover-Erkennung
    let newHov = -1;
    NODES.forEach((nc, i) => {
      const { x, y, r } = geom(nc);
      const dx = mx - x, dy = my - y;
      if (dx * dx + dy * dy < (r * 1.3) ** 2) newHov = i;
    });
    if (newHov !== hovered) {
      hovered = newHov;
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      cardEls.forEach((c, i) => c.classList.toggle("is-active", i === hovered));
    }

    // Zeichenreihenfolge: Schild → Kanten → Nodes
    drawShield(entrance[2]);
    EDGES.forEach(([a, b], i) =>
      drawEdge(a, b, pulseTimes[i], Math.min(entrance[a], entrance[b]))
    );
    NODES.forEach((nc, i) => drawNode(nc, entrance[i], hovered === i));
  }

  // ── Start wenn sichtbar ───────────────────────────────────────────

  const stopInView = inView(wrap, () => {
    requestAnimationFrame(frame);
  }, { amount: 0.2 });

  stopLoop = () => {
    running = false;
    ro.disconnect();
    stopInView?.();
  };
}
