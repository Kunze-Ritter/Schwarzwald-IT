import { inView } from "motion";
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";

const MINT     = "#2dd4a8";
const MINT_RGB = "45,212,168";
const C_BG     = "#061d16";
const C_WHITE  = "#ffffff";

// Anzeigereihenfolge: Computing oben, Infrastruktur unten
const CARD_SLUGS   = ["computing", "it-infrastruktur"];
const SHIELD_SLUG  = "it-sicherheit";
// Entrance-Delays in Sekunden
const DELAYS       = [0.1, 0.6, 0.95, 1.15]; // Frame, Card0, Card1, Connector

let stopLoop = null;

// ── HTML ──────────────────────────────────────────────────────────────────────

export function systemDiagramCanvas() {
  const allSlugs = [...CARD_SLUGS, SHIELD_SLUG];
  const cards = allSlugs.map((slug) => {
    const s     = services.find((sv) => sv.slug === slug);
    const short = s.system.length > 145 ? s.system.slice(0, 145) + "…" : s.system;
    return `
      <div class="sd3-card" data-node="${slug}">
        <p class="kicker">${s.node.role}</p>
        <h3>${s.title}</h3>
        <p>${short}</p>
        <a class="text-link" href="/leistungen/${slug}/">Mehr zu ${s.title} →</a>
      </div>`;
  }).join("");

  return `
    <div class="sd3-wrap">
      <canvas class="sd3-canvas" aria-hidden="true"></canvas>
      <div class="sd3-cards" aria-label="Die drei Fachbereiche von Schwarzwald-IT">
        ${cards}
      </div>
    </div>`;
}

// ── Icons (Canvas-Pfade, cx/cy = Mittelpunkt, size = ca. 40px) ────────────────

function iconServer(ctx, cx, cy, size) {
  const s = size / 40;
  const x = cx - 20 * s;
  // Drei Server-Einheiten
  [cy - 17*s, cy - 5*s, cy + 7*s].forEach((y) => {
    ctx.beginPath();
    ctx.roundRect(x, y, 40*s, 10*s, 2*s);
    ctx.strokeStyle = MINT;
    ctx.lineWidth   = 1.4 * s;
    ctx.stroke();
    // Status-LED
    ctx.beginPath();
    ctx.arc(x + 35*s, y + 5*s, 2.2*s, 0, Math.PI * 2);
    ctx.fillStyle = MINT;
    ctx.fill();
  });
  // Blinkende LED (pulsiert via globaler Zeit – wird über Glow-Effekt animiert)
  ctx.beginPath();
  ctx.arc(x + 35*s, cy - 17*s + 5*s, 2.2*s, 0, Math.PI * 2);
  ctx.fillStyle = C_WHITE;
  ctx.fill();
}

function iconMonitor(ctx, cx, cy, size) {
  const s  = size / 40;
  const x  = cx - 20*s;
  const y  = cy - 16*s;
  // Rahmen
  ctx.beginPath();
  ctx.roundRect(x, y, 40*s, 26*s, 3*s);
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.4 * s;
  ctx.stroke();
  // Innenbereich / Bildschirminhalt (simulierter Text)
  ctx.strokeStyle = `rgba(${MINT_RGB},0.35)`;
  ctx.lineWidth   = 1 * s;
  [y+5*s, y+10*s, y+15*s].forEach((ly) => {
    ctx.beginPath();
    ctx.moveTo(x + 4*s,  ly);
    ctx.lineTo(x + (ly === y+15*s ? 20*s : 34*s), ly);
    ctx.stroke();
  });
  // Stand
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(cx, y + 26*s);
  ctx.lineTo(cx, y + 34*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 11*s, y + 34*s);
  ctx.lineTo(cx + 11*s, y + 34*s);
  ctx.stroke();
}

