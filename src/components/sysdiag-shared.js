// Gemeinsame Bausteine für die beiden System-Diagramm-Varianten
// (Zahnräder & Netzwerk): Farben, Fachbereichs-Knoten, Chip-Label.
export const CYAN = "43,182,240";
export const RED = "227,6,19";

// [0] Zentrum (IT-Sicherheit), [1] links (Infrastruktur), [2] rechts (Computing)
export const NODES = [
  { slug: "it-sicherheit", role: "center" },
  { slug: "it-infrastruktur", role: "left" },
  { slug: "computing", role: "right" },
];

// Label als Chip – zentraler Knoten oberhalb, äußere unterhalb. nodeR = Radius,
// ab dem das Chip mit etwas Abstand gesetzt wird. Größe an Canvas-Breite gekoppelt,
// damit beide Varianten konsistent aussehen.
export function chipLabel(ctx, { x, y, nodeR, Wc, title, role, active, above, entrance }) {
  const col = active ? RED : CYAN;
  const tfs = Math.max(13, Wc * 0.022);
  const rfs = tfs * 0.72;
  const gap = Wc * 0.025;

  ctx.save();
  ctx.globalAlpha = Math.min(entrance * 1.8, 1);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `500 ${tfs}px "Overused Grotesk", system-ui, sans-serif`;
  const tw = ctx.measureText(title).width;
  ctx.font = `${rfs}px "Geist Mono", ui-monospace, monospace`;
  const rw = ctx.measureText(role).width;

  const padX = tfs * 0.8, padY = tfs * 0.55, lineGap = tfs * 0.5;
  const chipW = Math.max(tw, rw) + padX * 2;
  const chipH = tfs + lineGap + rfs + padY * 2;
  const edge = above ? y - nodeR - gap : y + nodeR + gap;
  const chipY = above ? edge - chipH : edge;
  const chipX = x - chipW / 2;

  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 7);
  ctx.fillStyle = "rgba(6,9,16,0.82)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(${col},${active ? 0.5 : 0.18})`;
  ctx.stroke();

  const titleBase = chipY + padY + tfs;
  ctx.font = `500 ${tfs}px "Overused Grotesk", system-ui, sans-serif`;
  ctx.fillStyle = active ? `rgba(${col},1)` : "#fff";
  ctx.fillText(title, x, titleBase);
  ctx.font = `${rfs}px "Geist Mono", ui-monospace, monospace`;
  ctx.fillStyle = `rgba(${CYAN},0.85)`;
  ctx.fillText(role, x, titleBase + lineGap + rfs);
  ctx.restore();
}

// Fachbereichs-Icon (Server-Stack / Monitor / Schild) im Knotenzentrum, statisch.
export function drawIcon(ctx, slug, cx, cy, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6 * (s / 22);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (slug === "it-infrastruktur") {
    const w = s * 1.1, x = cx - w / 2;
    [-0.42, 0, 0.42].forEach((o) => {
      const y = cy + o * s;
      ctx.beginPath();
      ctx.roundRect(x, y - 0.16 * s, w, 0.32 * s, 0.06 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w - 0.16 * s, y, 0.06 * s, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (slug === "computing") {
    const w = s * 1.2, h = s * 0.8;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2 - 0.1 * s, w, h, 0.08 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + h / 2 - 0.1 * s);
    ctx.lineTo(cx, cy + h / 2 + 0.16 * s);
    ctx.moveTo(cx - 0.3 * s, cy + h / 2 + 0.16 * s);
    ctx.lineTo(cx + 0.3 * s, cy + h / 2 + 0.16 * s);
    ctx.stroke();
  } else {
    const r = s * 0.62;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.82, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.82, cy + r * 0.1);
    ctx.bezierCurveTo(cx + r * 0.82, cy + r * 0.7, cx, cy + r, cx, cy + r);
    ctx.bezierCurveTo(cx, cy + r, cx - r * 0.82, cy + r * 0.7, cx - r * 0.82, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.82, cy - r * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 2.2 * (s / 22);
    ctx.moveTo(cx - r * 0.32, cy + r * 0.05);
    ctx.lineTo(cx - r * 0.05, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.4, cy - r * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

