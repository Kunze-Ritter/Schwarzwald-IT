import { inView } from "motion";
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";

const MINT     = "#2dd4a8";
const MINT_RGB = "45,212,168";
const C_BG     = "#061d16";
const C_WHITE  = "#ffffff";

// Dreieck-Layout: Infra erscheint zuerst (Fundament), dann Computing, dann IT-Sicherheit
const NODES = [
  { slug: "it-infrastruktur", tx: 0.22, ty: 0.68 }, // unten links
  { slug: "computing",        tx: 0.78, ty: 0.68 }, // unten rechts
  { slug: "it-sicherheit",   tx: 0.50, ty: 0.20 }, // oben mittig
];
const EDGES       = [[0, 1], [0, 2], [1, 2]]; // alle verbunden
const NODE_DELAYS = [0.10, 0.40, 0.80];        // Entrance pro Node
const LINE_DELAY  = 1.05;                       // Linien nach den Nodes

let stopLoop = null;

// ── HTML ──────────────────────────────────────────────────────────────────────

export function systemDiagramCanvas() {
  const cards = NODES.map(({ slug }) => {
    const s     = services.find(sv => sv.slug === slug);
    const short = s.system.length > 145 ? s.system.slice(0, 145) + "…" : s.system;
    return `
      <div class="sd3-card" data-node="${slug}">
        <p class="kicker">${s.node.role}</p>
        <h3>${s.title}</h3>
        <p>${short}</p>
        <a class="text-link" href="/leistungen/${slug}/">Mehr zu ${s.title} →</a>
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

// ── Icons (cx/cy = Mittelpunkt, size ≈ 40 CSS-px) ────────────────────────────

function iconServer(ctx, cx, cy, size) {
  const s = size / 40;
  const x = cx - 20 * s;
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.5 * s;
  [cy - 16*s, cy - 4*s, cy + 8*s].forEach(y => {
    ctx.beginPath();
    ctx.roundRect(x, y, 40*s, 10*s, 2*s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 35*s, y + 5*s, 2.2*s, 0, Math.PI * 2);
    ctx.fillStyle = MINT;
    ctx.fill();
  });
}

function iconMonitor(ctx, cx, cy, size) {
  const s = size / 40;
  const x = cx - 20*s, y = cy - 17*s;
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.5 * s;
  ctx.beginPath(); ctx.roundRect(x, y, 40*s, 26*s, 3*s); ctx.stroke();
  ctx.strokeStyle = `rgba(${MINT_RGB},0.35)`;
  ctx.lineWidth   = 1 * s;
  [y+5*s, y+10*s, y+15*s].forEach(ly => {
    ctx.beginPath();
    ctx.moveTo(x + 4*s, ly);
    ctx.lineTo(x + (ly === y+15*s ? 20*s : 34*s), ly);
    ctx.stroke();
  });
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.5 * s;
  ctx.beginPath(); ctx.moveTo(cx, y+26*s); ctx.lineTo(cx, y+34*s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-11*s, y+34*s); ctx.lineTo(cx+11*s, y+34*s); ctx.stroke();
}

function iconShield(ctx, cx, cy, size) {
  const s = size / 36;
  ctx.beginPath();
  ctx.moveTo(cx,        cy - 17*s);
  ctx.lineTo(cx + 15*s, cy - 11*s);
  ctx.lineTo(cx + 15*s, cy + 2*s);
  ctx.bezierCurveTo(cx+15*s, cy+13*s, cx, cy+17*s, cx, cy+17*s);
  ctx.bezierCurveTo(cx, cy+17*s, cx-15*s, cy+13*s, cx-15*s, cy+2*s);
  ctx.lineTo(cx - 15*s, cy - 11*s);
  ctx.closePath();
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.5 * s;
  ctx.stroke();
  // Haken
  ctx.beginPath();
  ctx.moveTo(cx - 6*s, cy + 1*s);
  ctx.lineTo(cx - 1*s, cy + 6*s);
  ctx.lineTo(cx + 8*s, cy - 5*s);
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 2 * s;
  ctx.lineJoin    = "round";
  ctx.lineCap     = "round";
  ctx.stroke();
}

const ICON_MAP = {
  "it-infrastruktur": iconServer,
  "computing":        iconMonitor,
  "it-sicherheit":   iconShield,
};

// ── Canvas-Logik ──────────────────────────────────────────────────────────────

export function initSystemDiagramCanvas(main) {
  if (stopLoop) { stopLoop(); stopLoop = null; }

  const canvas = main.querySelector(".sd3-canvas");
  const wrap   = main.querySelector(".sd3-wrap");
  if (!canvas || !wrap) return;

  if (reducedMotion()) { canvas.style.display = "none"; return; }

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);

  function resize() {
    const cw = Math.min(wrap.clientWidth, 860);
    const ch = Math.round(Math.min(480, Math.max(340, cw * 0.52)));
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

  // Hexagon-Radius abhängig von Canvas-Größe
  const nodeR = () => Math.min(W(), H()) * 0.125;

  // Node-Position in Canvas-Pixeln
  function pos(n) {
    return { x: n.tx * W(), y: n.ty * H() };
  }

  // Hexagon-Pfad (pointy-top, rotation = 0 → erste Ecke oben)
  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2; // erste Ecke oben
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // ── Zustand ────────────────────────────────────────────────────────
  const entrance   = NODES.map(() => 0);
  const pulseTimes = EDGES.map(() => Math.random());
  let   lineP      = 0;    // Entrance-Fortschritt für Linien
  let   hovered    = -1;
  let   running    = true;
  let   lastTs     = null;
  let   elapsed    = 0;
  let   mx = -9999, my = -9999;

  const cardEls = main.querySelectorAll(".sd3-card");

  canvas.addEventListener("pointermove", e => {
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

  // ── Zeichenfunktionen ──────────────────────────────────────────────

  function drawEdge(aIdx, bIdx, pulseT, alpha) {
    if (alpha <= 0) return;
    const a  = pos(NODES[aIdx]);
    const b  = pos(NODES[bIdx]);
    const r  = nodeR();
    // Linie von Rand zu Rand (nicht Mittelpunkt zu Mittelpunkt)
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = dx / dist, ny = dy / dist;
    const x1 = a.x + nx * r * 1.05;
    const y1 = a.y + ny * r * 1.05;
    const x2 = b.x - nx * r * 1.05;
    const y2 = b.y - ny * r * 1.05;

    ctx.save();
    ctx.globalAlpha = alpha * 0.45;

    // Linie mit Gradient
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, `rgba(${MINT_RGB},0.8)`);
    grad.addColorStop(0.5, `rgba(${MINT_RGB},0.5)`);
    grad.addColorStop(1, `rgba(${MINT_RGB},0.8)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Pulse-Punkt entlang der Linie
    ctx.globalAlpha = alpha * 0.9;
    const px = x1 + (x2 - x1) * pulseT;
    const py = y1 + (y2 - y1) * pulseT;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle   = C_WHITE;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  function drawNode(idx, progress, isActive) {
    if (progress <= 0) return;
    const n   = NODES[idx];
    const { x, y } = pos(n);
    const r   = nodeR();
    const svc = services.find(sv => sv.slug === n.slug);
    const isShield = n.slug === "it-sicherheit";

    // Spring-Skalierung: Overshoot beim Einblenden
    const t     = Math.min(progress * 1.2, 1);
    const scale = progress < 1
      ? 1 - Math.exp(-7 * progress) * Math.cos(9 * progress)
      : 1;
    const displayR = r * Math.min(scale, 1.04);

    const pulse = 0.65 + 0.35 * Math.sin(elapsed * 1.3 + idx * 2.0);

    ctx.save();
    ctx.globalAlpha = Math.min(progress * 1.8, 1);

    // ── Äußerer Schutzring für IT-Sicherheit ──────────────────────
    if (isShield) {
      ctx.globalAlpha = Math.min(progress * 1.5, 1) * (0.4 + 0.2 * pulse);
      hexPath(x, y, displayR * 1.45);
      ctx.strokeStyle    = MINT;
      ctx.lineWidth      = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -elapsed * 18;
      ctx.shadowColor    = MINT;
      ctx.shadowBlur     = 10;
      ctx.stroke();
      ctx.shadowBlur     = 0;
      ctx.setLineDash([]);
    }

    // ── Glow-Halo ─────────────────────────────────────────────────
    ctx.globalAlpha = Math.min(progress * 1.5, 1);
    const haloR = isActive ? displayR * 1.85 : displayR * 1.45;
    const halo  = ctx.createRadialGradient(x, y, displayR * 0.4, x, y, haloR);
    halo.addColorStop(0, `rgba(${MINT_RGB},${isActive ? 0.20 : 0.08 * pulse})`);
    halo.addColorStop(1, `rgba(${MINT_RGB},0)`);
    hexPath(x, y, haloR);
    ctx.fillStyle = halo;
    ctx.fill();

    // ── Hexagon-Körper ─────────────────────────────────────────────
    ctx.globalAlpha = Math.min(progress * 1.8, 1);
    const body = ctx.createRadialGradient(
      x - displayR * 0.3, y - displayR * 0.3, 0,
      x, y, displayR
    );
    body.addColorStop(0, isActive ? "#205c44" : "#112e22");
    body.addColorStop(1, "#061610");

    hexPath(x, y, displayR);
    ctx.fillStyle   = body;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = isActive ? 32 : 10 + 8 * pulse;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // ── Hexagon-Rahmen ─────────────────────────────────────────────
    hexPath(x, y, displayR);
    ctx.strokeStyle = isActive
      ? MINT
      : `rgba(${MINT_RGB},${0.45 + 0.35 * pulse})`;
    ctx.lineWidth   = isActive ? 2.5 : 1.6;
    ctx.stroke();

    // ── Icon ───────────────────────────────────────────────────────
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = isActive ? 18 : 8;
    ICON_MAP[n.slug](ctx, x, y - displayR * 0.08, displayR * 0.7);
    ctx.shadowBlur  = 0;

    // ── Label außerhalb (unter dem Node) ──────────────────────────
    ctx.globalAlpha  = Math.min(progress * 2, 1);
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    const labelY     = y + displayR + 10;
    const titleFS    = Math.max(11, Math.min(15, displayR * 0.3));
    const roleFS     = Math.max(9,  Math.min(12, displayR * 0.22));

    ctx.font      = `700 ${titleFS}px system-ui,sans-serif`;
    ctx.fillStyle = isActive ? MINT : C_WHITE;
    ctx.fillText(svc.title, x, labelY);

    ctx.font      = `${roleFS}px system-ui,sans-serif`;
    ctx.fillStyle = `rgba(${MINT_RGB},0.75)`;
    ctx.fillText(svc.node.role, x, labelY + titleFS + 3);

    ctx.restore();
  }

  // ── Frame-Loop ─────────────────────────────────────────────────────

  function frame(ts) {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
    lastTs   = ts;
    elapsed += dt;

    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W(), H());

    // Entrance-Fortschritt
    NODES.forEach((_, i) => {
      const t = elapsed - NODE_DELAYS[i];
      entrance[i] = t > 0 ? Math.min(1, t / 0.85) : 0;
    });
    const lt = elapsed - LINE_DELAY;
    lineP     = lt > 0 ? Math.min(1, lt / 0.6) : 0;

    // Pulse-Dots
    EDGES.forEach((_, i) => {
      pulseTimes[i] = (pulseTimes[i] + dt * (0.16 + i * 0.03)) % 1;
    });

    // Hover: nächstgelegener Node im Trefferradius
    let newHov = -1;
    let minD   = Infinity;
    NODES.forEach((n, i) => {
      const { x, y } = pos(n);
      const r = nodeR() * 1.1;
      const d = Math.hypot(mx - x, my - y);
      if (d < r && d < minD) { minD = d; newHov = i; }
    });
    if (newHov !== hovered) {
      hovered = newHov;
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      cardEls.forEach((c, i) => c.classList.toggle("is-active", i === hovered));
    }

    // Zeichenreihenfolge: Kanten → Nodes
    EDGES.forEach(([a, b], i) =>
      drawEdge(a, b, pulseTimes[i], lineP * Math.min(entrance[a], entrance[b]))
    );
    NODES.forEach((_, i) => drawNode(i, entrance[i], hovered === i));
  }

  const stopInView = inView(wrap, () => {
    requestAnimationFrame(frame);
  }, { amount: 0.2 });

  stopLoop = () => {
    running = false;
    ro.disconnect();
    stopInView?.();
  };
}
