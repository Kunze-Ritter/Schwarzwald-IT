/* Instanz-lokale Frontend-Runtime für die HeroGrid-Component (interaktives Punkte-/Linien-Gitter).
 * Mehrfach-sicher: init() arbeitet nur auf SEINEM Canvas, Guard gegen Doppel-Init, eigene Closures.
 * Quelle: src/components/hero-grid.js. Läuft als Block-`script` auf der publizierten Seite. */
(function () {
  "use strict";
  var SEL = ".hero__grid";
  var reducedMotion = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function init(canvas) {
    if (canvas.dataset.gridInit) return;
    canvas.dataset.gridInit = "1";
    var heroEl = canvas.closest(".hero");
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, SPACING = 56, RADIUS = 220;
    var target = { x: -9999, y: -9999 }, cur = { x: -9999, y: -9999 };
    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    new ResizeObserver(resize).observe(canvas);
    function onMove(e) {
      var rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left; target.y = e.clientY - rect.top;
      if (heroEl) {
        heroEl.style.setProperty("--mx", target.x + "px");
        heroEl.style.setProperty("--my", target.y + "px");
        heroEl.dataset.hover = "1";
      }
    }
    function onLeave() { target.x = -9999; target.y = -9999; if (heroEl) heroEl.dataset.hover = "0"; }
    var listenEl = heroEl || window;
    listenEl.addEventListener("mousemove", onMove);
    listenEl.addEventListener("mouseleave", onLeave);
    if (reducedMotion()) {
      ctx.clearRect(0, 0, w, h);
      var cols0 = Math.ceil(w / SPACING) + 1, rows0 = Math.ceil(h / SPACING) + 1;
      ctx.fillStyle = "rgba(43,182,240,0.18)";
      for (var cx0 = 0; cx0 < cols0; cx0++) for (var cy0 = 0; cy0 < rows0; cy0++) {
        ctx.beginPath(); ctx.arc(cx0 * SPACING, cy0 * SPACING, 1, 0, Math.PI * 2); ctx.fill();
      }
      return;
    }
    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      cur.x += (target.x - cur.x) * 0.18; cur.y += (target.y - cur.y) * 0.18;
      ctx.clearRect(0, 0, w, h);
      var cols = Math.ceil(w / SPACING) + 1, rows = Math.ceil(h / SPACING) + 1;
      var pts = new Array(cols * rows), cx, cy;
      for (cx = 0; cx < cols; cx++) for (cy = 0; cy < rows; cy++) {
        var ax = cx * SPACING + Math.sin(t * 0.6 + cx * 0.4 + cy * 0.2) * 1.2;
        var ay = cy * SPACING + Math.cos(t * 0.7 + cy * 0.4 + cx * 0.2) * 1.2;
        var dx = ax - cur.x, dy = ay - cur.y, d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / RADIUS), k2 = k * k, push = k2 * 14;
        var ux = d > 0 ? dx / d : 0, uy = d > 0 ? dy / d : 0;
        pts[cx * rows + cy] = { x: ax + ux * push, y: ay + uy * push, k: k2 };
      }
      ctx.lineWidth = 1;
      for (cx = 0; cx < cols; cx++) for (cy = 0; cy < rows; cy++) {
        var p = pts[cx * rows + cy];
        var draw = function (q) {
          var kk = Math.max(p.k, q.k);
          ctx.strokeStyle = kk > 0.02 ? "rgba(227,6,19," + (0.05 + kk * 0.55) + ")" : "rgba(43,182,240,0.06)";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        };
        if (cx + 1 < cols) draw(pts[(cx + 1) * rows + cy]);
        if (cy + 1 < rows) draw(pts[cx * rows + (cy + 1)]);
      }
      for (var i = 0; i < pts.length; i++) {
        var pp = pts[i];
        if (pp.k > 0.02) {
          ctx.fillStyle = "rgba(227,6,19," + (0.4 + pp.k * 0.6) + ")";
          ctx.beginPath(); ctx.arc(pp.x, pp.y, 1.2 + pp.k * 3.2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(43,182,240,0.22)";
          ctx.beginPath(); ctx.arc(pp.x, pp.y, 1, 0, Math.PI * 2); ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    document.querySelectorAll(SEL).forEach(function (el) {
      try { init(el); } catch (e) { console.error("[hero-grid]", e); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
