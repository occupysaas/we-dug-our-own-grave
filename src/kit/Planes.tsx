import React from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {useCanvasTexture, useImage} from './tex';
import {drawBadge, drawCenteredText, drawClippy, drawMouse, drawPlacard, roundRect, wrapText, Ctx} from './draw';
import {MARKER, MONO, DISPLAY} from '../lib/fonts';
import {PALETTE} from '../lib/palette';

type V3 = [number, number, number];
type PlaneProps = {position?: V3; rotation?: V3; scale?: number | V3; billboard?: boolean; renderOrder?: number; opacity?: number};

/** Generic canvas-drawn plane. `draw` is called each frame with the current frame. */
export const CanvasPlane: React.FC<PlaneProps & {w: number; h: number; px?: number; draw: (ctx: Ctx, w: number, h: number, f: number) => void; deps?: unknown[]; lit?: boolean; animate?: boolean; transparent?: boolean; doubleSide?: boolean}> = ({
  w, h, px = 256, draw, deps = [], lit = false, animate = true, transparent = true, doubleSide = true, position, rotation, scale, renderOrder, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const cw = Math.round(px * w), ch = Math.round(px * h);
  const tex = useCanvasTexture(cw, ch, (ctx, W, H) => draw(ctx, W, H, f), animate ? [f, ...deps] : deps);
  const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide;
  return (
    <mesh position={position} rotation={rotation} scale={scale} renderOrder={renderOrder}>
      <planeGeometry args={[w, h]} />
      {lit ? (
        <meshToonMaterial map={tex} transparent={transparent} side={side} opacity={opacity} />
      ) : (
        <meshBasicMaterial map={tex} transparent={transparent} side={side} toneMapped={false} opacity={opacity} />
      )}
    </mesh>
  );
};

/** Emissive screen; draw is called per frame. */
export const Screen: React.FC<PlaneProps & {w: number; h: number; px?: number; draw: (ctx: Ctx, w: number, h: number, f: number) => void; bezel?: boolean}> = ({bezel = true, ...p}) => (
  <group position={p.position} rotation={p.rotation} scale={p.scale}>
    {bezel ? (
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[p.w + 0.12, p.h + 0.12, 0.05]} />
        <meshToonMaterial color="#1a1d22" />
      </mesh>
    ) : null}
    <CanvasPlane w={p.w} h={p.h} px={p.px ?? 200} draw={p.draw} transparent={false} doubleSide={false} />
  </group>
);

/** Swag-button / badge logo disc. */
export const LogoBadge: React.FC<PlaneProps & {name: string; size?: number}> = ({name, size = 1, ...p}) => (
  <group position={p.position} rotation={p.rotation} scale={p.scale}>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.035]}>
      <cylinderGeometry args={[size * 0.5, size * 0.5, 0.04, 32]} />
      <meshToonMaterial color="#cfcac0" />
    </mesh>
    <CanvasPlane w={size} h={size} px={256} draw={(ctx, w, h) => drawBadge(ctx, w, h, name)} animate={false} deps={[name]} />
  </group>
);

/** Speech/chat bubble with tail. */
export const Bubble: React.FC<PlaneProps & {text: string; w?: number; font?: 'marker' | 'mono' | 'display'; size?: number; bg?: string; fg?: string; tail?: 'left' | 'right' | 'none'}> = ({
  text, w = 4, font = 'marker', size = 0.32, bg = '#ffffff', fg = PALETTE.ink, tail = 'left', ...p
}) => {
  const family = font === 'marker' ? MARKER : font === 'mono' ? MONO : DISPLAY;
  // estimate height from line count
  const px = 160;
  const measure = React.useMemo(() => {
    const c = document.createElement('canvas').getContext('2d')!;
    c.font = `${size * px}px ${family}`;
    return wrapText(c, text, (w - 0.6) * px).length;
  }, [text, w, size, family]);
  const h = measure * size * 1.25 + 0.6 + (tail === 'none' ? 0 : 0.4);
  return (
    <CanvasPlane
      {...p}
      w={w}
      h={h}
      px={px}
      animate={false}
      deps={[text, w, size, bg, fg, tail]}
      draw={(ctx, W, H) => {
        const tailH = tail === 'none' ? 0 : 0.4 * px;
        ctx.fillStyle = bg;
        ctx.strokeStyle = PALETTE.ink;
        ctx.lineWidth = 6;
        roundRect(ctx, 4, 4, W - 8, H - tailH - 8, 0.3 * px);
        ctx.fill();
        ctx.stroke();
        if (tail !== 'none') {
          const tx = tail === 'left' ? W * 0.2 : W * 0.8;
          ctx.beginPath();
          ctx.moveTo(tx - 0.2 * px, H - tailH - 6);
          ctx.lineTo(tx + (tail === 'left' ? -0.3 : 0.3) * px, H - 4);
          ctx.lineTo(tx + 0.2 * px, H - tailH - 6);
          ctx.fillStyle = bg;
          ctx.fill();
          ctx.stroke();
          ctx.fillRect(tx - 0.2 * px + 4, H - tailH - 12, 0.4 * px - 8, 10);
        }
        drawCenteredText(ctx, text, W, H - tailH, family, size * px, fg, W - 0.6 * px, font === 'mono' ? '700' : font === 'display' ? '900' : '400');
      }}
    />
  );
};

