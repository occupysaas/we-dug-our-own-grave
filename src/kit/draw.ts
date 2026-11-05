import {PALETTE} from '../lib/palette';
import {DISPLAY, MARKER, MONO} from '../lib/fonts';

export type Ctx = CanvasRenderingContext2D;

export function wrapText(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Centered multi-line text block. */
export function drawCenteredText(ctx: Ctx, text: string, w: number, h: number, font: string, size: number, color: string, maxW = w * 0.9, weight = '900') {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, text, maxW);
  const lh = size * 1.15;
  const y0 = h / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, w / 2, y0 + i * lh));
}

/** Line chart; points are 0..1 normalized (y up). Can overflow below 0 (drawn clipped). */
export function drawChart(ctx: Ctx, w: number, h: number, points: number[], color: string, opts: {bg?: string; title?: string; grid?: boolean; ticker?: string} = {}) {
  ctx.fillStyle = opts.bg ?? '#0e1620';
  ctx.fillRect(0, 0, w, h);
  if (opts.grid !== false) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(0, (h * i) / 6); ctx.lineTo(w, (h * i) / 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo((w * i) / 6, 0); ctx.lineTo((w * i) / 6, h); ctx.stroke();
    }
  }
  const pad = 0.08;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(4, h * 0.012);
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = (pad + (1 - 2 * pad) * (i / Math.max(1, points.length - 1))) * w;
    const y = (1 - pad - (1 - 2 * pad) * p) * h;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  if (opts.title) {
    ctx.font = `900 ${h * 0.08}px ${DISPLAY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.title, w * 0.04, h * 0.04);
  }
  if (opts.ticker) {
    ctx.font = `700 ${h * 0.06}px ${MONO}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.ticker, w * 0.96, h * 0.05);
  }
}

export function drawWarning(ctx: Ctx, w: number, h: number, text: string, blinkOn: boolean) {
  ctx.fillStyle = blinkOn ? PALETTE.red : PALETTE.redDark;
  ctx.fillRect(0, 0, w, h);
  // hazard stripes
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let x = -h; x < w; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 30 - h * 0.12, h * 0.12); ctx.lineTo(x - h * 0.12, h * 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, h); ctx.lineTo(x + 30, h); ctx.lineTo(x + 30 + h * 0.12, h * 0.88); ctx.lineTo(x + h * 0.12, h * 0.88);
    ctx.fill();
  }
  drawCenteredText(ctx, text, w, h, DISPLAY, Math.min(h * 0.22, w * 0.09), blinkOn ? '#fff' : '#ffd0d0', w * 0.9);
}

