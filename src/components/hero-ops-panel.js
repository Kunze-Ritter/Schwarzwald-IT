// Live „Ops Console" als Hero-Eyecatcher: animierte Uptime/Tickets, Cyan-Sparkline
// und scrollender System-Log. Reines DOM/SVG, keine Fremd-Dependency.
// Portiert aus dem Design-System (HeroOpsPanel.jsx).
import { reducedMotion } from "../motion/index.js";
import { onCleanup } from "../lib/lifecycle.js";

const W = 432, H = 64;

export function opsPanel() {
  return `
    <aside class="ops" aria-hidden="true">
      <div class="ops__head">
        <div class="ops__title">Ops Console · Live</div>
        <div class="ops__dots"><span></span><span></span><span></span></div>
      </div>
      <div class="ops__metrics">
        <div class="ops__metric">
          <div class="label">Uptime · 30d</div>
          <div class="value"><span data-uptime>99.98</span><sup>%</sup></div>
          <div class="delta">▲ 0.04 vs. last</div>
        </div>
        <div class="ops__metric">
          <div class="label">Tickets heute</div>
          <div class="value"><span data-tickets>47</span><sup>/h</sup></div>
          <div class="delta">Ø Reaktion 8 min</div>
        </div>
      </div>
      <div class="ops__chart">
        <div class="label"><span>Traffic · vlan-corp</span><span class="now"><span data-now>30</span> Mb/s</span></div>
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cyArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#2BB6F0" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#2BB6F0" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path data-area fill="url(#cyArea)" />
          <path data-line stroke="#2BB6F0" stroke-width="1.4" fill="none" />
          <circle data-dot r="3" fill="#2BB6F0" />
        </svg>
        <div class="axis"><span>−15 min</span><span>jetzt</span></div>
      </div>
      <div class="ops__log">
        <div class="label">System log</div>
        <div data-log></div>
      </div>
    </aside>
  `;
}

const SAMPLES = [
  { lvl: "OK", msg: "Backup erfolgreich · srv-0", cls: "ok" },
  { lvl: "INFO", msg: "Patch deployed · vlan-corp", cls: "info" },
  { lvl: "OK", msg: "Firewall sync · sophos-fw", cls: "ok" },
  { lvl: "INFO", msg: "Monitor check · nodes", cls: "info" },
  { lvl: "OK", msg: "AV signatures aktualisiert", cls: "ok" },
  { lvl: "INFO", msg: "Disk scrub · raid-2", cls: "info" },
  { lvl: "WARN", msg: "CPU 78% · srv-04", cls: "warn" },
  { lvl: "OK", msg: "M365 sync · 142 users", cls: "ok" },
];

const initialLogs = [
  { ts: "14:02:18", lvl: "OK", msg: "Backup erfolgreich · srv-03", cls: "ok" },
  { ts: "14:01:55", lvl: "INFO", msg: "Patch deployed · vlan-corp", cls: "info" },
  { ts: "14:01:12", lvl: "OK", msg: "Firewall sync · sophos-fw1", cls: "ok" },
  { ts: "14:00:48", lvl: "INFO", msg: "Monitor check · 12 nodes", cls: "info" },
  { ts: "13:59:30", lvl: "WARN", msg: "CPU 78% · srv-04", cls: "warn" },
];

function renderLog(logEl, logs) {
  logEl.innerHTML = logs
    .map(
      (l, i) =>
        `<div class="ops__log__line" style="opacity:${(1 - i * 0.14).toFixed(2)}"><span class="ts">${l.ts}</span><span class="lvl ${l.cls}">${l.lvl}</span><span>${l.msg}</span></div>`
    )
    .join("");
}

function spark(traffic) {
  const max = Math.max(...traffic), min = Math.min(...traffic);
  const span = Math.max(1, max - min);
  const step = W / (traffic.length - 1);
  const pts = traffic.map((v, i) => [i * step, H - ((v - min) / span) * (H - 6) - 3]);
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  return { line, area: `${line} L${W},${H} L0,${H} Z`, last: pts[pts.length - 1] };
}

export function initOpsPanel(main) {
  const el = main.querySelector(".ops");
  if (!el) return;

  let traffic = Array.from({ length: 32 }, (_, i) => 30 + Math.sin(i * 0.5) * 12 + Math.random() * 8);
  let logs = initialLogs.slice();

  const uptimeEl = el.querySelector("[data-uptime]");
  const ticketsEl = el.querySelector("[data-tickets]");
  const nowEl = el.querySelector("[data-now]");
  const areaEl = el.querySelector("[data-area]");
  const lineEl = el.querySelector("[data-line]");
  const dotEl = el.querySelector("[data-dot]");
  const logEl = el.querySelector("[data-log]");

  function paint() {
    const s = spark(traffic);
    areaEl.setAttribute("d", s.area);
    lineEl.setAttribute("d", s.line);
    dotEl.setAttribute("cx", s.last[0]);
    dotEl.setAttribute("cy", s.last[1]);
    nowEl.textContent = Math.round(traffic[traffic.length - 1]);
  }
  paint();
  renderLog(logEl, logs);

  if (reducedMotion()) return; // statisch belassen

  const tick = setInterval(() => {
    traffic = traffic.slice(1);
    traffic.push(28 + Math.sin(Date.now() / 1200) * 14 + Math.random() * 14);
    let tickets = parseInt(ticketsEl.textContent, 10) || 47;
    tickets = Math.max(40, Math.min(60, tickets + (Math.random() < 0.5 ? -1 : 1)));
    ticketsEl.textContent = tickets;
    paint();
  }, 800);

  const logTick = setInterval(() => {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    logs = [{ ts, lvl: s.lvl, msg: s.msg + Math.floor(Math.random() * 9), cls: s.cls }, ...logs].slice(0, 6);
    renderLog(logEl, logs);
  }, 2200);

  onCleanup(() => { clearInterval(tick); clearInterval(logTick); });
}
