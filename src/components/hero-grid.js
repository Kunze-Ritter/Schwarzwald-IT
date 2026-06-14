// Interaktives Gitternetz im Hero. Zeichnet ein Punkte-/Linien-Raster auf Canvas;
// Punkte nahe dem Cursor werden größer, heller und brand-rot, ferne Punkte cyan.
// Portiert aus dem Design-System (HeroGrid.jsx). Respektiert reduced-motion.
import { reducedMotion } from "../motion/index.js";
import { onCleanup } from "../lib/lifecycle.js";

export function initHeroGrid(main) {
  const canvas = main.querySelector(".hero__grid");
  if (!canvas) return;
  const heroEl = canvas.closest(".hero");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let w = 0, h = 0;
  const SPACING = 56;
  const RADIUS = 220;
  const target = { x: -9999, y: -9999 };
  const cur = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
    if (heroEl) {
      heroEl.style.setProperty("--mx", target.x + "px");
      heroEl.style.setProperty("--my", target.y + "px");
      heroEl.dataset.hover = "1";
    }
  }
  function onLeave() {
    target.x = -9999; target.y = -9999;
    if (heroEl) heroEl.dataset.hover = "0";
  }
  const listenEl = heroEl || window;
  listenEl.addEventListener("mousemove", onMove);
  listenEl.addEventListener("mouseleave", onLeave);

  // Bei reduced-motion: statisches Raster einmal zeichnen, keine Loop.
  if (reducedMotion()) {
    drawStatic();
    onCleanup(() => { ro.disconnect(); listenEl.removeEventListener("mousemove", onMove); listenEl.removeEventListener("mouseleave", onLeave); });
    return;
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    const cols = Math.ceil(w / SPACING) + 1;
    const rows = Math.ceil(h / SPACING) + 1;
    ctx.fillStyle = "rgba(43,182,240,0.18)";
    for (let cx = 0; cx < cols; cx++)
      for (let cy = 0; cy < rows; cy++) {
        ctx.beginPath();
        ctx.arc(cx * SPACING, cy * SPACING, 1, 0, Math.PI * 2);
        ctx.fill();
      }
  }

  let raf;
  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    cur.x += (target.x - cur.x) * 0.18;
    cur.y += (target.y - cur.y) * 0.18;
    ctx.clearRect(0, 0, w, h);

    const cols = Math.ceil(w / SPACING) + 1;
    const rows = Math.ceil(h / SPACING) + 1;
    const pts = new Array(cols * rows);
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        const ax = cx * SPACING + Math.sin(t * 0.6 + cx * 0.4 + cy * 0.2) * 1.2;
        const ay = cy * SPACING + Math.cos(t * 0.7 + cy * 0.4 + cx * 0.2) * 1.2;
        const dx = ax - cur.x, dy = ay - cur.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const k = Math.max(0, 1 - d / RADIUS);
        const k2 = k * k;
        const push = k2 * 14;
        const ux = d > 0 ? dx / d : 0;
        const uy = d > 0 ? dy / d : 0;
        pts[cx * rows + cy] = { x: ax + ux * push, y: ay + uy * push, k: k2 };
      }
    }

    ctx.lineWidth = 1;
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        const p = pts[cx * rows + cy];
        const draw = (q) => {
          const k = Math.max(p.k, q.k);
          ctx.strokeStyle = k > 0.02 ? `rgba(227,6,19,${0.05 + k * 0.55})` : "rgba(43,182,240,0.06)";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        };
        if (cx + 1 < cols) draw(pts[(cx + 1) * rows + cy]);
        if (cy + 1 < rows) draw(pts[cx * rows + (cy + 1)]);
      }
    }

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.k > 0.02) {
        ctx.fillStyle = `rgba(227,6,19,${0.4 + p.k * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 + p.k * 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(43,182,240,0.22)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  onCleanup(() => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    listenEl.removeEventListener("mousemove", onMove);
    listenEl.removeEventListener("mouseleave", onLeave);
  });
}