/** Flat 2D cartoon cut-out (Roger Rabbit style). Clippy uses the user's hammer & sickle Clippy art. */
export const Cutout2D: React.FC<PlaneProps & {kind: 'mickey' | 'clippy'; height?: number}> = ({kind, height = 2, ...p}) => {
  const img = useImage('clippy.png');
  if (kind === 'clippy') {
    const aspect = 700 / 896;
    return (
      <group position={p.position} rotation={p.rotation} scale={p.scale}>
        <group rotation={[0, 0, 0]}>
          <CanvasPlane w={height * aspect} h={height} px={300} animate={false} deps={[img]} draw={(ctx, w, h) => {
            if (img) ctx.drawImage(img, 0, 0, w, h);
          }} />
        </group>
      </group>
    );
  }
  const aspect = 400 / 560;
  return (
    <CanvasPlane
      {...p}
      w={height * aspect}
      h={height}
      px={260}
      draw={(ctx, w, h, f) => {
        ctx.save();
        ctx.scale(w / 400, h / 560);
        drawMouse(ctx, 400, 560, f);
        ctx.restore();
      }}
    />
  );
};

/** Classic Clippy-style help balloon with Yes / No buttons. */
export const ClippyBalloon: React.FC<PlaneProps & {w?: number}> = ({w = 3.2, ...p}) => (
  <CanvasPlane {...p} w={w} h={w * 0.62} px={220} animate={false} draw={(ctx, W, H) => {
    const tail = H * 0.14;
    ctx.fillStyle = '#ffffc8';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    roundRect(ctx, 4, 4, W - 8, H - tail - 8, H * 0.06);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.15, H - tail - 6);
    ctx.lineTo(W * 0.08, H - 4);
    ctx.lineTo(W * 0.27, H - tail - 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(W * 0.15, H - tail - 12, W * 0.12, 9);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const size = H * 0.085;
    ctx.font = `600 ${size}px ${DISPLAY}`;
    const lines1 = wrapText(ctx, "It looks like you're working on a means of production.", W * 0.86);
    const lines2 = wrapText(ctx, 'Would you like some help with that?', W * 0.86);
    let y = H * 0.07;
    for (const l of lines1) { ctx.fillText(l, W * 0.07, y); y += size * 1.2; }
    y += size * 0.4;
    for (const l of lines2) { ctx.fillText(l, W * 0.07, y); y += size * 1.2; }
    y += size * 0.4;
    for (const [i, label] of ['Yes', 'No'].entries()) {
      const bx = W * (0.07 + i * 0.45), bw = W * 0.4, bh = size * 1.6;
      ctx.fillStyle = '#f4f1d0';
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 3;
      roundRect(ctx, bx, y, bw, bh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.fillText(label, bx + bw / 2, y + bh * 0.2);
      ctx.textAlign = 'left';
    }
  }} />
);

/** Placard on a stick. */
export const Placard: React.FC<PlaneProps & {text: string; red?: boolean}> = ({text, red, ...p}) => (
  <group position={p.position} rotation={p.rotation} scale={p.scale}>
    <mesh position={[0, -0.7, -0.02]}>
      <boxGeometry args={[0.06, 1.4, 0.04]} />
      <meshBasicMaterial color={PALETTE.ink} />
    </mesh>
    <mesh position={[0, 0, -0.012]}>
      <boxGeometry args={[1.3, 0.8, 0.015]} />
      <meshBasicMaterial color={PALETTE.grey1} />
    </mesh>
    <CanvasPlane w={1.3} h={0.8} px={200} animate={false} doubleSide={false} deps={[text, red]} draw={(ctx, w, h) => drawPlacard(ctx, w, h, text, red)} />
  </group>
);
