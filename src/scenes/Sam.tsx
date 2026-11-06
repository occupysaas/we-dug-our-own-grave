import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {Person} from '../kit/Person';
import {Bubble, CanvasPlane, LogoBadge, Screen} from '../kit/Planes';
import {Box, City, Floor, Puff, Sky, Tower} from '../kit/Env';
import {GoldenParachute} from '../kit/Rocket';
import {drawCenteredText, drawChart, drawChat, ChatMsg, drawBadge} from '../kit/draw';
import {DISPLAY, MONO, MARKER} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {rng} from '../lib/rng';
import {interp, prog, easeInOut, easeOut, easeIn} from '../lib/anim';

const SHELF: [number, string, string][] = [
  [222.62, 'PATENTS', '#c9a227'],
  [224.74, 'BRANDS', '#d7141a'],
  [226.88, 'LAWYERS', '#5a4632'],
  [229.0, 'PLANS', '#2f6db3'],
  [231.08, 'SERVERS', '#2b2e36'],
  [233.16, 'CLOUD', '#e8eef6'],
  [235.18, '1M USERS', '#5fb36b'],
  [237.38, 'PRIDE', '#c9a227'],
  [239.56, 'MARKET', '#8e5bd0'],
  [241.56, 'SHARES', '#2a9d8f'],
  [243.76, 'FUTURE', '#f2a541'],
];

const SAAS = ['salesforce', 'adobecc', 'docusign', 'auth0', 'databricks', 'aws'];

const CHAT: [number, ChatMsg][] = [
  [255.2, {who: 'Agent-Salesforce', text: 'Did you know this would happen?', color: '#9ad1ff'}],
  [259.5, {who: 'Agent-Adobe', text: "You're supposed to be the smartest guy in the world!", color: '#ffb3b3', right: true}],
  [263.8, {who: 'Agent-AWS', text: 'WE GAVE YOU OUR RAM! YOU GAVE US THE GRAVE!', color: '#ffd59a'}],
];

const CAM: CamKey[] = [
  // verse 3: confused Sam watching the SaaS screens
  {f: 187.8, pos: [5, 3.2, 9], look: [0, 1.6, -1], fov: 45},
  {f: 192, pos: [2.0, 1.9, 3.2], look: [0, 1.65, 0], fov: 36},
  {f: 197, pos: [-2.5, 2.2, 3.5], look: [-4.5, 2, -1], fov: 45},
  {f: 203.8, pos: [1.6, 1.8, 2.6], look: [0, 1.7, 0], fov: 34},
  // walks to the window; burning valley
  {f: 207.5, pos: [0.5, 2.0, 2.5], look: [0, 1.5, -5], fov: 48},
  {f: 212, pos: [-1.2, 2.0, -2.5], look: [0, 1, -60], fov: 50},
  {f: 216, pos: [-0.8, 2.6, -2.0], look: [10, -3, -60], fov: 50},
  {f: 219.5, pos: [0.9, 1.75, -2.6], look: [0, 1.75, -4.6], fov: 38},
  // bridge: dolly along the shelf
  {f: 221.4, pos: [2.5, 2.0, 1.0], look: [5.5, 1.8, -1.6], fov: 42},
  {f: 232, pos: [3.0, 2.0, 0.6], look: [5.5, 1.8, 0.4], fov: 42},
  {f: 242.4, pos: [3.2, 2.0, 1.2], look: [5.5, 1.8, 1.8], fov: 42},
  {f: 243.6, pos: [1.0, 2.2, 1.5], look: [0, 1.6, -4.5], fov: 48},
  {f: 245.4, pos: [1.4, 1.8, 3.0], look: [0, 1.2, 0], fov: 42},
  // build montage: screens
  {f: 246.2, pos: [-2.0, 2.0, 2.0], look: [-4.8, 2.0, -0.5], fov: 50},
  {f: 254.4, pos: [-3.0, 2.0, 0.5], look: [-4.8, 2.0, 0.5], fov: 50},
  // verse 4: phones + chat screen + under the desk
  {f: 254.6, pos: [0.2, 1.3, 3.2], look: [0, 0.9, 0], fov: 45},
  {f: 255.6, pos: [-0.9, 2.1, 2.0], look: [-4.8, 2.1, -0.2], fov: 50},
  {f: 268.5, pos: [-1.3, 2.1, 1.8], look: [-4.8, 2.1, -0.2], fov: 50},
  {f: 270.5, pos: [4.0, 1.35, -1.0], look: [0.4, 1.0, 0.6], fov: 55},
  {f: 279.4, pos: [3.7, 1.3, -0.8], look: [0.4, 1.0, 0.6], fov: 53},
];

