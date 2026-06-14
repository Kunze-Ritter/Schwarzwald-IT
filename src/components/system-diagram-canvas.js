// „Drei Zahnräder, die ineinandergreifen" — Canvas-2D-Visualisierung der drei
// Fachbereiche (PPT „Vorstellung Schwarzwald-IT"). IT-Sicherheit ist das zentrale
// Zahnrad und greift in Infrastruktur (Fundament) und Computing (Arbeitsalltag).
// Die Räder kämmen physikalisch korrekt (1:1, gegenläufig) und drehen gemeinsam.
// v3-Look: Cyan = Daten/Verzahnung, Rot = aktiver/gehoverter Bereich.
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";
import { onCleanup } from "../lib/lifecycle.js";
import { navigate } from "../router.js";

const CYAN = "43,182,240";
const RED = "227,6,19";

// Reihenfolge: [0] Zentrum (IT-Sicherheit), [1] links (Infrastruktur), [2] rechts (Computing)
const NODES = [
  { slug: "it-sicherheit", role: "center" },
  { slug: "it-infrastruktur", role: "left" },
  { slug: "computing", role: "right" },
];
const ENTRANCE_DELAY = [0.1, 0.45, 0.7];

const N_TEETH = 12;
const STEP = (Math.PI * 2) / N_TEETH;

