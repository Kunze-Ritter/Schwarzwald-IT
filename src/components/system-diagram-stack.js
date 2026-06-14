// Variante 3: Schichten-/Stack-Architektur (Canvas 2D).
// IT-Sicherheit umschließt als Rahmen die beiden Ebenen Computing (oben) und
// Infrastruktur (Fundament, unten) – „greift schützend in alle Bereiche ein".
// Cyan Datenpakete steigen entlang einer Daten-Spine vom Fundament nach oben.
// initStack(canvas, stage, cards) -> stop().
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";
import { navigate } from "../router.js";
import { CYAN, RED, NODES, drawIcon } from "./sysdiag-shared.js";

export function initStack(canvas, stage, cards) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let Wc = 0, Hc = 0, frame = {}, comp = {}, infra = {}, ip = 0, headerH = 0;
  function layout() {
    Wc = stage.clientWidth;
    Hc = Math.round(Wc * 0.8);
    canvas.width = Wc * dpr;
    canvas.height = Hc * dpr;
    canvas.style.width = Wc + "px";
    canvas.style.height = Hc + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const m = Wc * 0.06;
    frame = { x: m, y: m, w: Wc - 2 * m, h: Hc - 2 * m };
    ip = Wc * 0.035;
    headerH = Wc * 0.1;
    const innerX = frame.x + ip * 1.6;
    const innerW = frame.w - ip * 1.6 - ip;
    const innerY = frame.y + headerH;
    const innerBottom = frame.y + frame.h - ip;
    const gap = Wc * 0.035;
    const panelH = (innerBottom - innerY - gap) / 2;
    comp = { x: innerX, y: innerY, w: innerW, h: panelH };
    infra = { x: innerX, y: innerY + panelH + gap, w: innerW, h: panelH };
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(stage);

  // geo-Rechtecke zur Treffer-Erkennung – Reihenfolge wie NODES [Sicherheit, Infra, Computing]
  function rects() { return [frame, infra, comp]; }
  const inRect = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

  let hovered = -1, mx = -9999, my = -9999;
  function pickHover() {
    let found = -1;
    if (inRect(comp, mx, my)) found = 2;
    else if (inRect(infra, mx, my)) found = 1;
    else if (inRect(frame, mx, my)) found = 0;
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

  const ENT = [0.05, 0.35, 0.55];
  const ent = (i, el) => Math.max(0, Math.min(1, (el - ENT[i]) / 0.7));
  const packets = [0, 0.33, 0.66];

  function drawPanel(rect, idx, el) {
    const e = ent(idx, el);
    if (e <= 0) return;
    const active = hovered === idx;
    const slug = NODES[idx].slug;
    const svc = services.find((s) => s.slug === slug);
    const col = active ? RED : CYAN;
    ctx.save();
    ctx.globalAlpha = Math.min(e * 1.6, 1);
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = active ? "rgba(227,6,19,0.06)" : "rgba(255,255,255,0.025)";
    ctx.fill();
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeStyle = `rgba(${col},${active ? 0.8 : 0.3})`;
    ctx.stroke();
    // Cyan-Akzentstrich oben links
    ctx.beginPath();
    ctx.moveTo(rect.x + 14, rect.y);
    ctx.lineTo(rect.x + 14 + (active ? 44 : 26), rect.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(${CYAN},${active ? 1 : 0.6})`;
    ctx.stroke();

    const pad = rect.h * 0.2;
    const box = rect.h * 0.5;
    const ix = rect.x + pad + box / 2;
    const iy = rect.y + rect.h / 2;
    ctx.beginPath();
    ctx.arc(ix, iy, box / 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${col},0.4)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    drawIcon(ctx, slug, ix, iy, box * 0.4, `rgba(${col},0.95)`);

    const tx = rect.x + pad * 1.5 + box;
    const tfs = Math.max(15, Wc * 0.026);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `500 ${tfs}px "Overused Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = active ? `rgba(${col},1)` : "#fff";
    ctx.fillText(svc.title, tx, iy - tfs * 0.12);
    ctx.font = `${tfs * 0.62}px "Geist Mono", ui-monospace, monospace`;
    ctx.fillStyle = `rgba(${CYAN},0.85)`;
    ctx.fillText(svc.node.role, tx, iy + tfs * 0.95);
    ctx.restore();
  }

  function drawFrame(el) {
    const e = ent(0, el);
    if (e <= 0) return;
    const active = hovered === 0;
    const col = active ? RED : CYAN;
    ctx.save();
    ctx.globalAlpha = Math.min(e * 1.6, 1);
    ctx.beginPath();
    ctx.roundRect(frame.x, frame.y, frame.w, frame.h, 14);
    ctx.fillStyle = "rgba(255,255,255,0.012)";
    ctx.fill();
    ctx.lineWidth = active ? 2 : 1.4;
    ctx.strokeStyle = `rgba(${col},${active ? 0.85 : 0.4})`;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = -el * 14;
    ctx.stroke();
    ctx.setLineDash([]);

    // Header: Schild + Label oben links
    const hy = frame.y + headerH * 0.52;
    const hx = frame.x + ip * 1.2;
    const tfs = Math.max(14, Wc * 0.024);
    drawIcon(ctx, "it-sicherheit", hx + tfs * 0.6, hy - tfs * 0.25, tfs * 0.75, `rgba(${col},0.95)`);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `500 ${tfs}px "Overused Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = active ? `rgba(${col},1)` : "#fff";
    ctx.fillText("IT-Sicherheit", hx + tfs * 1.6, hy - tfs * 0.05);
    ctx.font = `${tfs * 0.62}px "Geist Mono", ui-monospace, monospace`;
    ctx.fillStyle = `rgba(${CYAN},0.85)`;
    ctx.fillText("Das zentrale Zahnrad · schützt alle Ebenen", hx + tfs * 1.6, hy + tfs * 0.85);
    ctx.restore();
  }

  function drawSpine(el) {
    const a = Math.min(ent(1, el), ent(2, el));
    if (a <= 0.05) return;
    const x = frame.x + ip * 0.8;
    const top = comp.y + comp.h * 0.25;
    const bottom = infra.y + infra.h * 0.75;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = `rgba(${CYAN},0.25)`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([1, 6]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    // aufsteigende Pakete (unten -> oben)
    packets.forEach((p) => {
      const t = (p + el * 0.2) % 1;
      const y = bottom - (bottom - top) * t;
      const gl = ctx.createRadialGradient(x, y, 0, x, y, Wc * 0.018);
      gl.addColorStop(0, `rgba(${CYAN},0.95)`);
      gl.addColorStop(1, `rgba(${CYAN},0)`);
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(x, y, Wc * 0.018, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(x, y, Wc * 0.004, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function paint(el) {
    ctx.clearRect(0, 0, Wc, Hc);
    drawFrame(el);
    drawSpine(el);
    drawPanel(comp, 2, el);
    drawPanel(infra, 1, el);
  }

  let raf, running = true, last = null, elapsed = 0, started = false, io;
  function frame_(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame_);
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts;
    elapsed += dt;
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