function iconShield(ctx, cx, cy, size) {
  const s = size / 36;
  // Schild-Form
  ctx.beginPath();
  ctx.moveTo(cx,         cy - 17*s);
  ctx.lineTo(cx + 15*s,  cy - 11*s);
  ctx.lineTo(cx + 15*s,  cy + 2*s);
  ctx.bezierCurveTo(cx + 15*s, cy + 13*s, cx, cy + 17*s, cx, cy + 17*s);
  ctx.bezierCurveTo(cx, cy + 17*s, cx - 15*s, cy + 13*s, cx - 15*s, cy + 2*s);
  ctx.lineTo(cx - 15*s,  cy - 11*s);
  ctx.closePath();
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 1.5 * s;
  ctx.stroke();
  // Haken
  ctx.beginPath();
  ctx.moveTo(cx - 6*s, cy + 1*s);
  ctx.lineTo(cx - 1*s, cy + 6*s);
  ctx.lineTo(cx + 8*s, cy - 5*s);
  ctx.strokeStyle = MINT;
  ctx.lineWidth   = 2 * s;
  ctx.lineJoin    = "round";
  ctx.lineCap     = "round";
  ctx.stroke();
}

const ICON_FNS = [iconMonitor, iconServer]; // parallel zu CARD_SLUGS

// ── Canvas-Logik ───────────────────────────────────────────────────────────────

