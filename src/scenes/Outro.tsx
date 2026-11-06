import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {Crab} from '../kit/Crab';
import {Crowd} from '../kit/Crowd';
import {CanvasPlane} from '../kit/Planes';
import {Box, Floor, Sky} from '../kit/Env';
import {Confetti} from '../kit/Confetti';
import {Stars} from '../kit/Space';
import {MONO} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {rng} from '../lib/rng';
import {interp, prog, easeInOut, easeOut, easeIn} from '../lib/anim';
import {cue} from '../timing/cues';

const EYE = cue('eye'); // 345.74
const NO = cue('No'); // 349.74
const SMASH = 349.0;

export const OutroScene: React.FC = () => {
  const {T} = useSongTime('outro');
  if (T < EYE) return <Vigil T={T} />;
  return <EyeAndGoddess T={T} />;
};

const Vigil: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  return (
    <Stage bg="#0c1020">
      <Sky top="#05070f" bottom="#2a2140" />
      <Stars count={600} />
      <Lights intensity={0.35} />
      <Floor color="#06060a" size={200} />
      {/* laptops glowing like candles */}
      {[-1, 0, 1].map((k) => (
        <Crowd key={k} count={50} seed={700 + k} area={[14, 10]} t={f * 0.4} cheer={0} position={[k * 14, 0, 0]} placardEvery={0} color="#2a2745" />
      ))}
      {Array.from({length: 70}, (_, i) => {
        const r = rng(900 + i);
        return (
          <mesh key={i} position={[(r() - 0.5) * 40, 2.0 + r() * 0.3 + Math.sin(f * 0.05 + i) * 0.05, (r() - 0.5) * 10]}>
            <planeGeometry args={[0.5, 0.32]} />
            <meshBasicMaterial color={['#fff3d0', '#d8f0ff', '#ffe0b0'][i % 3]} toneMapped={false} />
          </mesh>
        );
      })}
      {/* crab on someone's shoulders */}
      <group position={[0, 0, 3]}>
        <Box size={[0.6, 1.5, 0.3]} position={[0, 0.75, 0]} color="#0a0a10" basic />
        <mesh position={[0, 1.7, 0]}><sphereGeometry args={[0.2, 10, 8]} /><meshBasicMaterial color="#0a0a10" /></mesh>
        <Crab t={f} pose="idle" position={[0, 1.85, 0.05]} scale={0.6} />
        <pointLight position={[0, 2.4, 1.2]} color="#ffd9a0" intensity={3} distance={5} />
      </group>
      <CameraRig frame={T} keys={[
        {f: 337.4, pos: [-10, 2.4, 16], look: [0, 2.2, 0], fov: 45},
        {f: 345.7, pos: [0, 2.6, 7], look: [0, 2.2, 3], fov: 40},
      ]} />
    </Stage>
  );
};

const SHARDS = Array.from({length: 26}, (_, i) => {
  const r = rng(40 + i);
  return {a: r() * Math.PI * 2, sp: 2 + r() * 5, spin: r() * 8, s: 0.2 + r() * 0.5, z: r() * 3};
});

