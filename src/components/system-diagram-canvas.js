// Variante 1: „Drei Zahnräder, die ineinandergreifen" (Canvas 2D).
// IT-Sicherheit ist das zentrale Zahnrad und kämmt 1:1 gegenläufig mit
// Infrastruktur (Fundament) und Computing (Arbeitsalltag).
// initGears(canvas, stage, cards) startet den Renderer und gibt eine stop()-Funktion
// zurück (Loop, Observer und Listener werden darin sauber abgeräumt).
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";
import { navigate } from "../router.js";
import { CYAN, RED, NODES, chipLabel, drawIcon } from "./sysdiag-shared.js";

const ENTRANCE_DELAY = [0.1, 0.45, 0.7];
const N_TEETH = 12;
const STEP = (Math.PI * 2) / N_TEETH;

function gearPath(ctx, cx, cy, R, rot, scale) {
  const m = (2 * R) / N_TEETH;
  const Rt = (R + 0.5 * m) * scale;
  const Rb = (R - 0.6 * m) * scale;
  const tw = STEP * 0.4;
  const vw = STEP * 0.4;
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

export function initGears(canvas, stage, cards) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let Wc = 0, Hc = 0, R = 0, geo = [];
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
    const S = { x: gx, y: gy - 1.067 * R };
    const I = { x: gx - 1.2 * R, y: gy + 0.533 * R };
    const C = { x: gx + 1.2 * R, y: gy + 0.533 * R };
    geo = [
      { x: S.x, y: S.y, dir: 1 },
      { x: I.x, y: I.y, alpha: Math.atan2(I.y - S.y, I.x - S.x) },
      { x: C.x, y: C.y, alpha: Math.atan2(C.y - S.y, C.x - S.x) },
    ];
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(stage);

  let hovered = -1, mx = -9999, my = -9999;
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

  const onMove = (e) => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; pickHover(); };
  const onLeave = () => { mx = my = -9999; pickHover(); };
  const onClick = () => { if (hovered >= 0) navigate(`/leistungen/${NODES[hovered].slug}/`); };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("click", onClick);
  const cardEnter = cards.map((card, i) => {
    const fn = () => { hovered = i; cards.forEach((c, j) => c.classList.toggle("is-active", j === i)); };
    card.addEventListener("pointerenter", fn);
    return fn;
  });
  const cardLeave = () => { hovered = -1; cards.forEach((c) => c.classList.remove("is-active")); };
  cards.forEach((c) => c.addEventListener("pointerleave", cardLeave));

  function rotationFor(i, rotS) {
    if (i === 0) return rotS;
    return -rotS + (2 * geo[i].alpha + Math.PI - STEP / 2);
  }

  function drawGear(i, rot, entrance, active) {
    const g = geo[i];
    const slug = NODES[i].slug;
    const scale = entrance < 1 ? 1 - Math.exp(-7 * entrance) * Math.cos(9 * entrance) : 1;
    const sc = Math.min(scale, 1.04);
    const col = active ? RED : CYAN;
    ctx.save();
    ctx.globalAlpha = Math.min(entrance * 1.6, 1);

    const halo = ctx.createRadialGradient(g.x, g.y, R * 0.3 * sc, g.x, g.y, R * 1.5 * sc);
    halo.addColorStop(0, `rgba(${col},${active ? 0.16 : 0.07})`);
    halo.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(g.x, g.y, R * 1.5 * sc, 0, Math.PI * 2);
    ctx.fill();

    gearPath(ctx, g.x, g.y, R, rot, sc);
    const body = ctx.createRadialGradient(g.x - R * 0.3, g.y - R * 0.3, 0, g.x, g.y, R * sc);
    body.addColorStop(0, active ? "#1b1115" : "#101725");
    body.addColorStop(1, "#06080f");
    ctx.fillStyle = body;
    ctx.shadowColor = `rgba(${col},0.5)`;
    ctx.shadowBlur = active ? 26 : 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    gearPath(ctx, g.x, g.y, R, rot, sc);
    ctx.strokeStyle = `rgba(${col},${active ? 0.95 : 0.55})`;
    ctx.lineWidth = active ? 2.2 : 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(g.x, g.y, R * 0.5 * sc, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${col},0.32)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (entrance > 0.6) {
      ctx.globalAlpha = Math.min((entrance - 0.6) / 0.4, 1);
      drawIcon(ctx, slug, g.x, g.y - R * 0.04, R * 0.34, `rgba(${col},0.95)`);
    }
    ctx.restore();
  }

  function label(i, entrance, active) {
    const g = geo[i];
    const svc = services.find((s) => s.slug === NODES[i].slug);
    const scale = entrance < 1 ? 1 - Math.exp(-7 * entrance) * Math.cos(9 * entrance) : 1;
    const sc = Math.min(scale, 1.04);
    chipLabel(ctx, {
      x: g.x, y: g.y, nodeR: R * 1.12 * sc, Wc,
      title: svc.title, role: svc.node.role,
      active, above: NODES[i].role === "center", entrance,
    });
  }

  function drawMeshSpark(i, t, alpha) {
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

  let raf, running = true, last = null, elapsed = 0, started = false, io;
  const omega = 0.4;

  function renderStatic() {
    ctx.clearRect(0, 0, Wc, Hc);
    [1, 2].forEach((i) => drawMeshSpark(i, 0, 1));
    drawGear(1, rotationFor(1, 0), 1, false);
    drawGear(2, rotationFor(2, 0), 1, false);
    drawGear(0, 0, 1, false);
    [0, 1, 2].forEach((i) => label(i, 1, false));
  }

  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts;
    elapsed += dt;
    ctx.clearRect(0, 0, Wc, Hc);
    const rotS = elapsed * omega;
    const ent = (i) => Math.max(0, Math.min(1, (elapsed - ENTRANCE_DELAY[i]) / 0.8));
    [1, 2].forEach((i) => drawMeshSpark(i, elapsed, Math.min(ent(0), ent(i))));
    drawGear(1, rotationFor(1, rotS), ent(1), hovered === 1);
    drawGear(2, rotationFor(2, rotS), ent(2), hovered === 2);
    drawGear(0, rotationFor(0, rotS), ent(0), hovered === 0);
    label(1, ent(1), hovered === 1);
    label(2, ent(2), hovered === 2);
    label(0, ent(0), hovered === 0);
  }

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io?.disconnect();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("click", onClick);
    cards.forEach((c, i) => { c.removeEventListener("pointerenter", cardEnter[i]); c.removeEventListener("pointerleave", cardLeave); c.classList.remove("is-active"); });
    canvas.style.cursor = "default";
  };

  if (reducedMotion()) {
    renderStatic();
    return stop;
  }

  const start = () => { if (started) return; started = true; raf = requestAnimationFrame(frame); };
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && start()), { threshold: 0.15 });
    io.observe(stage);
  } else {
    start();
  }
  return stop;
}