export function initSystemDiagramCanvas(main) {
  if (stopLoop) { stopLoop(); stopLoop = null; }

  const canvas = main.querySelector(".sd3-canvas");
  const wrap   = main.querySelector(".sd3-wrap");
  if (!canvas || !wrap) return;

  if (reducedMotion()) { canvas.style.display = "none"; return; }

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);

  function resize() {
    const cw = Math.min(wrap.clientWidth, 860);
    const ch = Math.round(Math.min(470, Math.max(300, cw * 0.50)));
    canvas.width        = cw * dpr;
    canvas.height       = ch * dpr;
    canvas.style.width  = cw + "px";
    canvas.style.height = ch + "px";
    ctx.scale(dpr, dpr);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  const W = () => canvas.width  / dpr;
  const H = () => canvas.height / dpr;

  // ── Zustand ────────────────────────────────────────────────────────
  const entrance = [0, 0, 0, 0]; // Frame, Card0, Card1, Connector
  let   pulseT   = 0;
  let   hovered  = -1; // 0=Computing, 1=Infra, 2=Sicherheit
  let   running  = true;
  let   lastTs   = null;
  let   elapsed  = 0;
  let   mx = -9999, my = -9999;
  // Hit-Rects: werden pro Frame vor der Hover-Prüfung berechnet
  const hitRects = [null, null, null];

  const cardEls = main.querySelectorAll(".sd3-card");

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  canvas.addEventListener("pointerleave", () => { mx = my = -9999; });
  canvas.addEventListener("click", () => {
    const slugs = [CARD_SLUGS[0], CARD_SLUGS[1], SHIELD_SLUG];
    if (hovered >= 0) {
      history.pushState({}, "", `/leistungen/${slugs[hovered]}/`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  });

  function inHit(r) {
    return r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
  }

  // ── Geometrie-Berechnung (einmal pro Frame) ─────────────────────────
  function computeLayout() {
    const w = W(), h = H();
    const outerPad = 16;
    const innerPad = 28;

    const frameX = outerPad;
    const frameY = outerPad;
    const frameW = w - outerPad * 2;
    const frameH = h - outerPad * 2;

    const cardX  = frameX + innerPad;
    const cardW  = frameW - innerPad * 2;
    const cardH  = Math.min(108, Math.floor((frameH - innerPad * 2 - 36) * 0.46));
    const topY   = frameY + innerPad + 20; // +20 für Label-Platz
    const botY   = frameY + frameH - innerPad - cardH;

    return { w, h, frameX, frameY, frameW, frameH, cardX, cardW, cardH, topY, botY };
  }

  // ── Zeichenfunktionen ────────────────────────────────────────────────

  function drawFrame(l, alpha, isActive) {
    if (alpha <= 0) return;
    ctx.save();

    // Subtile Füllung
    ctx.globalAlpha = alpha * (isActive ? 0.12 : 0.06);
    const fill = ctx.createLinearGradient(l.frameX, l.frameY, l.frameX, l.frameY + l.frameH);
    fill.addColorStop(0, `rgba(${MINT_RGB},1)`);
    fill.addColorStop(1, `rgba(${MINT_RGB},0.2)`);
    ctx.beginPath();
    ctx.roundRect(l.frameX, l.frameY, l.frameW, l.frameH, 18);
    ctx.fillStyle = fill;
    ctx.fill();

    // Glow-Rand
    ctx.globalAlpha = alpha * (isActive ? 0.45 : 0.22);
    ctx.strokeStyle = MINT;
    ctx.lineWidth   = 8;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = isActive ? 28 : 16;
    ctx.beginPath();
    ctx.roundRect(l.frameX, l.frameY, l.frameW, l.frameH, 18);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Animierter Dash-Rand
    ctx.globalAlpha    = alpha * 0.75;
    ctx.strokeStyle    = MINT;
    ctx.lineWidth      = 1.5;
    ctx.setLineDash([13, 9]);
    ctx.lineDashOffset = -elapsed * 20;
    ctx.beginPath();
    ctx.roundRect(l.frameX, l.frameY, l.frameW, l.frameH, 18);
    ctx.stroke();
    ctx.setLineDash([]);

    // Eck-Brackets (L-Form, HUD-Ästhetik)
    const bLen = 28, bW = 2.5;
    const rx = 18;
    [
      [l.frameX + rx,          l.frameY,           1,  1],
      [l.frameX + l.frameW - rx, l.frameY,         -1,  1],
      [l.frameX + rx,          l.frameY + l.frameH, 1, -1],
      [l.frameX + l.frameW - rx, l.frameY + l.frameH,-1,-1],
    ].forEach(([bx, by, sx, sy]) => {
      ctx.globalAlpha   = alpha * 0.95;
      ctx.strokeStyle   = MINT;
      ctx.lineWidth     = bW;
      ctx.lineCap       = "round";
      ctx.shadowColor   = MINT;
      ctx.shadowBlur    = 6;
      ctx.beginPath();
      ctx.moveTo(bx + sx * bLen, by);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, by + sy * bLen);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // IT-Sicherheit Label + Schild-Icon oben mittig
    const svc       = services.find(sv => sv.slug === SHIELD_SLUG);
    const labelStr  = `${svc.title}  ·  ${svc.node.role}`;
    const iconSize  = 20;
    const iconGap   = 8;
    ctx.font = `700 12px system-ui,sans-serif`;
    const tw        = ctx.measureText(labelStr).width;
    const totalW    = iconSize + iconGap + tw + 24;
    const labelX    = l.frameX + l.frameW / 2 - totalW / 2;
    const labelMidY = l.frameY;

    // Hintergrundblock (überdeckt die Rahmenlinie)
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = C_BG;
    ctx.fillRect(labelX - 4, labelMidY - 12, totalW + 8, 24);

    // Schild-Icon
    ctx.globalAlpha = alpha * 0.9;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = 8;
    iconShield(ctx, labelX + iconSize * 0.5, labelMidY, iconSize);
    ctx.shadowBlur  = 0;

    // Text
    ctx.globalAlpha  = alpha;
    ctx.fillStyle    = MINT;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labelStr, labelX + iconSize + iconGap, labelMidY);

    ctx.restore();
  }

  function drawCard(idx, l, progress, isActive) {
    if (progress <= 0) return;
    const slug  = CARD_SLUGS[idx];
    const svc   = services.find(sv => sv.slug === slug);
    const y     = idx === 0 ? l.topY : l.botY;
    const slide = (1 - progress) * 16;
    const iconF = ICON_FNS[idx];

    ctx.save();
    ctx.globalAlpha = progress;
    ctx.translate(0, slide);

    // Hintergrund-Karte
    const bg = ctx.createLinearGradient(l.cardX, y, l.cardX, y + l.cardH);
    bg.addColorStop(0, isActive ? "#1c6b4f" : "#0e2c20");
    bg.addColorStop(1, "#061a10");
    ctx.beginPath();
    ctx.roundRect(l.cardX, y, l.cardW, l.cardH, 13);
    ctx.fillStyle   = bg;
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = isActive ? 24 : 0;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Rahmen
    ctx.beginPath();
    ctx.roundRect(l.cardX, y, l.cardW, l.cardH, 13);
    ctx.strokeStyle = isActive ? MINT : `rgba(${MINT_RGB},0.28)`;
    ctx.lineWidth   = isActive ? 2 : 1.2;
    ctx.stroke();

    // Linker Farbstreifen
    ctx.beginPath();
    ctx.roundRect(l.cardX, y, 4, l.cardH, [13, 0, 0, 13]);
    ctx.fillStyle = `rgba(${MINT_RGB},${isActive ? 0.9 : 0.4})`;
    ctx.fill();

    // Icon-Bereich
    const iconCX = l.cardX + l.cardW * 0.11;
    const iconCY = y + l.cardH * 0.5;
    const iconSz = Math.min(38, l.cardH * 0.7);
    ctx.shadowColor = MINT;
    ctx.shadowBlur  = 10;
    iconF(ctx, iconCX, iconCY, iconSz);
    ctx.shadowBlur  = 0;

    // Trenn-Linie
    const sepX = l.cardX + l.cardW * 0.24;
    ctx.beginPath();
    ctx.moveTo(sepX, y + l.cardH * 0.18);
    ctx.lineTo(sepX, y + l.cardH * 0.82);
    ctx.strokeStyle = `rgba(${MINT_RGB},0.18)`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Titel
    const textX = l.cardX + l.cardW * 0.28;
    const titleFS = Math.max(12, Math.min(16, l.cardW * 0.044));
    ctx.font      = `700 ${titleFS}px system-ui,sans-serif`;
    ctx.fillStyle = C_WHITE;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(svc.title, textX, y + l.cardH * 0.44);

    // Rolle
    const roleFS = Math.max(9, Math.min(12, l.cardW * 0.032));
    ctx.font      = `${roleFS}px system-ui,sans-serif`;
    ctx.fillStyle = `rgba(${MINT_RGB},0.78)`;
    ctx.fillText(svc.node.role, textX, y + l.cardH * 0.66);

    ctx.restore();
  }

  function drawConnector(l, progress) {
    if (progress <= 0) return;
    const x  = l.cardX + l.cardW / 2;
    const y1 = l.topY + l.cardH;
    const y2 = l.botY;
    const currentY2 = y1 + (y2 - y1) * Math.min(1, progress * 2);

    ctx.save();
    ctx.globalAlpha = progress * 0.6;
    ctx.strokeStyle = MINT;
    ctx.lineWidth   = 1.4;
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = -elapsed * 14;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, currentY2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (progress > 0.4) {
      const pt = (elapsed * 0.18) % 1;
      const py = y1 + (y2 - y1) * pt;
      ctx.globalAlpha = progress * 0.9;
      ctx.beginPath();
      ctx.arc(x, py, 4, 0, Math.PI * 2);
      ctx.fillStyle   = C_WHITE;
      ctx.shadowColor = MINT;
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }
    ctx.restore();
  }

  // ── Frame-Loop ────────────────────────────────────────────────────────

  function frame(ts) {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
    lastTs   = ts;
    elapsed += dt;
    pulseT  += dt;

    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W(), H());

    // Entrance-Fortschritt
    DELAYS.forEach((d, i) => {
      const t = elapsed - d;
      entrance[i] = t > 0 ? Math.min(1, t / 0.8) : 0;
    });

    // Layout berechnen
    const l = computeLayout();

    // Hit-Rects setzen (vor Hover-Prüfung)
    hitRects[0] = { x: l.cardX, y: l.topY, w: l.cardW, h: l.cardH };
    hitRects[1] = { x: l.cardX, y: l.botY, w: l.cardW, h: l.cardH };
    hitRects[2] = { x: l.frameX, y: l.frameY, w: l.frameW, h: l.frameH };

    // Hover-Erkennung (Karten haben Vorrang vor Frame)
    let newHov = -1;
    if      (inHit(hitRects[0])) newHov = 0;
    else if (inHit(hitRects[1])) newHov = 1;
    else if (inHit(hitRects[2])) newHov = 2;

    if (newHov !== hovered) {
      hovered = newHov;
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      cardEls.forEach((c, i) => c.classList.toggle("is-active", i === hovered));
    }

    // Zeichnen: Frame → Connector → Karten
    drawFrame(l, entrance[0], hovered === 2);
    drawConnector(l, entrance[3]);
    drawCard(0, l, entrance[1], hovered === 0);
    drawCard(1, l, entrance[2], hovered === 1);
  }

  const stopInView = inView(wrap, () => {
    requestAnimationFrame(frame);
  }, { amount: 0.2 });

  stopLoop = () => {
    running = false;
    ro.disconnect();
    stopInView?.();
  };
}