export type ChatMsg = {who: string; text: string; color: string; right?: boolean};
/** Chat transcript (most recent at the bottom). */
export function drawChat(ctx: Ctx, w: number, h: number, msgs: ChatMsg[], opts: {bg?: string; size?: number} = {}) {
  ctx.fillStyle = opts.bg ?? '#10141a';
  ctx.fillRect(0, 0, w, h);
  const size = opts.size ?? Math.round(h * 0.055);
  ctx.font = `${size}px ${MONO}`;
  let y = h - size * 0.8;
  for (let i = msgs.length - 1; i >= 0 && y > 0; i--) {
    const m = msgs[i];
    ctx.font = `${size}px ${MONO}`;
    const lines = wrapText(ctx, m.text, w * 0.62);
    const bh = lines.length * size * 1.25 + size * 1.6;
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width), ctx.measureText(m.who).width) + size * 1.4;
    const x = m.right ? w - bw - size : size;
    y -= bh;
    ctx.fillStyle = m.color;
    roundRect(ctx, x, y, bw, bh - size * 0.4, size * 0.6);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.font = `700 ${size * 0.8}px ${MONO}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(m.who, x + size * 0.7, y + size * 0.4);
    ctx.fillStyle = '#111';
    ctx.font = `${size}px ${MONO}`;
    lines.forEach((l, j) => ctx.fillText(l, x + size * 0.7, y + size * 1.3 + j * size * 1.25));
    y -= size * 0.3;
  }
}

/** Protest placard: paper card with marker text. */
export function drawPlacard(ctx: Ctx, w: number, h: number, text: string, red = false) {
  ctx.fillStyle = red ? PALETTE.red : PALETTE.paper;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = w * 0.03;
  ctx.strokeRect(0, 0, w, h);
  drawCenteredText(ctx, text, w, h, MARKER, Math.min(h * 0.34, w * 0.2), red ? PALETTE.paper : PALETTE.ink, w * 0.88);
}

/** Classic Guy Fawkes mask (front). Draws within w×h. */
export function drawFawkes(ctx: Ctx, w: number, h: number, opts: {pale?: boolean} = {}) {
  const cx = w / 2;
  ctx.save();
  // face
  ctx.fillStyle = opts.pale ? '#f2f0ec' : '#f4ead8';
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.03);
  ctx.bezierCurveTo(w * 0.98, h * 0.03, w * 0.98, h * 0.55, w * 0.78, h * 0.8);
  ctx.bezierCurveTo(w * 0.66, h * 0.95, w * 0.57, h * 0.99, cx, h * 0.99);
  ctx.bezierCurveTo(w * 0.43, h * 0.99, w * 0.34, h * 0.95, w * 0.22, h * 0.8);
  ctx.bezierCurveTo(w * 0.02, h * 0.55, w * 0.02, h * 0.03, cx, h * 0.03);
  ctx.fill();
  ctx.strokeStyle = '#2a2420';
  ctx.lineWidth = w * 0.012;
  ctx.stroke();
  if (!opts.pale) {
    // rosy cheeks
    for (const sx of [-1, 1]) {
      const g = ctx.createRadialGradient(cx + sx * w * 0.24, h * 0.55, 1, cx + sx * w * 0.24, h * 0.55, w * 0.13);
      g.addColorStop(0, 'rgba(214,92,92,0.75)');
      g.addColorStop(1, 'rgba(214,92,92,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx + sx * w * 0.24, h * 0.55, w * 0.13, 0, Math.PI * 2); ctx.fill();
    }
  }
  const ink = opts.pale ? '#9a968f' : '#1b1512';
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  // eyebrows (high arches)
  for (const sx of [-1, 1]) {
    ctx.lineWidth = w * 0.03;
    ctx.beginPath();
    ctx.moveTo(cx + sx * w * 0.06, h * 0.32);
    ctx.quadraticCurveTo(cx + sx * w * 0.2, h * 0.18, cx + sx * w * 0.36, h * 0.3);
    ctx.stroke();
    // eye slits (smiling)
    ctx.lineWidth = w * 0.025;
    ctx.beginPath();
    ctx.moveTo(cx + sx * w * 0.1, h * 0.4);
    ctx.quadraticCurveTo(cx + sx * w * 0.2, h * 0.35, cx + sx * w * 0.3, h * 0.4);
    ctx.stroke();
  }
  // nose
  ctx.lineWidth = w * 0.012;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.38);
  ctx.quadraticCurveTo(cx + w * 0.05, h * 0.55, cx - w * 0.02, h * 0.58);
  ctx.stroke();
  // grin
  ctx.lineWidth = w * 0.018;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, h * 0.66);
  ctx.quadraticCurveTo(cx, h * 0.8, cx + w * 0.22, h * 0.66);
  ctx.stroke();
  // mustache (curled up)
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.62);
  ctx.bezierCurveTo(cx - w * 0.12, h * 0.6, cx - w * 0.22, h * 0.64, cx - w * 0.3, h * 0.52);
  ctx.bezierCurveTo(cx - w * 0.24, h * 0.66, cx - w * 0.1, h * 0.67, cx, h * 0.65);
  ctx.bezierCurveTo(cx + w * 0.1, h * 0.67, cx + w * 0.24, h * 0.66, cx + w * 0.3, h * 0.52);
  ctx.bezierCurveTo(cx + w * 0.22, h * 0.64, cx + w * 0.12, h * 0.6, cx, h * 0.62);
  ctx.fill();
  // goatee
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.025, h * 0.8);
  ctx.lineTo(cx + w * 0.025, h * 0.8);
  ctx.lineTo(cx, h * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Steamboat-Willie-era (1928, public domain) mouse, flat B&W with pie eyes and no gloves. */
export function drawMouse(ctx: Ctx, w: number, h: number, t: number) {
  const cx = w / 2;
  const s = w / 400;
  const bob = Math.sin(t * 0.35) * 6 * s;
  ctx.save();
  ctx.translate(0, bob);
  ctx.lineWidth = 7 * s;
  ctx.strokeStyle = '#000';
  const blk = '#0b0b0b';
  const circle = (x: number, y: number, r: number, fill: string) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };
  // legs (rubber hose)
  ctx.lineWidth = 16 * s;
  const kick = Math.sin(t * 0.35) * 20 * s;
  ctx.beginPath(); ctx.moveTo(cx - 25 * s, 400 * s); ctx.quadraticCurveTo(cx - 40 * s - kick, 470 * s, cx - 30 * s, 520 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 25 * s, 400 * s); ctx.quadraticCurveTo(cx + 40 * s + kick, 470 * s, cx + 30 * s, 520 * s); ctx.stroke();
  // shoes
  ctx.lineWidth = 7 * s;
  ctx.fillStyle = '#e8e2d0';
  ctx.beginPath(); ctx.ellipse(cx - 50 * s, 530 * s, 38 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx + 50 * s, 530 * s, 38 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // shorts + body
  circle(cx, 330 * s, 70 * s, blk);
  ctx.fillStyle = '#d9d2bf';
  ctx.beginPath(); ctx.ellipse(cx, 385 * s, 72 * s, 40 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (const bx of [-25, 25]) circle(cx + bx * s, 365 * s, 8 * s, '#fff');
  // arms (rubber hose, bare hands, waving)
  ctx.lineWidth = 12 * s;
  const wave = Math.sin(t * 0.5) * 30 * s;
  ctx.beginPath(); ctx.moveTo(cx - 60 * s, 310 * s); ctx.quadraticCurveTo(cx - 120 * s, 280 * s, cx - 140 * s, 220 * s + wave); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 60 * s, 310 * s); ctx.quadraticCurveTo(cx + 110 * s, 340 * s, cx + 130 * s, 380 * s); ctx.stroke();
  ctx.lineWidth = 7 * s;
  circle(cx - 140 * s, 215 * s + wave, 16 * s, blk);
  circle(cx + 132 * s, 385 * s, 16 * s, blk);
  // ears
  circle(cx - 95 * s, 95 * s, 55 * s, blk);
  circle(cx + 95 * s, 95 * s, 55 * s, blk);
  // head
  circle(cx, 175 * s, 90 * s, blk);
  // face mask
  ctx.fillStyle = '#efe7d2';
  ctx.beginPath();
  ctx.ellipse(cx - 28 * s, 175 * s, 38 * s, 55 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 28 * s, 175 * s, 38 * s, 55 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, 225 * s, 70 * s, 45 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // pie eyes
  for (const ex of [-22, 22]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(cx + ex * s, 160 * s, 16 * s, 28 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = blk;
    ctx.beginPath(); ctx.moveTo(cx + ex * s, 165 * s); ctx.ellipse(cx + ex * s, 165 * s, 11 * s, 20 * s, 0, -0.3, Math.PI * 2 - 0.9); ctx.closePath(); ctx.fill();
  }
  // nose
  circle(cx, 205 * s, 14 * s, blk);
  // grin
  ctx.lineWidth = 6 * s;
  ctx.beginPath(); ctx.moveTo(cx - 45 * s, 225 * s); ctx.quadraticCurveTo(cx, 265 * s, cx + 45 * s, 225 * s); ctx.stroke();
  ctx.restore();
}

/** Parody paperclip assistant with googly eyes and a hammer & sickle. */
export function drawClippy(ctx: Ctx, w: number, h: number, t: number) {
  const s = w / 300;
  const cx = w / 2;
  ctx.save();
  ctx.translate(0, Math.sin(t * 0.3) * 5 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const wire = (color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width * s;
    ctx.beginPath();
    ctx.moveTo(cx + 30 * s, 380 * s);
    ctx.lineTo(cx + 30 * s, 120 * s);
    ctx.arc(cx, 120 * s, 30 * s, 0, Math.PI, true);
    ctx.lineTo(cx - 30 * s, 400 * s);
    ctx.arc(cx + 5 * s, 400 * s, 35 * s, Math.PI, 0, true);
    ctx.lineTo(cx + 40 * s, 170 * s);
    ctx.stroke();
  };
  wire('#111', 22);
  wire('#c9ccd3', 14);
  wire('#f4f6fa', 5);
  // googly eyes
  for (const ex of [-28, 28]) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.arc(cx + ex * s, 170 * s, 24 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const a = t * 0.2 + ex;
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx + ex * s + Math.cos(a) * 9 * s, 172 * s + Math.sin(a) * 9 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
  }
  // eyebrows
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 7 * s;
  ctx.beginPath(); ctx.moveTo(cx - 50 * s, 130 * s); ctx.lineTo(cx - 12 * s, 140 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 50 * s, 130 * s); ctx.lineTo(cx + 12 * s, 140 * s); ctx.stroke();
  // hammer & sickle badge
  const bx = cx, by = 300 * s, r = 46 * s;
  ctx.fillStyle = PALETTE.red;
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 5 * s;
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#f7d038';
  ctx.lineWidth = 8 * s;
  ctx.beginPath(); ctx.arc(bx + 2 * s, by - 2 * s, 26 * s, Math.PI * 0.15, Math.PI * 1.35); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 18 * s, by + 22 * s); ctx.lineTo(bx - 28 * s, by + 32 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 20 * s, by - 20 * s); ctx.lineTo(bx + 20 * s, by + 24 * s); ctx.stroke();
  ctx.lineWidth = 12 * s;
  ctx.beginPath(); ctx.moveTo(bx - 28 * s, by - 10 * s); ctx.lineTo(bx - 10 * s, by - 30 * s); ctx.stroke();
  ctx.restore();
}

export const BRAND: Record<string, {bg: string; fg: string; label: string}> = {
  salesforce: {bg: '#00A1E0', fg: '#fff', label: 'salesforce'},
  databricks: {bg: '#FF3621', fg: '#fff', label: 'databricks'},
  docusign: {bg: '#4C00FF', fg: '#fff', label: 'DocuSign'},
  auth0: {bg: '#EB5424', fg: '#fff', label: 'auth0'},
  adobecc: {bg: '#DA1F26', fg: '#fff', label: 'Cc'},
  aws: {bg: '#232F3E', fg: '#FF9900', label: 'aws'},
  azure: {bg: '#0089D6', fg: '#fff', label: 'Azure'},
  linux: {bg: '#111111', fg: '#f7c600', label: 'Linux'},
  brave: {bg: '#FB542B', fg: '#fff', label: 'Brave'},
  ubuntu: {bg: '#E95420', fg: '#fff', label: 'ubuntu'},
  mint: {bg: '#87CF3E', fg: '#fff', label: 'Mint'},
  openai: {bg: '#ffffff', fg: '#000', label: 'OpenAI'},
  occupysaas: {bg: '#f5f2eb', fg: '#d7141a', label: 'OCCUPY SAAS'},
  google: {bg: '#ffffff', fg: '#4285F4', label: 'G'},
  windows: {bg: '#0078D4', fg: '#fff', label: '⊞'},
  notion: {bg: '#ffffff', fg: '#000', label: 'N'},
};

/** Round swag-button style logo badge. */
export function drawBadge(ctx: Ctx, w: number, h: number, name: string) {
  const b = BRAND[name] ?? {bg: '#888', fg: '#fff', label: name};
  const r = Math.min(w, h) / 2;
  ctx.fillStyle = b.bg;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, r * 0.96, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = r * 0.06;
  ctx.stroke();
  if (name === 'linux') {
    drawTux(ctx, w / 2, h / 2 + r * 0.05, r * 0.75);
    return;
  }
  const size = b.label.length <= 3 ? r * 0.9 : (r * 2.6) / Math.max(4, b.label.length);
  drawCenteredText(ctx, b.label, w, h, DISPLAY, size, b.fg, r * 1.8);
}

export function drawTux(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.15, r * 0.62, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.55, r * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.25, r * 0.42, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  for (const sx of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(cx + sx * r * 0.14, cy - r * 0.62, r * 0.11, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx + sx * r * 0.12, cy - r * 0.6, r * 0.05, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#f7c600';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.16, cy - r * 0.45); ctx.lineTo(cx + r * 0.16, cy - r * 0.45); ctx.lineTo(cx, cy - r * 0.3); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - r * 0.32, cy + r * 0.95, r * 0.25, r * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + r * 0.32, cy + r * 0.95, r * 0.25, r * 0.1, 0, 0, Math.PI * 2); ctx.fill();
}