export const SamScene: React.FC = () => {
  const {T} = useSongTime('sam');
  if (T >= 279.6) return <Basement T={T} />;
  const f = T * 30;
  const walk = prog(T, 205, 208.2, easeInOut);
  const back = prog(T, 244.6, 245.4, easeInOut); // back to desk after blinds
  const atWindow = T >= 208.2 && T < 244.6;
  const samX = T < 205 ? 0 : T < 244.6 ? interp(walk, [[0, 0], [1, 0.3]]) : interp(back, [[0, 0.3], [1, 0]]);
  const samZ = T < 205 ? -0.9 : T < 244.6 ? interp(walk, [[0, -0.9], [1, -4.3]]) : interp(back, [[0, -4.3], [1, -0.9]]);
  const hide = prog(T, 245.5, 246.4, easeIn);
  const blinds = prog(T, 244.0, 245.4, easeOut);
  const under = T >= 246.4;
  const phones = T > 254.5;
  const secIn = prog(T, 270.0, 271.6, easeOut);
  const samPeek = T < 279 ? 0 : prog(T, 279, 279.6);
  const r = rng(31);
  const fires = Array.from({length: 14}, () => ({x: (r() - 0.5) * 220, z: -60 - r() * 120, h: 15 + r() * 50, w: 6 + r() * 8}));
  const chutes = Array.from({length: 10}, () => ({x: (r() - 0.5) * 160, z: -50 - r() * 90, y0: 30 + r() * 40, ph: r() * 6}));
  const samPose = hide > 0 ? 'hide' : T < 205 ? 'stand' : walk > 0 && walk < 1 ? 'walk' : back > 0 && back < 1 ? 'walk' : 'stand';
  const facing = under ? 1.3 : T < 205 ? (T < 196 ? 0 : -0.9) : atWindow ? Math.PI : back > 0 && back < 1 ? 0 : 0;
  return (
    <Stage bg="#e9e5dc">
      <Sky top="#4a1a10" bottom="#f08a3c" />
      <Lights intensity={0.9} warm />
      <Floor color="#d8d2c6" size={18} />
      {/* outside: Silicon Valley burning */}
      <City count={50} seed={14} area={[300, 150]} position={[0, -40, -120]} maxH={60} color="#5b4a44" />
      {fires.map((b, i) => (
        <group key={i} position={[b.x, -40, b.z]}>
          <Tower w={b.w} h={b.h} color="#3d302b" lit={0.05} seed={i} />
          <mesh position={[0, b.h + 4 + Math.sin(f * 0.4 + i) * 1.2, 0]}>
            <coneGeometry args={[b.w * 0.6, 10 + Math.sin(f * 0.6 + i) * 3, 7]} />
            <meshBasicMaterial color={i % 2 ? '#ff7a1a' : '#ffb020'} toneMapped={false} />
          </mesh>
          <Puff p={((f * 0.004 + i * 0.13) % 1)} position={[0, b.h + 14 + ((f * 0.05 + i * 3) % 20), 0]} scale={8} color="#3a3330" />
        </group>
      ))}
      {chutes.map((c, i) => (
        <group key={i} position={[c.x + Math.sin(f * 0.02 + c.ph) * 3, c.y0 - ((f * 0.08 + i * 7) % 60) - 20, c.z]} scale={4}>
          <Person t={f + i * 9} outfit="board" tie="gold" pose="stand" angles={{spreadL: 2.6, spreadR: 2.6}} />
          <GoldenParachute open={1} />
        </group>
      ))}
      {/* window wall with blinds */}
      {[-6, -3, 0, 3, 6].map((x) => (
        <Box key={x} size={[0.15, 4.2, 0.15]} position={[x, 2.1, -5]} color="#e9e5dc" />
      ))}
      {Array.from({length: 16}, (_, i) => (
        <Box key={i} size={[12, 0.22, 0.03]} position={[0, 4.1 - i * 0.26 * blinds - 0.05, -4.95]} color="#efe9df" />
      )).slice(0, blinds > 0 ? 16 : 1)}
      <Box size={[0.1, 4.2, 10]} position={[-5, 2.1, 0]} color="#e9e5dc" />
      <Box size={[0.1, 4.2, 10]} position={[6, 2.1, 0]} color="#e9e5dc" />
      <Box size={[12, 0.1, 10]} position={[0, 4.2, 0]} color="#f2efe8" />
      <CanvasPlane w={2.4} h={0.6} px={200} position={[0, 3.6, 4.9]} doubleSide={false} animate={false} draw={(ctx, w, h) => drawCenteredText(ctx, 'OpenAI', w, h, DISPLAY, h * 0.7, '#111')} />
      {/* SaaS wall screens (left) */}
      {SAAS.map((n, i) => {
        const row = Math.floor(i / 3), col = i % 3;
        return (
          <Screen key={n} w={2.2} h={1.35} px={170} position={[-4.9, 1.2 + row * 1.6, -2.6 + col * 2.5]} rotation={[0, Math.PI / 2, 0]} draw={(ctx, w, h) => {
            if (T >= 246.1 && T < 254.5) {
              // build montage: forks multiplying
              ctx.fillStyle = '#0d1117';
              ctx.fillRect(0, 0, w, h);
              const n2 = Math.floor(Math.pow(2, (T - 246.1) * 1.1 + i * 0.3));
              const cols = Math.ceil(Math.sqrt(Math.min(n2, 400) * (w / h)));
              const cell = w / cols;
              ctx.font = `${cell * 0.7}px ${MONO}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              for (let k = 0; k < Math.min(n2, 400); k++) {
                ctx.fillStyle = ['#7dff9a', '#58a6ff', '#f2cc60', '#ff7b72'][k % 4];
                ctx.fillText(['⑂', '⧉', '⑂', '◆'][k % 4], (k % cols) * cell + cell / 2, Math.floor(k / cols) * cell + cell / 2);
              }
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.fillRect(0, h * 0.78, w, h * 0.22);
              ctx.fillStyle = '#fff';
              ctx.font = `800 ${h * 0.12}px ${DISPLAY}`;
              ctx.fillText(T > 252.3 ? '-$1,000,000,000' : `FORKS: ${n2.toLocaleString()}`, w / 2, h * 0.89);
              return;
            }
            const crash = prog(T, 188 + i * 2.2, 192 + i * 2.2);
            const pts = Array.from({length: 24}, (_, k) => (k / 23 < 0.55 ? 0.7 : 0.7 - ((k / 23 - 0.55) / 0.45) * 0.9 * crash));
            drawChart(ctx, w, h, pts, PALETTE.red, {bg: '#0e1620', ticker: crash > 0.5 ? '-98%' : ''});
            ctx.save();
            ctx.translate(w * 0.03, h * 0.05);
            drawBadge(ctx, h * 0.3, h * 0.3, n);
            ctx.restore();
            if (crash > 0.9) {
              ctx.strokeStyle = PALETTE.red;
              ctx.lineWidth = h * 0.06;
              ctx.beginPath(); ctx.moveTo(w * 0.04, h * 0.06); ctx.lineTo(w * 0.04 + h * 0.3, h * 0.36); ctx.moveTo(w * 0.04 + h * 0.3, h * 0.06); ctx.lineTo(w * 0.04, h * 0.36); ctx.stroke();
            }
          }} />
        );
      })}
      {/* big chat screen appears for verse 4 (covers the middle row) */}
      {T > 254.8 && T < 271 ? (
        <Screen w={4.2} h={2.6} px={190} position={[-4.85, 2.1, -0.1]} rotation={[0, Math.PI / 2, 0]} draw={(ctx, w, h) => drawChat(ctx, w, h, CHAT.filter(([t]) => t <= T).map(([, m]) => m), {size: h * 0.075, bg: '#10141a'})} />
      ) : null}
      {/* shelf (right wall) with trophies that crumble on cue */}
      <Box size={[0.4, 0.08, 9]} position={[5.75, 1.3, 0]} color="#7a5a3a" />
      <Box size={[0.4, 0.08, 9]} position={[5.75, 2.4, 0]} color="#7a5a3a" />
      {SHELF.map(([t, label, color], i) => {
        const crumble = prog(T, t, t + 0.9, easeIn);
        const shelfY = i % 2 ? 2.44 : 1.34;
        const z = -3.8 + i * 0.75;
        return (
          <group key={label} position={[5.7, shelfY - crumble * shelfY, z]} rotation={[crumble * 1.4, 0, crumble * 0.8]} scale={1 - crumble * 0.6}>
            {crumble < 1 ? (
              <>
                <Box size={[0.25, 0.5, 0.4]} position={[0, 0.25, 0]} color={color} />
                <mesh position={[0, 0.62, 0]}><sphereGeometry args={[0.13, 10, 8]} /><meshToonMaterial color={PALETTE.gold} /></mesh>
                <CanvasPlane w={0.6} h={0.16} px={300} position={[-0.14, 0.12, 0]} rotation={[0, -Math.PI / 2, 0]} animate={false} draw={(ctx, w, h) => { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h); drawCenteredText(ctx, label, w, h, DISPLAY, h * 0.7, PALETTE.gold); }} />
              </>
            ) : null}
            <Puff p={prog(T, t + 0.6, t + 1.6)} position={[0, 0.2, 0]} scale={0.35} color="#bdb6a8" />
          </group>
        );
      })}
      {/* desk with phones */}
      <Box size={[2.8, 0.1, 1.2]} position={[0, 0.9, 0.4]} color="#c8b79a" />
      <Box size={[0.1, 0.9, 1.1]} position={[-1.3, 0.45, 0.4]} color="#b8a78a" />
      <Box size={[2.6, 0.9, 0.08]} position={[0, 0.45, 0.98]} color="#b8a78a" />
      {[-0.8, 0, 0.8].map((x, i) => {
        const ring = phones && Math.floor(T * 6 + i) % 3 !== 0;
        const shake = ring ? Math.sin(f * 2.5 + i) * 0.05 : 0;
        return (
          <group key={x} position={[x, 0.98 + (ring ? Math.abs(shake) : 0), 0.4]} rotation={[0, shake * 2, shake]}>
            <Box size={[0.4, 0.1, 0.3]} color="#222" />
            <Box size={[0.42, 0.08, 0.1]} position={[0, 0.1 + (ring ? Math.abs(shake) * 2 : 0), 0]} color="#333" />
            {ring && phones ? <CanvasPlane w={0.6} h={0.25} px={200} position={[0, 0.45, 0.1]} animate={false} draw={(ctx, w, h) => drawCenteredText(ctx, 'RING!', w, h, MARKER, h * 0.8, PALETTE.red, w, '400')} /> : null}
          </group>
        );
      })}
      {/* Sam (photo head) */}
      <group position={[samX, 0, samZ + (under ? 0.1 : 0)]}>
        <Person t={f} outfit="sweater" head={{photo: 'sam'}} pose={samPose as never} rotation={[0, facing, 0]}
          position={[0, under ? interp(samPeek, [[0, 0], [1, 0.25]]) * 0 : 0, 0]}
          angles={under ? {bob: -0.95 - samPeek * 0.25} : undefined}
          headExtra={T > 192 && T < 205 ? <CanvasPlane w={0.4} h={0.4} px={200} position={[0.3, 0.45, 0]} animate={false} draw={(ctx, w, h) => drawCenteredText(ctx, '?', w, h, DISPLAY, h * 0.9, PALETTE.red)} /> : null}
        />
      </group>
      {/* secretary */}
      {secIn > 0 ? (
        <group position={[interp(secIn, [[0, 4], [1, 0.9]]), 0, 1.6]}>
          <Person t={f} outfit="secretary" head={{hair: '#6b3b20'}} pose={secIn < 1 ? 'walk' : 'stand'} angles={secIn >= 1 ? {spine: 0.5} : undefined} rotation={[0, secIn < 1 ? -Math.PI / 2 : -2.6, 0]} />
        </group>
      ) : null}
      {T > 271.6 && T < 279.4 ? (
        <Bubble text="Umm, sir, the White House is on the line. Someone made a clean-room implementation of the NSA and he wants advice." w={2.2} size={0.135} font="mono" position={[1.3, 1.4, 1.3]} rotation={[0, 1.45, 0]} tail="left" />
      ) : null}
      <CameraRig keys={CAM} frame={T} ease={easeInOut} shake={phones ? 0.01 : 0} />
    </Stage>
  );
};

/** Basement kid pushes a commit (279.6–287.8). */
const Basement: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  const pushed = T >= 285.0;
  const croak = T >= 287.0;
  return (
    <Stage bg="#1d1a17">
      <Lights intensity={0.5} />
      <pointLight position={[0, 1.6, 1.2]} color="#9fd0ff" intensity={6} distance={6} />
      <Floor color="#3d3630" size={20} />
      <Box size={[8, 4, 0.1]} position={[0, 2, -2]} color="#4a423a" />
      <CanvasPlane w={2.2} h={0.9} px={200} position={[-1.9, 2.5, -1.94]} animate={false} draw={(ctx, w, h) => { ctx.fillStyle = PALETTE.paper; ctx.fillRect(0, 0, w, h); drawCenteredText(ctx, 'OCCUPY SAAS', w, h, DISPLAY, h * 0.32, PALETTE.red); }} />
      <Box size={[1.6, 0.08, 0.8]} position={[0, 0.75, 0]} color="#6b5a48" />
      <Box size={[0.06, 0.75, 0.06]} position={[-0.7, 0.37, 0.3]} color="#333" />
      <Box size={[0.06, 0.75, 0.06]} position={[0.7, 0.37, 0.3]} color="#333" />
      {/* laptop */}
      <Box size={[0.7, 0.03, 0.45]} position={[0, 0.8, 0.05]} color="#222" />
      <Screen w={0.7} h={0.45} px={500} position={[0, 1.04, -0.18]} rotation={[-0.25, 0, 0]} bezel={false} draw={(ctx, w, h) => {
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${h * 0.08}px ${MONO}`;
        ctx.fillStyle = '#7dff9a';
        const lines = ['$ git add .', '$ git commit -m "clean-room clone, MIT"', pushed ? '$ git push origin main' : '$ git push origin main▌'];
        if (pushed) lines.push('To github.com:kid/saas-killer.git', '   main -> main  ✓');
        lines.forEach((l, i) => ctx.fillText(l, w * 0.04, h * (0.14 + i * 0.11)));
        if (croak) {
          ctx.fillStyle = PALETTE.red;
          ctx.fillRect(0, h * 0.72, w, h * 0.28);
          ctx.fillStyle = '#fff';
          ctx.font = `900 ${h * 0.11}px ${DISPLAY}`;
          ctx.textAlign = 'center';
          ctx.fillText('ANOTHER SAAS CO. CROAKED', w / 2, h * 0.9);
        }
      }} />
      <group position={[0, 0, 0.75]}>
        <Person t={f} outfit="casual" head={{hair: '#b5651d'}} pose="sit" scale={0.75} rotation={[0, Math.PI, 0]} angles={{shoulderL: 1.3, shoulderR: T > 284.6 && T < 285.2 ? 1.0 : 1.3, elbowL: -0.4, elbowR: -0.4}} />
        <Box size={[0.5, 0.06, 0.5]} position={[0, 0.36, 0]} color="#222" />
      </group>
      <CameraRig frame={T} keys={[
        {f: 279.6, pos: [2.5, 2.4, 3.5], look: [0, 0.9, 0], fov: 45},
        {f: 284.4, pos: [1.1, 1.3, 1.6], look: [0, 0.95, -0.1], fov: 40},
        {f: 285.2, pos: [0.4, 1.15, 0.9], look: [0, 1.0, -0.2], fov: 38},
        {f: 287.8, pos: [0.3, 1.12, 0.7], look: [0, 1.0, -0.2], fov: 38},
      ]} />
    </Stage>
  );
};
