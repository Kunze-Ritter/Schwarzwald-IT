// Variante 2: Netzwerk-/Datenfluss-Graph (Canvas 2D, IT-Kontext).
// Drei Knoten (Server = Infrastruktur, Schild = IT-Sicherheit, Monitor = Computing)
// sind verbunden; cyan Datenpakete fließen animiert über die Verbindungen.
// IT-Sicherheit (Zentrum) trägt einen rotierenden Schutz-Ring – „greift in alle Bereiche ein".
// initNetwork(canvas, stage, cards) -> stop().
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";
import { navigate } from "../router.js";
import { CYAN, RED, NODES, chipLabel, drawIcon } from "./sysdiag-shared.js";

const ENTRANCE_DELAY = [0.1, 0.4, 0.6];
// Kanten + Flussrichtung: Sicherheit speist beide Bereiche, Infrastruktur trägt Computing.
const EDGES = [[0, 1], [0, 2], [1, 2]];

export function initNetwork(canvas, stage, cards) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let Wc = 0, Hc = 0, R = 0, geo = [];
  function layout() {
    Wc = stage.clientWidth;
    Hc = Math.round(Wc * 0.9);
    canvas.width = Wc * dpr;
    canvas.height = Hc * dpr;
    canvas.style.width = Wc + "px";
    canvas.style.height = Hc + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    R = Wc * 0.085;
    const gx = Wc / 2, gy = Hc * 0.54;
    const sx = Wc * 0.28, sy = Hc * 0.27;
    geo = [
      { x: gx, y: gy - sy },          // Zentrum (IT-Sicherheit)
      { x: gx - sx, y: gy + sy * 0.7 }, // links (Infrastruktur)
      { x: gx + sx, y: gy + sy * 0.7 }, // rechts (Computing)
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
      if (d < R * 1.25 && d < min) { min = d; found = i; }
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

  // Datenpakete: 2 pro Kante, gleichmäßig verteilt
  const packets = EDGES.flatMap((_, e) => [0, 0.5].map((p) => ({ e, t: p + e * 0.16 })));

  function ent(i, elapsed) { return Math.max(0, Math.min(1, (elapsed - ENTRANCE_DELAY[i]) / 0.75)); }
  function edgeEnds(a, b) {
    const A = geo[a], B = geo[b];
    const dx = B.x - A.x, dy = B.y - A.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    return { x1: A.x + ux * R, y1: A.y + uy * R, x2: B.x - ux * R, y2: B.y - uy * R };
  }

  function drawEdges(elapsed) {
    EDGES.forEach(([a, b]) => {
      const alpha = Math.min(ent(a, elapsed), ent(b, elapsed));
      if (alpha <= 0.01) return;
      const hot = hovered === a || hovered === b;
      const { x1, y1, x2, y2 } = edgeEnds(a, b);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = hot ? `rgba(${RED},0.5)` : `rgba(${CYAN},0.28)`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([1, 7]);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawPackets(elapsed) {
    packets.forEach((pk) => {
      const [a, b] = EDGES[pk.e];
      const alpha = Math.min(ent(a, elapsed), ent(b, elapsed));
      if (alpha <= 0.05) return;
      const { x1, y1, x2, y2 } = edgeEnds(a, b);
      const t = pk.t % 1;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const hot = hovered === a || hovered === b;
      const col = hot ? RED : CYAN;
      ctx.save();
      ctx.globalAlpha = alpha;
      const gl = ctx.createRadialGradient(x, y, 0, x, y, R * 0.14);
      gl.addColorStop(0, `rgba(${col},0.95)`);
      gl.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(x, y, R * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, R * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawNode(i, elapsed, active) {
    const g = geo[i];
    const e = ent(i, elapsed);
    if (e <= 0) return;
    const scale = e < 1 ? 1 - Math.exp(-7 * e) * Math.cos(9 * e) : 1;
    const sc = Math.min(scale, 1.05);
    const col = active ? RED : CYAN;
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2 + i);
    ctx.save();
    ctx.globalAlpha = Math.min(e * 1.6, 1);

    // Halo
    const halo = ctx.createRadialGradient(g.x, g.y, R * 0.4 * sc, g.x, g.y, R * 1.7 * sc);
    halo.addColorStop(0, `rgba(${col},${active ? 0.2 : 0.08 + 0.04 * pulse})`);
    halo.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(g.x, g.y, R * 1.7 * sc, 0, Math.PI * 2);
    ctx.fill();

    // Schutz-Ring (rotierend) für das zentrale Sicherheits-Zahnrad
    if (NODES[i].role === "center") {
      ctx.globalAlpha = Math.min(e * 1.4, 1) * (0.5 + 0.3 * pulse);
      ctx.beginPath();
      ctx.arc(g.x, g.y, R * 1.32 * sc, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${col},0.6)`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -elapsed * 16;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Knoten-Körper
    ctx.globalAlpha = Math.min(e * 1.6, 1);
    const body = ctx.createRadialGradient(g.x - R * 0.3, g.y - R * 0.3, 0, g.x, g.y, R * sc);
    body.addColorStop(0, active ? "#1b1115" : "#101725");
    body.addColorStop(1, "#06080f");
    ctx.beginPath();
    ctx.arc(g.x, g.y, R * sc, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.shadowColor = `rgba(${col},0.5)`;
    ctx.shadowBlur = active ? 26 : 12 + 6 * pulse;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = active ? 2.2 : 1.5;
    ctx.strokeStyle = `rgba(${col},${active ? 0.95 : 0.55})`;
    ctx.stroke();

    if (e > 0.55) {
      ctx.globalAlpha = Math.min((e - 0.55) / 0.45, 1);
      drawIcon(ctx, NODES[i].slug, g.x, g.y, R * 0.42, `rgba(${col},0.95)`);
    }
    ctx.restore();
  }

  function label(i, elapsed, active) {
    const g = geo[i];
    const svc = services.find((s) => s.slug === NODES[i].slug);
    chipLabel(ctx, {
      x: g.x, y: g.y, nodeR: R * 1.05, Wc,
      title: svc.title, role: svc.node.role,
      active, above: NODES[i].role === "center", entrance: ent(i, elapsed),
    });
  }

  function paint(elapsed) {
    ctx.clearRect(0, 0, Wc, Hc);
    drawEdges(elapsed);
    drawPackets(elapsed);
    [1, 2, 0].forEach((i) => drawNode(i, elapsed, hovered === i));
    [0, 1, 2].forEach((i) => label(i, elapsed, hovered === i));
  }

  let raf, running = true, last = null, elapsed = 0, started = false, io;
  const SPEED = 0.32;

  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
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

  if (reducedMotion()) {
    paint(3); // statischer Zustand (Knoten/Kanten/Pakete eingeblendet)
    return stop;
  }

  const start = () => { if (started) return; started = true; raf = requestAnimationFrame(frame); };
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && start()), { threshold: 0.15 });
    io.observe(stage);
  } else {
    start();
  }
  return stop;
}
