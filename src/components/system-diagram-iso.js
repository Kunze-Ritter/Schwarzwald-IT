// Variante 4: Isometrisches Server-Setup (Canvas 2D).
// Drei isometrische Blöcke (Server = Infrastruktur, Schild = IT-Sicherheit,
// Monitor = Computing) auf einer Ebene, verbunden durch Leitungen, über die
// cyan Lichtpulse laufen. initIso(canvas, stage, cards) -> stop().
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";
import { navigate } from "../router.js";
import { CYAN, RED, NODES, chipLabel, drawIcon } from "./sysdiag-shared.js";

// Grundpositionen (Tile-Einheiten): Sicherheit hinten-Mitte, Infra vorne-links, Computing vorne-rechts
const GROUND = [
  { gx: 0, gy: 0 },      // 0 IT-Sicherheit
  { gx: 0, gy: 1.7 },    // 1 Infrastruktur
  { gx: 1.7, gy: 0 },    // 2 Computing
];
const EDGES = [[0, 1], [0, 2], [1, 2]];
const ENT = [0.1, 0.4, 0.6];

export function initIso(canvas, stage, cards) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let Wc = 0, Hc = 0, tile = 0, ox = 0, oy = 0, h = 0, hs = 0.6;
  function layout() {
    Wc = stage.clientWidth;
    Hc = Math.round(Wc * 0.82);
    canvas.width = Wc * dpr;
    canvas.height = Hc * dpr;
    canvas.style.width = Wc + "px";
    canvas.style.height = Hc + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tile = Wc * 0.155;
    h = Wc * 0.11;
    ox = Wc * 0.5;
    oy = Hc * 0.46;
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(stage);

  const P = (x, y, z) => ({ x: ox + (x - y) * tile, y: oy + (x + y) * tile * 0.5 - z });
  const center = (i, z = 0) => P(GROUND[i].gx, GROUND[i].gy, z);

  let hovered = -1, mx = -9999, my = -9999;
  function pickHover() {
    let found = -1, min = Infinity;
    GROUND.forEach((_, i) => {
      const c = center(i, h * 0.5);
      const d = Math.hypot(mx - c.x, my - c.y);
      if (d < tile * 1.05 && d < min) { min = d; found = i; }
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

  const ent = (i, el) => Math.max(0, Math.min(1, (el - ENT[i]) / 0.75));
  const packets = EDGES.flatMap((_, e) => [0, 0.5].map((p) => ({ e, t: p })));

  function poly(pts, fill, stroke, lw) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.2; ctx.stroke(); }
  }

  function drawBox(i, el) {
    const e = ent(i, el);
    if (e <= 0) return;
    const active = hovered === i;
    const col = active ? RED : CYAN;
    const { gx, gy } = GROUND[i];
    const eased = e < 1 ? 1 - Math.exp(-7 * e) * Math.cos(9 * e) : 1;
    const bh = h * Math.min(eased, 1.04);

    ctx.save();
    ctx.globalAlpha = Math.min(e * 1.6, 1);
    // Boden-Schatten/Glow
    const c0 = P(gx, gy, 0);
    const gl = ctx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, tile * 1.4);
    gl.addColorStop(0, `rgba(${col},${active ? 0.18 : 0.08})`);
    gl.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.ellipse(c0.x, c0.y, tile * 1.3, tile * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    const F = [gx + hs, gy + hs], L = [gx - hs, gy + hs], R = [gx + hs, gy - hs], B = [gx - hs, gy - hs];
    const edge = `rgba(${col},${active ? 0.9 : 0.5})`;
    // linke Seitenfläche
    poly([P(...L, 0), P(...F, 0), P(...F, bh), P(...L, bh)], "rgba(7,10,18,0.94)", edge, 1.2);
    // rechte Seitenfläche
    poly([P(...F, 0), P(...R, 0), P(...R, bh), P(...F, bh)], "rgba(13,19,31,0.94)", edge, 1.2);
    // Deckfläche
    poly([P(...B, bh), P(...L, bh), P(...F, bh), P(...R, bh)], active ? "rgba(40,17,21,0.96)" : "rgba(17,27,44,0.96)", edge, 1.2);

    // Icon schwebend über dem Block
    if (e > 0.55) {
      ctx.globalAlpha = Math.min((e - 0.55) / 0.45, 1);
      const top = P(gx, gy, bh + tile * 0.05);
      drawIcon(ctx, NODES[i].slug, top.x, top.y, tile * 0.42, `rgba(${col},0.98)`);
    }
    ctx.restore();
  }

  function drawEdges(el) {
    EDGES.forEach(([a, b]) => {
      const alpha = Math.min(ent(a, el), ent(b, el));
      if (alpha <= 0.02) return;
      const hot = hovered === a || hovered === b;
      const A = center(a, 0), B = center(b, 0);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = hot ? `rgba(${RED},0.45)` : `rgba(${CYAN},0.22)`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([1, 7]);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawPackets(el) {
    packets.forEach((pk) => {
      const [a, b] = EDGES[pk.e];
      const alpha = Math.min(ent(a, el), ent(b, el));
      if (alpha <= 0.05) return;
      const t = pk.t % 1;
      const ga = GROUND[a], gb = GROUND[b];
      const p = P(ga.gx + (gb.gx - ga.gx) * t, ga.gy + (gb.gy - ga.gy) * t, 0);
      const hot = hovered === a || hovered === b;
      const col = hot ? RED : CYAN;
      ctx.save();
      ctx.globalAlpha = alpha;
      const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, tile * 0.12);
      gl.addColorStop(0, `rgba(${col},0.95)`);
      gl.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(p.x, p.y, tile * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, tile * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function label(i, el) {
    const svc = services.find((s) => s.slug === NODES[i].slug);
    const top = P(GROUND[i].gx, GROUND[i].gy, h + tile * 0.05);
    chipLabel(ctx, {
      x: top.x, y: top.y, nodeR: tile * 0.62, Wc,
      title: svc.title, role: svc.node.role,
      active: hovered === i, above: true, entrance: ent(i, el),
    });
  }

  function paint(el) {
    ctx.clearRect(0, 0, Wc, Hc);
    drawEdges(el);
    drawPackets(el);
    // hinten -> vorne: Sicherheit (hinten) zuerst, dann Infra/Computing
    drawBox(0, el);
    drawBox(1, el);
    drawBox(2, el);
    [0, 1, 2].forEach((i) => label(i, el));
  }

  let raf, running = true, last = null, elapsed = 0, started = false, io;
  const SPEED = 0.3;
  function frame_(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame_);
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts;
    elapsed += dt;
    packets.forEach((pk) => { pk.t = (pk.t + dt * SPEED) % 1; });
    paint(elapsed);
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

  if (reducedMotion()) { paint(3); return stop; }

  const start = () => { if (started) return; started = true; raf = requestAnimationFrame(frame_); };
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && start()), { threshold: 0.15 });
    io.observe(stage);
  } else { start(); }
  return stop;
}
