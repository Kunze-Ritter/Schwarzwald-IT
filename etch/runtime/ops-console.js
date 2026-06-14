/* Instanz-lokale Frontend-Runtime für die OpsConsole-Component (Live-Metriken, Canvas-Sparkline, Log).
 * Mehrfach-sicher: init() arbeitet nur auf SEINEM .ops-Element, Guard, eigene Intervalle/Closures.
 * Quelle: src/components/hero-ops-panel.js (Sparkline auf <canvas> statt SVG). */
(function () {
  "use strict";
  var SEL = ".ops";
  var W = 432, H = 64;
  var reducedMotion = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var SAMPLES = [
    { lvl: "OK", msg: "Backup erfolgreich · srv-0", cls: "ok" },
    { lvl: "INFO", msg: "Patch deployed · vlan-corp", cls: "info" },
    { lvl: "OK", msg: "Firewall sync · sophos-fw", cls: "ok" },
    { lvl: "INFO", msg: "Monitor check · nodes", cls: "info" },
    { lvl: "OK", msg: "AV signatures aktualisiert", cls: "ok" },
    { lvl: "INFO", msg: "Disk scrub · raid-2", cls: "info" },
    { lvl: "WARN", msg: "CPU 78% · srv-04", cls: "warn" },
    { lvl: "OK", msg: "M365 sync · 142 users", cls: "ok" }
  ];
  var initialLogs = [
    { ts: "14:02:18", lvl: "OK", msg: "Backup erfolgreich · srv-03", cls: "ok" },
    { ts: "14:01:55", lvl: "INFO", msg: "Patch deployed · vlan-corp", cls: "info" },
    { ts: "14:01:12", lvl: "OK", msg: "Firewall sync · sophos-fw1", cls: "ok" },
    { ts: "14:00:48", lvl: "INFO", msg: "Monitor check · 12 nodes", cls: "info" },
    { ts: "13:59:30", lvl: "WARN", msg: "CPU 78% · srv-04", cls: "warn" }
  ];
  function renderLog(logEl, logs) {
    logEl.innerHTML = logs.map(function (l, i) {
      return '<div class="ops__log__line" style="opacity:' + (1 - i * 0.14).toFixed(2) +
        '"><span class="ts">' + l.ts + '</span><span class="lvl ' + l.cls + '">' + l.lvl +
        "</span><span>" + l.msg + "</span></div>";
    }).join("");
  }
  function sparkPoints(traffic) {
    var max = Math.max.apply(null, traffic), min = Math.min.apply(null, traffic);
    var span = Math.max(1, max - min), step = W / (traffic.length - 1);
    return traffic.map(function (v, i) { return [i * step, H - ((v - min) / span) * (H - 6) - 3]; });
  }

  function init(el) {
    if (el.dataset.opsInit) return;
    el.dataset.opsInit = "1";
    var traffic = Array.from({ length: 32 }, function (_, i) { return 30 + Math.sin(i * 0.5) * 12 + Math.random() * 8; });
    var logs = initialLogs.slice();
    var ticketsEl = el.querySelector("[data-tickets]");
    var nowEl = el.querySelector("[data-now]");
    var canvas = el.querySelector(".ops__spark");
    var ctx = canvas ? canvas.getContext("2d") : null;
    var logEl = el.querySelector("[data-log]");
    function paint() {
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        var pts = sparkPoints(traffic);
        ctx.beginPath();
        pts.forEach(function (p, i) { i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); });
        ctx.save();
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "rgba(43,182,240,0.4)"); grad.addColorStop(1, "rgba(43,182,240,0)");
        ctx.fillStyle = grad; ctx.fill();
        ctx.restore();
        ctx.beginPath();
        pts.forEach(function (p, i) { i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); });
        ctx.strokeStyle = "#2BB6F0"; ctx.lineWidth = 1.4; ctx.stroke();
        var last = pts[pts.length - 1];
        ctx.beginPath(); ctx.arc(last[0], last[1], 3, 0, Math.PI * 2);
        ctx.fillStyle = "#2BB6F0"; ctx.fill();
      }
      if (nowEl) nowEl.textContent = Math.round(traffic[traffic.length - 1]);
    }
    paint();
    if (logEl) renderLog(logEl, logs);
    if (reducedMotion()) return;
    setInterval(function () {
      traffic = traffic.slice(1);
      traffic.push(28 + Math.sin(Date.now() / 1200) * 14 + Math.random() * 14);
      if (ticketsEl) {
        var tickets = parseInt(ticketsEl.textContent, 10) || 47;
        tickets = Math.max(40, Math.min(60, tickets + (Math.random() < 0.5 ? -1 : 1)));
        ticketsEl.textContent = tickets;
      }
      paint();
    }, 800);
    if (logEl) setInterval(function () {
      var now = new Date();
      var ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(function (n) {
        return String(n).padStart(2, "0");
      }).join(":");
      var s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      logs = [{ ts: ts, lvl: s.lvl, msg: s.msg + Math.floor(Math.random() * 9), cls: s.cls }].concat(logs).slice(0, 6);
      renderLog(logEl, logs);
    }, 2200);
  }

  function boot() {
    document.querySelectorAll(SEL).forEach(function (el) {
      try { init(el); } catch (e) { console.error("[ops-console]", e); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