/** Goddess of open source: silhouette filled with flowing code; arms rise with `arms` 0..1. */
function drawGoddess(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, arms: number) {
  const cx = w / 2;
  ctx.clearRect(0, 0, w, h);
  // aura
  const g = ctx.createRadialGradient(cx, h * 0.35, 10, cx, h * 0.4, w * 0.6);
  g.addColorStop(0, 'rgba(255,214,150,0.55)');
  g.addColorStop(1, 'rgba(255,214,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const body = new Path2D();
  // head
  body.ellipse(cx, h * 0.14, w * 0.07, h * 0.065, 0, 0, Math.PI * 2);
  // hair flowing
  body.moveTo(cx - w * 0.08, h * 0.12);
  body.bezierCurveTo(cx - w * 0.2, h * 0.2 + Math.sin(t * 0.05) * 6, cx - w * 0.18, h * 0.35, cx - w * 0.24, h * 0.42);
  body.lineTo(cx - w * 0.1, h * 0.28);
  body.closePath();
  body.moveTo(cx + w * 0.08, h * 0.12);
  body.bezierCurveTo(cx + w * 0.2, h * 0.2 + Math.sin(t * 0.05 + 1) * 6, cx + w * 0.18, h * 0.35, cx + w * 0.24, h * 0.42);
  body.lineTo(cx + w * 0.1, h * 0.28);
  body.closePath();
  // neck, shoulders, waist, flowing gown
  const sway = Math.sin(t * 0.04) * w * 0.01;
  body.moveTo(cx - w * 0.03, h * 0.19);
  body.lineTo(cx + w * 0.03, h * 0.19);
  body.quadraticCurveTo(cx + w * 0.04, h * 0.23, cx + w * 0.13, h * 0.255);
  body.quadraticCurveTo(cx + w * 0.11, h * 0.33, cx + w * 0.07, h * 0.42);
  body.quadraticCurveTo(cx + w * 0.11, h * 0.5, cx + w * 0.12, h * 0.56);
  body.bezierCurveTo(cx + w * 0.16, h * 0.75, cx + w * 0.22 + sway, h * 0.92, cx + w * 0.28 + sway, h);
  body.lineTo(cx - w * 0.28 + sway, h);
  body.bezierCurveTo(cx - w * 0.22 + sway, h * 0.92, cx - w * 0.16, h * 0.75, cx - w * 0.12, h * 0.56);
  body.quadraticCurveTo(cx - w * 0.11, h * 0.5, cx - w * 0.07, h * 0.42);
  body.quadraticCurveTo(cx - w * 0.11, h * 0.33, cx - w * 0.13, h * 0.255);
  body.quadraticCurveTo(cx - w * 0.04, h * 0.23, cx - w * 0.03, h * 0.19);
  body.closePath();
  ctx.save();
  ctx.shadowColor = 'rgba(255,200,120,0.9)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(120,60,25,0.75)';
  ctx.fill(body);
  ctx.restore();
  // arms (thick strokes) from shoulders
  const armAng = interp(arms, [[0, Math.PI * 0.42], [1, -Math.PI * 0.32]]);
  for (const side of [-1, 1]) {
    const sx = cx + side * w * 0.12, sy = h * 0.27;
    const ex = sx + side * Math.cos(armAng) * w * 0.17, ey = sy + Math.sin(armAng) * w * 0.17;
    const hx = ex + side * Math.cos(armAng - side * 0) * w * 0.15, hy = ey + Math.sin(armAng) * w * 0.15;
    ctx.save();
    ctx.shadowColor = 'rgba(255,200,120,0.9)';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = 'rgba(255,214,150,0.95)';
    ctx.lineWidth = w * 0.035;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.restore();
  }
  // flowing code inside the silhouette
  ctx.save();
  ctx.clip(body);
  ctx.font = `${h * 0.018}px ${MONO}`;
  const snippets = ['fork()', 'git push', 'MIT', 'Apache-2.0', 'GPLv3', 'free()', 'open weights', '#include', 'commit', 'merge', '</>', 'own()', 'everything'];
  for (let row = 0; row < 60; row++) {
    const y = ((row * h * 0.02 + t * 2) % h);
    let x = ((row * 37) % 50) - 50;
    while (x < w) {
      const s = snippets[(row * 7 + Math.floor(x)) % snippets.length];
      ctx.fillStyle = row % 3 === 0 ? '#fff4d6' : row % 3 === 1 ? '#ffc777' : PALETTE.crab;
      ctx.fillText(s, x, y);
      x += ctx.measureText(s).width + 14;
    }
  }
  ctx.restore();
  // eyes: serene closed arcs
  ctx.strokeStyle = '#fff4d6';
  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * w * 0.025, h * 0.14, w * 0.015, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}

const EyeAndGoddess: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  const crack = prog(T, 347.8, SMASH);
  const smashed = T >= SMASH;
  const sp = prog(T, SMASH, SMASH + 1.4);
  const reveal = T >= NO - 0.05;
  const arms = prog(T, 350.1, 351.4, easeOut);
  const cam: CamKey[] = reveal
    ? [
        {f: NO - 0.05, pos: [0, 10, 4], look: [0, 15, -12], fov: 50},
        {f: 351.2, pos: [0, 5, 17], look: [0, 9, -10], fov: 62},
        {f: 352.6, pos: [0, 9, 21], look: [0, 10, -10], fov: 62},
      ]
    : [
        {f: EYE, pos: [0, 0, 6.5], look: [0, 0, 0], fov: 40},
        {f: SMASH, pos: [0, 0, 4.2], look: [0, 0, 0], fov: 40},
        {f: NO - 0.06, pos: [0, 0, 4.8], look: [0, 0, 0], fov: 44},
      ];
  return (
    <Stage bg="#000">
      {!reveal ? (
        <>
          {/* HAL-style corporate eye panel */}
          <Box size={[3.4, 5.0, 0.2]} position={[0, 0, -0.2]} color="#1a1a1c" basic />
          <Box size={[3.2, 0.5, 0.05]} position={[0, 2.2, -0.08]} color="#8d9097" basic />
          {!smashed ? (
            <CanvasPlane w={2.4} h={2.4} px={400} position={[0, 0, 0]} draw={(ctx, w, h, fr) => {
              const cx = w / 2, cy = h / 2;
              ctx.fillStyle = '#050505';
              ctx.beginPath(); ctx.arc(cx, cy, w * 0.48, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = '#6b6f75'; ctx.lineWidth = w * 0.03; ctx.stroke();
              const pulse = 0.85 + 0.15 * Math.sin(fr * 0.15);
              const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.4);
              g.addColorStop(0, `rgba(255,240,170,${pulse})`);
              g.addColorStop(0.12, `rgba(255,90,40,${pulse})`);
              g.addColorStop(0.45, 'rgba(200,10,10,0.9)');
              g.addColorStop(1, 'rgba(30,0,0,0)');
              ctx.fillStyle = g;
              ctx.beginPath(); ctx.arc(cx, cy, w * 0.4, 0, Math.PI * 2); ctx.fill();
              // highlight
              ctx.fillStyle = 'rgba(255,255,255,0.25)';
              ctx.beginPath(); ctx.ellipse(cx - w * 0.15, cy - h * 0.18, w * 0.08, h * 0.04, -0.6, 0, Math.PI * 2); ctx.fill();
              if (crack > 0) {
                const r = rng(5);
                ctx.strokeStyle = 'rgba(255,255,255,0.85)';
                ctx.lineWidth = 3;
                for (let i = 0; i < Math.floor(crack * 14); i++) {
                  let x = cx, y = cy;
                  ctx.beginPath(); ctx.moveTo(x, y);
                  const a = r() * Math.PI * 2;
                  for (let k = 0; k < 5; k++) { x += Math.cos(a + (r() - 0.5)) * w * 0.08; y += Math.sin(a + (r() - 0.5)) * h * 0.08; ctx.lineTo(x, y); }
                  ctx.stroke();
                }
              }
            }} />
          ) : null}
          {smashed
            ? SHARDS.map((s, i) => (
                <mesh key={i} position={[Math.cos(s.a) * sp * s.sp * 0.4, Math.sin(s.a) * sp * s.sp * 0.4, sp * (2 + s.z)]} rotation={[sp * s.spin, sp * s.spin * 0.7, 0]}>
                  <tetrahedronGeometry args={[s.s * 0.4]} />
                  <meshBasicMaterial color={i % 3 ? '#d01010' : '#ffd0a0'} />
                </mesh>
              ))
            : null}
          {smashed ? (
            <group position={[0, -0.3, interp(sp, [[0, -1], [0.4, 2.2], [1, 2.6]])]} rotation={[0.2, 0, 0]}>
              <Crab t={f} pose="smash" phase={0.62 + sp * 0.2} scale={1.3} />
            </group>
          ) : null}
          <Lights intensity={1.2} />
        </>
      ) : (
        <>
          <Sky top="#1a0f08" bottom="#5a2e14" />
          <Lights warm intensity={0.8} />
          <Floor color="#2a1a10" size={200} />
          {/* the goddess */}
          <CanvasPlane w={14} h={20} px={60} position={[0, 10, -12]} draw={(ctx, w, h, fr) => drawGoddess(ctx, w, h, fr, arms)} />
          {/* pulled-back red curtain (Wizard of Oz) */}
          <Box size={[1.4, 4.5, 0.4]} position={[-3.6, 2.25, 1.5]} color="#8a0e12" />
          <Box size={[1.4, 4.5, 0.4]} position={[3.6, 2.25, 1.5]} color="#8a0e12" />
          {/* control pedestal with the crab working levers */}
          <group position={[0, 0, 3]}>
            <Box size={[1.6, 1.0, 0.8]} position={[0, 0.5, 0]} color="#3a3f47" />
            <Box size={[1.5, 0.08, 0.7]} position={[0, 1.02, 0]} color="#222" />
            {[-0.5, -0.2, 0.2, 0.5].map((x, i) => (
              <group key={x} position={[x, 1.05, 0.1]} rotation={[Math.sin(f * 0.3 + i) * 0.5, 0, 0]}>
                <Box size={[0.04, 0.35, 0.04]} position={[0, 0.17, 0]} color="#aaa" />
                <mesh position={[0, 0.36, 0]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color={['#d7141a', '#ffd400', '#7dff9a', PALETTE.crab][i]} /></mesh>
              </group>
            ))}
            <Crab t={f} pose="pilot" position={[0, 1.05, 0.55]} rotation={[0, Math.PI, 0]} scale={0.6} />
            <pointLight position={[0, 2.5, 2]} color="#ffd9a0" intensity={8} distance={6} />
          </group>
          <Crowd count={50} seed={808} area={[24, 4]} t={f} cheer={arms} position={[0, 0, 7]} placardEvery={0} color="#0a0a10" />
          {arms > 0 ? <Confetti t={f} count={140} area={[26, 16, 12]} position={[0, 0, 0]} colors={['#fff4d6', '#ffc777', PALETTE.crab, '#7dff9a']} /> : null}
        </>
      )}
      <CameraRig keys={cam} frame={T} ease={reveal ? easeInOut : easeOut} shake={smashed && !reveal ? 0.04 : 0} />
    </Stage>
  );
};