export function systemDiagramCanvas() {
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
      <div class="gears__stage">
        <canvas class="gears__canvas" role="img"
          aria-label="Diagramm: Infrastruktur, IT-Sicherheit und Computing greifen wie Zahnräder ineinander"></canvas>
      </div>
      <div class="gears__cards">${cards}</div>
    </div>`;
}

// ── Zahnrad-Geometrie ───────────────────────────────────────────────────────
function gearPath(ctx, cx, cy, R, rot, scale) {
  const m = (2 * R) / N_TEETH;        // Modul
  const Rt = (R + 0.5 * m) * scale;   // Kopfkreis
  const Rb = (R - 0.6 * m) * scale;   // Fußkreis
  const tw = STEP * 0.40;             // Zahnkopf-Breite
  const vw = STEP * 0.40;             // Lückengrund-Breite
  ctx.beginPath();
  for (let k = 0; k < N_TEETH; k++) {
    const c = rot + k * STEP;
    pt(ctx, cx, cy, c - tw / 2, Rt, k === 0);
    pt(ctx, cx, cy, c + tw / 2, Rt);
    pt(ctx, cx, cy, c + STEP / 2 - vw / 2, Rb);
    pt(ctx, cx, cy, c + STEP / 2 + vw / 2, Rb);
  }
  ctx.closePath();
}
function pt(ctx, cx, cy, a, r, move) {
  const x = cx + Math.cos(a) * r;
  const y = cy + Math.sin(a) * r;
  move ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
}

// ── Hub-Icons (cyan/rot), gezeichnet im statischen Nabenbereich ──────────────
function drawIcon(ctx, slug, cx, cy, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6 * (s / 22);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (slug === "it-infrastruktur") {
    // Server-Stack
    const w = s * 1.1, x = cx - w / 2;
    [-0.42, 0, 0.42].forEach((o) => {
      const y = cy + o * s;
      roundRect(ctx, x, y - 0.16 * s, w, 0.32 * s, 0.06 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w - 0.16 * s, y, 0.06 * s, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (slug === "computing") {
    // Monitor
    const w = s * 1.2, h = s * 0.8;
    roundRect(ctx, cx - w / 2, cy - h / 2 - 0.1 * s, w, h, 0.08 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + h / 2 - 0.1 * s);
    ctx.lineTo(cx, cy + h / 2 + 0.16 * s);
    ctx.moveTo(cx - 0.3 * s, cy + h / 2 + 0.16 * s);
    ctx.lineTo(cx + 0.3 * s, cy + h / 2 + 0.16 * s);
    ctx.stroke();
  } else {
    // Schild mit Haken (IT-Sicherheit)
    const r = s * 0.62;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.82, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.82, cy + r * 0.1);
    ctx.bezierCurveTo(cx + r * 0.82, cy + r * 0.7, cx, cy + r, cx, cy + r);
    ctx.bezierCurveTo(cx, cy + r, cx - r * 0.82, cy + r * 0.7, cx - r * 0.82, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.82, cy - r * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 2.2 * (s / 22);
    ctx.moveTo(cx - r * 0.32, cy + r * 0.05);
    ctx.lineTo(cx - r * 0.05, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.4, cy - r * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function initSystemDiagramCanvas(main) {
  const canvas = main.querySelector(".gears__canvas");
  const stage = main.querySelector(".gears__stage");
  if (!canvas || !stage) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cards = [...main.querySelectorAll(".gear-card")];

  let Wc = 0, Hc = 0, R = 0;
  let geo = []; // [{x,y,dir}]

  function layout() {
    Wc = stage.clientWidth;
    Hc = Math.round(Wc * 0.95);
    canvas.width = Wc * dpr;
    canvas.height = Hc * dpr;
    canvas.style.width = Wc + "px";
    canvas.style.height = Hc + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    R = Wc * 0.155;
    const gx = Wc / 2, gy = Hc * 0.56;
    // relative Positionen (Schwerpunkt = 0): Zentrum oben, zwei Räder unten
    const S = { x: gx, y: gy - 1.067 * R };
    const I = { x: gx - 1.2 * R, y: gy + 0.533 * R };
    const C = { x: gx + 1.2 * R, y: gy + 0.533 * R };
    const aI = Math.atan2(I.y - S.y, I.x - S.x);
    const aC = Math.atan2(C.y - S.y, C.x - S.x);
    geo = [
      { x: S.x, y: S.y, dir: 1 },                 // Zentrum (Treiber)
      { x: I.x, y: I.y, alpha: aI },              // links
      { x: C.x, y: C.y, alpha: aC },              // rechts
    ];
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(stage);

  let hovered = -1;
  let mx = -9999, my = -9999;

  function pickHover() {
    let found = -1, min = Infinity;
    geo.forEach((g, i) => {
      const d = Math.hypot(mx - g.x, my - g.y);
      if (d < R * 1.05 && d < min) { min = d; found = i; }
    });
    if (found !== hovered) {
      hovered = found;
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      cards.forEach((c, i) => c.classList.toggle("is-active", i === hovered));
    }
  }

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    pickHover();
  });
  canvas.addEventListener("pointerleave", () => { mx = my = -9999; pickHover(); });
  canvas.addEventListener("click", () => {
    if (hovered >= 0) navigate(`/leistungen/${NODES[hovered].slug}/`);
  });
  // Karten ↔ Räder verknüpfen
  cards.forEach((card, i) => {
    card.addEventListener("pointerenter", () => {
      hovered = i;
      cards.forEach((c, j) => c.classList.toggle("is-active", j === i));
    });
    card.addEventListener("pointerleave", () => {
      hovered = -1;
      cards.forEach((c) => c.classList.remove("is-active"));
    });
  });

  function rotationFor(i, rotS) {
    if (i === 0) return rotS;
    return -rotS + (2 * geo[i].alpha + Math.PI - STEP / 2);
  }

  function drawGear(i, rot, entrance, active) {
    const g = geo[i];
    const slug = NODES[i].slug;
    const scale = entrance < 1
      ? 1 - Math.exp(-7 * entrance) * Math.cos(9 * entrance)
      : 1;
    const sc = Math.min(scale, 1.04);
    const col = active ? RED : CYAN;
    ctx.save();
    ctx.globalAlpha = Math.min(entrance * 1.6, 1);

    // Glow-Halo
    const halo = ctx.createRadialGradient(g.x, g.y, R * 0.3 * sc, g.x, g.y, R * 1.5 * sc);
    halo.addColorStop(0, `rgba(${col},${active ? 0.16 : 0.07})`);
    halo.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(g.x, g.y, R * 1.5 * sc, 0, Math.PI * 2);
    ctx.fill();

    // Zahnrad-Körper
    gearPath(ctx, g.x, g.y, R, rot, sc);
    const body = ctx.createRadialGradient(g.x - R * 0.3, g.y - R * 0.3, 0, g.x, g.y, R * sc);
    body.addColorStop(0, active ? "#1b1115" : "#101725");
    body.addColorStop(1, "#06080f");
    ctx.fillStyle = body;
    ctx.shadowColor = `rgba(${col},0.5)`;
    ctx.shadowBlur = active ? 26 : 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Zahnrad-Rand
    gearPath(ctx, g.x, g.y, R, rot, sc);
    ctx.strokeStyle = `rgba(${col},${active ? 0.95 : 0.55})`;
    ctx.lineWidth = active ? 2.2 : 1.5;
    ctx.stroke();

    // statische Nabe + Bohrung
    ctx.beginPath();
    ctx.arc(g.x, g.y, R * 0.5 * sc, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${col},0.32)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Icon (statisch, dreht nicht mit)
    if (entrance > 0.6) {
      ctx.globalAlpha = Math.min((entrance - 0.6) / 0.4, 1);
      drawIcon(ctx, slug, g.x, g.y - R * 0.04, R * 0.34, `rgba(${col},0.95)`);
    }
    ctx.restore();
  }

  // Label als Chip – zentrales Zahnrad oberhalb, äußere unterhalb (kein Eingriffs-Overlap).
  function drawLabel(i, entrance, active) {
    const g = geo[i];
    const svc = services.find((s) => s.slug === NODES[i].slug);
    const col = active ? RED : CYAN;
    const scale = entrance < 1 ? 1 - Math.exp(-7 * entrance) * Math.cos(9 * entrance) : 1;
    const sc = Math.min(scale, 1.04);
    const tfs = Math.max(13, R * 0.16);
    const rfs = tfs * 0.72;
    const gap = R * 0.2;
    const above = NODES[i].role === "center";

    ctx.save();
    ctx.globalAlpha = Math.min(entrance * 1.8, 1);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.font = `500 ${tfs}px "Overused Grotesk", system-ui, sans-serif`;
    const tw = ctx.measureText(svc.title).width;
    ctx.font = `${rfs}px "Geist Mono", ui-monospace, monospace`;
    const rw = ctx.measureText(svc.node.role).width;

    const padX = tfs * 0.8, padY = tfs * 0.55, lineGap = tfs * 0.5;
    const chipW = Math.max(tw, rw) + padX * 2;
    const chipH = tfs + lineGap + rfs + padY * 2;
    const edge = above ? g.y - R * sc - gap : g.y + R * sc + gap;
    const chipY = above ? edge - chipH : edge;
    const chipX = g.x - chipW / 2;

    ctx.beginPath();
    ctx.roundRect(chipX, chipY, chipW, chipH, 7);
    ctx.fillStyle = "rgba(6,9,16,0.82)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${col},${active ? 0.5 : 0.18})`;
    ctx.stroke();

    const titleBase = chipY + padY + tfs;
    ctx.font = `500 ${tfs}px "Overused Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = active ? `rgba(${col},1)` : "#fff";
    ctx.fillText(svc.title, g.x, titleBase);
    ctx.font = `${rfs}px "Geist Mono", ui-monospace, monospace`;
    ctx.fillStyle = `rgba(${CYAN},0.85)`;
    ctx.fillText(svc.node.role, g.x, titleBase + lineGap + rfs);
    ctx.restore();
  }

  function drawMeshSpark(i, t, alpha) {
    // Funke am Kämm-Punkt zwischen Zentrum und Außenrad
    const S = geo[0], O = geo[i];
    const px = S.x + (O.x - S.x) * 0.5;
    const py = S.y + (O.y - S.y) * 0.5;
    const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i);
    ctx.save();
    ctx.globalAlpha = alpha * (0.3 + 0.4 * pulse);
    const gl = ctx.createRadialGradient(px, py, 0, px, py, R * 0.28);
    gl.addColorStop(0, `rgba(${CYAN},0.9)`);
    gl.addColorStop(1, `rgba(${CYAN},0)`);
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(px, py, R * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Statisch (reduced motion) ─────────────────────────────────────────────
  if (reducedMotion()) {
    ctx.clearRect(0, 0, Wc, Hc);
    [1, 2].forEach((i) => drawMeshSpark(i, 0, 1));
    drawGear(1, rotationFor(1, 0), 1, false);
    drawGear(2, rotationFor(2, 0), 1, false);
    drawGear(0, 0, 1, false);
    [0, 1, 2].forEach((i) => drawLabel(i, 1, false));
    onCleanup(() => ro.disconnect());
    return;
  }

  // ── Animations-Loop ───────────────────────────────────────────────────────
  let raf, running = true, last = null, elapsed = 0, started = false;
  const omega = 0.4;

  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts;
    elapsed += dt;

    ctx.clearRect(0, 0, Wc, Hc);
    const rotS = elapsed * omega;
    const ent = (i) => Math.max(0, Math.min(1, (elapsed - ENTRANCE_DELAY[i]) / 0.8));

    // Kämm-Funken (nur wenn beide Räder weit genug eingeblendet)
    [1, 2].forEach((i) => drawMeshSpark(i, elapsed, Math.min(ent(0), ent(i))));
    // Außenräder zuerst, Zentrum oben drauf
    drawGear(1, rotationFor(1, rotS), ent(1), hovered === 1);
    drawGear(2, rotationFor(2, rotS), ent(2), hovered === 2);
    drawGear(0, rotationFor(0, rotS), ent(0), hovered === 0);
    drawLabel(1, ent(1), hovered === 1);
    drawLabel(2, ent(2), hovered === 2);
    drawLabel(0, ent(0), hovered === 0);
  }

  // Erst starten, wenn der Block in den Viewport scrollt.
  let io;
  const start = () => {
    if (started) return;
    started = true;
    raf = requestAnimationFrame(frame);
  };
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.15 }
    );
    io.observe(stage);
  } else {
    start();
  }

  onCleanup(() => {
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io?.disconnect();
  });
}
