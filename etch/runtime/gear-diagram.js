/* Instanz-lokale Frontend-Runtime für die GearDiagram-Component (drei kämmende Zahnräder, Canvas 2D).
 * Mehrfach-sicher: init() arbeitet nur auf SEINEM .gears-Element, Guard, eigene RAF/Observer/Closures.
 * Quelle: src/components/system-diagram-canvas.js. navigate → location.assign. */
(function () {
  "use strict";
  var SEL = ".gears";
  var reducedMotion = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var CYAN = "43,182,240", RED = "227,6,19";
  var NODES = [
    { slug: "it-sicherheit", title: "IT-Sicherheit", role: "Das zentrale Zahnrad" },
    { slug: "it-infrastruktur", title: "IT-Infrastruktur", role: "Das Fundament" },
    { slug: "computing", title: "Computing", role: "Der Arbeitsalltag" }
  ];
  var ENTRANCE_DELAY = [0.1, 0.45, 0.7];
  var N_TEETH = 12, STEP = (Math.PI * 2) / N_TEETH;
  function pt(ctx, cx, cy, a, r, move) {
    var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (move) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  function gearPath(ctx, cx, cy, R, rot, scale) {
    var m = (2 * R) / N_TEETH, Rt = (R + 0.5 * m) * scale, Rb = (R - 0.6 * m) * scale;
    var tw = STEP * 0.40, vw = STEP * 0.40;
    ctx.beginPath();
    for (var k = 0; k < N_TEETH; k++) {
      var c = rot + k * STEP;
      pt(ctx, cx, cy, c - tw / 2, Rt, k === 0);
      pt(ctx, cx, cy, c + tw / 2, Rt);
      pt(ctx, cx, cy, c + STEP / 2 - vw / 2, Rb);
      pt(ctx, cx, cy, c + STEP / 2 + vw / 2, Rb);
    }
    ctx.closePath();
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function drawIcon(ctx, slug, cx, cy, s, color) {
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 1.6 * (s / 22); ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (slug === "it-infrastruktur") {
      var w = s * 1.1, x = cx - w / 2;
      [-0.42, 0, 0.42].forEach(function (o) {
        var y = cy + o * s;
        roundRect(ctx, x, y - 0.16 * s, w, 0.32 * s, 0.06 * s); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w - 0.16 * s, y, 0.06 * s, 0, Math.PI * 2); ctx.fill();
      });
    } else if (slug === "computing") {
      var w2 = s * 1.2, h2 = s * 0.8;
      roundRect(ctx, cx - w2 / 2, cy - h2 / 2 - 0.1 * s, w2, h2, 0.08 * s); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + h2 / 2 - 0.1 * s); ctx.lineTo(cx, cy + h2 / 2 + 0.16 * s);
      ctx.moveTo(cx - 0.3 * s, cy + h2 / 2 + 0.16 * s); ctx.lineTo(cx + 0.3 * s, cy + h2 / 2 + 0.16 * s);
      ctx.stroke();
    } else {
      var r = s * 0.62;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.82, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.82, cy + r * 0.1);
      ctx.bezierCurveTo(cx + r * 0.82, cy + r * 0.7, cx, cy + r, cx, cy + r);
      ctx.bezierCurveTo(cx, cy + r, cx - r * 0.82, cy + r * 0.7, cx - r * 0.82, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.82, cy - r * 0.5);
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.lineWidth = 2.2 * (s / 22);
      ctx.moveTo(cx - r * 0.32, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.05, cy + r * 0.35);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.28);
      ctx.stroke();
    }
    ctx.restore();
  }

  function init(gears) {
    if (gears.dataset.gearsInit) return;
    var canvas = gears.querySelector(".gears__canvas");
    var stage = gears.querySelector(".gears__stage");
    if (!canvas || !stage) return;
    gears.dataset.gearsInit = "1";
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cards = Array.prototype.slice.call(gears.querySelectorAll(".gear-card"));
    var Wc = 0, Hc = 0, R = 0, geo = [];
    function layout() {
      Wc = stage.clientWidth; Hc = Math.round(Wc * 0.74);
      canvas.width = Wc * dpr; canvas.height = Hc * dpr;
      canvas.style.width = Wc + "px"; canvas.style.height = Hc + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Wc * 0.18;
      var gx = Wc / 2, gy = Hc / 2;
      var S = { x: gx, y: gy - 1.067 * R };
      var I = { x: gx - 1.2 * R, y: gy + 0.533 * R };
      var C = { x: gx + 1.2 * R, y: gy + 0.533 * R };
      var aI = Math.atan2(I.y - S.y, I.x - S.x), aC = Math.atan2(C.y - S.y, C.x - S.x);
      geo = [{ x: S.x, y: S.y, dir: 1 }, { x: I.x, y: I.y, alpha: aI }, { x: C.x, y: C.y, alpha: aC }];
    }
    layout();
    new ResizeObserver(layout).observe(stage);
    var hovered = -1, mx = -9999, my = -9999;
    function pickHover() {
      var found = -1, min = Infinity;
      geo.forEach(function (g, i) {
        var d = Math.hypot(mx - g.x, my - g.y);
        if (d < R * 1.05 && d < min) { min = d; found = i; }
      });
      if (found !== hovered) {
        hovered = found;
        canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
        cards.forEach(function (c, i) { c.classList.toggle("is-active", i === hovered); });
      }
    }
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top; pickHover();
    });
    canvas.addEventListener("pointerleave", function () { mx = my = -9999; pickHover(); });
    canvas.addEventListener("click", function () {
      if (hovered >= 0) window.location.assign("/leistungen/" + NODES[hovered].slug + "/");
    });
    cards.forEach(function (card, i) {
      card.addEventListener("pointerenter", function () {
        hovered = i; cards.forEach(function (c, j) { c.classList.toggle("is-active", j === i); });
      });
      card.addEventListener("pointerleave", function () {
        hovered = -1; cards.forEach(function (c) { c.classList.remove("is-active"); });
      });
    });
    function rotationFor(i, rotS) {
      if (i === 0) return rotS;
      return -rotS + (2 * geo[i].alpha + Math.PI - STEP / 2);
    }
    function drawGear(i, rot, entrance, active) {
      var g = geo[i], slug = NODES[i].slug;
      var scale = entrance < 1 ? 1 - Math.exp(-7 * entrance) * Math.cos(9 * entrance) : 1;
      var sc = Math.min(scale, 1.04), col = active ? RED : CYAN;
      ctx.save();
      ctx.globalAlpha = Math.min(entrance * 1.6, 1);
      var halo = ctx.createRadialGradient(g.x, g.y, R * 0.3 * sc, g.x, g.y, R * 1.5 * sc);
      halo.addColorStop(0, "rgba(" + col + "," + (active ? 0.16 : 0.07) + ")");
      halo.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(g.x, g.y, R * 1.5 * sc, 0, Math.PI * 2); ctx.fill();
      gearPath(ctx, g.x, g.y, R, rot, sc);
      var body = ctx.createRadialGradient(g.x - R * 0.3, g.y - R * 0.3, 0, g.x, g.y, R * sc);
      body.addColorStop(0, active ? "#1b1115" : "#101725");
      body.addColorStop(1, "#06080f");
      ctx.fillStyle = body;
      ctx.shadowColor = "rgba(" + col + ",0.5)"; ctx.shadowBlur = active ? 26 : 12;
      ctx.fill(); ctx.shadowBlur = 0;
      gearPath(ctx, g.x, g.y, R, rot, sc);
      ctx.strokeStyle = "rgba(" + col + "," + (active ? 0.95 : 0.55) + ")";
      ctx.lineWidth = active ? 2.2 : 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(g.x, g.y, R * 0.5 * sc, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(" + col + ",0.32)"; ctx.lineWidth = 1.2; ctx.stroke();
      if (entrance > 0.6) {
        ctx.globalAlpha = Math.min((entrance - 0.6) / 0.4, 1);
        drawIcon(ctx, slug, g.x, g.y - R * 0.04, R * 0.34, "rgba(" + col + ",0.95)");
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = Math.min(entrance * 1.8, 1);
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      var ly = g.y + R * 1.12 * sc, tfs = Math.max(12, R * 0.16);
      ctx.font = '500 ' + tfs + 'px "Overused Grotesk", system-ui, sans-serif';
      ctx.fillStyle = active ? "rgba(" + col + ",1)" : "#fff";
      ctx.fillText(NODES[i].title, g.x, ly);
      ctx.font = (tfs * 0.72) + 'px "Geist Mono", ui-monospace, monospace';
      ctx.fillStyle = "rgba(" + CYAN + ",0.8)";
      ctx.fillText(NODES[i].role, g.x, ly + tfs * 1.15);
      ctx.restore();
    }
    function drawMeshSpark(i, t, alpha) {
      var S = geo[0], O = geo[i];
      var px = S.x + (O.x - S.x) * 0.5, py = S.y + (O.y - S.y) * 0.5;
      var pulse = 0.5 + 0.5 * Math.sin(t * 3 + i);
      ctx.save();
      ctx.globalAlpha = alpha * (0.3 + 0.4 * pulse);
      var gl = ctx.createRadialGradient(px, py, 0, px, py, R * 0.28);
      gl.addColorStop(0, "rgba(" + CYAN + ",0.9)"); gl.addColorStop(1, "rgba(" + CYAN + ",0)");
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(px, py, R * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (reducedMotion()) {
      ctx.clearRect(0, 0, Wc, Hc);
      [1, 2].forEach(function (i) { drawMeshSpark(i, 0, 1); });
      drawGear(1, rotationFor(1, 0), 1, false);
      drawGear(2, rotationFor(2, 0), 1, false);
      drawGear(0, 0, 1, false);
      return;
    }
    var running = true, last = null, elapsed = 0, started = false, omega = 0.4;
    function frame(ts) {
      if (!running) return;
      requestAnimationFrame(frame);
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts; elapsed += dt;
      ctx.clearRect(0, 0, Wc, Hc);
      var rotS = elapsed * omega;
      var ent = function (i) { return Math.max(0, Math.min(1, (elapsed - ENTRANCE_DELAY[i]) / 0.8)); };
      [1, 2].forEach(function (i) { drawMeshSpark(i, elapsed, Math.min(ent(0), ent(i))); });
      drawGear(1, rotationFor(1, rotS), ent(1), hovered === 1);
      drawGear(2, rotationFor(2, rotS), ent(2), hovered === 2);
      drawGear(0, rotationFor(0, rotS), ent(0), hovered === 0);
    }
    var start = function () { if (started) return; started = true; requestAnimationFrame(frame); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) start(); });
      }, { threshold: 0.15 }).observe(stage);
    } else { start(); }
  }

  function boot() {
    document.querySelectorAll(SEL).forEach(function (el) {
      try { init(el); } catch (e) { console.error("[gear-diagram]", e); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
