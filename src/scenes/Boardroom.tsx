import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {Person, Outfit} from '../kit/Person';
import {Screen, CanvasPlane} from '../kit/Planes';
import {Box, Floor, Sky} from '../kit/Env';
import {drawChart, drawChat, drawWarning, drawCenteredText, ChatMsg} from '../kit/draw';
import {mouthOpen} from '../kit/singing';
import {rng} from '../lib/rng';
import {PALETTE} from '../lib/palette';
import {DISPLAY, MONO} from '../lib/fonts';
import {interp, prog, easeInOut, easeOut} from '../lib/anim';
import {Pose} from '../kit/pose';

const AGENT_COLORS = ['#9ad1ff', '#ffd59a', '#b6f0b0', '#f2b6ff', '#ffb3b3', '#c9c3ff'];
const AGENT_LINES = [
  'circling back on synergy', 'per-seat price +12%?', 'approved. +15%', 'scheduling a meeting about meetings',
  'drafted 400 OKRs', 'reviewing the review', 'LGTM', 'LGTM', 'escalating to Agent-VP', 'moat status: wide',
  'renewal auto-accepted', 'churn: what is churn', 'deck v47 final FINAL', 'pinging Agent-Legal', 'q4 vibes: strong',
];
function agentChat(seed: number, t: number): ChatMsg[] {
  const r = rng(seed);
  const n = 3 + Math.floor((t * 0.6 + r() * 10) % 6);
  return Array.from({length: n}, (_, i) => {
    const rr = rng(seed * 31 + i);
    return {who: `Agent-${['Sales', 'Legal', 'HR', 'CFO', 'Ops', 'VP'][Math.floor(rr() * 6)]}`, text: AGENT_LINES[Math.floor(rr() * AGENT_LINES.length)], color: AGENT_COLORS[Math.floor(rr() * 6)], right: i % 2 === 1};
  });
}

const TICKER: [number, string][] = [
  [31.5, 'MARKETS CALM  •  SAAS INDEX FLAT  •  AI AGENTS HANDLE ALL MEETINGS'],
  [36.6, 'BREAKING: CLONES OF OUR APPS DETECTED (10 YEARS OF WORK)'],
  [42.0, 'LOCAL DEV REBUILDS OUR FLAGSHIP PRODUCT IN ~1 DAY'],
  [46.0, 'EVERYBODY AND THEIR MOTHER STOPS PAYING'],
  [49.0, 'ENGINEERS: 0 (OPTIMIZED ✓)  •  MARGINS: MAXIMIZED'],
  [54.2, 'Q3: $1,000,000,000 SPENT TEACHING ROBOTS TO CODE'],
  [59.6, 'ROBOTS AND WORKERS NOW OWN THE THING WE USED TO OWN'],
];

// walkers: loop around the table (ellipse)
const WALKERS: {outfit: Outfit; speed: number; phase: number; r: [number, number]}[] = [
  {outfit: 'board', speed: 0.18, phase: 0, r: [5.2, 2.6]},
  {outfit: 'board', speed: 0.16, phase: 2.1, r: [5.4, 2.8]},
  {outfit: 'suit', speed: 0.2, phase: 4.0, r: [5.0, 2.5]},
  {outfit: 'board', speed: 0.17, phase: 1.1, r: [5.6, 3.0]},
  {outfit: 'secretary', speed: 0.15, phase: 3.2, r: [5.3, 2.7]},
];

export const BoardroomSet: React.FC<{T: number; sos: boolean; noSky?: boolean}> = ({T, sos, noSky}) => {
  const f = T * 30;
  const blink = Math.floor(T * 4) % 2 === 0;
  const spitT = 66.6;
  const spit = prog(T, spitT, spitT + 0.6);
  const splat = T > spitT + 0.45;
  const projDown = prog(T, 67.4, 69.4, easeOut);
  const crash = prog(T, 69.4, 71.6);
  const tick = TICKER.filter(([t]) => t <= T).pop()?.[1] ?? TICKER[0][1];
  const flatSeries = (n: number, seed: number) => {
    const r = rng(seed);
    return Array.from({length: n}, () => 0.55 + (r() - 0.5) * 0.04);
  };
  return (
    <group>
      {noSky ? null : <Sky top={sos ? '#3b0b0b' : '#8fb4dd'} bottom={sos ? '#7a1616' : '#e9eef4'} />}
      <Lights intensity={sos ? 0.8 : 1} />
      {sos ? <pointLight position={[0, 3.5, 0]} color={blink ? '#ff2020' : '#550000'} intensity={blink ? 40 : 10} distance={20} /> : null}
      {noSky ? <Box size={[14, 0.05, 10]} position={[0, 0, 0]} color="#8b8578" /> : <Floor color="#8b8578" size={30} />}
      {/* walls */}
      <Box size={[14, 4.2, 0.1]} position={[0, 2.1, -5]} color="#ddd6ca" />
      <Box size={[0.1, 4.2, 10]} position={[-7, 2.1, 0]} color="#d3ccbf" />
      <Box size={[14, 0.1, 10]} position={[0, 4.2, 0]} color="#ebe6dc" />
      {/* windows on the right */}
      {[-4, -1, 2, 5].map((z) => (
        <Box key={z} size={[0.12, 4.2, 0.12]} position={[7, 2.1, z]} color="#3a3f47" />
      ))}
      {/* table */}
      <Box size={[8, 0.12, 2.6]} position={[0, 0.9, 0]} color="#2e221a" />
      <Box size={[7, 0.8, 1.6]} position={[0, 0.42, 0]} color="#241a14" />
      {Array.from({length: 6}, (_, i) => (
        <group key={i}>
          <Box size={[0.6, 0.75, 0.1]} position={[-3 + i * 1.2, 0.95, -1.9]} color="#4a3d33" />
          <Box size={[0.6, 0.75, 0.1]} position={[-3 + i * 1.2, 0.95, 1.9]} color="#4a3d33" />
        </group>
      ))}
      {/* main wall screen */}
      <Screen
        w={6}
        h={3}
        position={[0, 2.35, -4.9]}
        draw={(ctx, w, h) =>
          sos ? drawWarning(ctx, w, h, 'S.O.S.  STOCK DOWN', blink) : drawChart(ctx, w, h, flatSeries(40, Math.floor(T * 2)), '#5fe08a', {title: 'SAAS INDEX', ticker: '+0.01%'})
        }
      />
      {/* coffee splatter on the main screen */}
      {splat ? (
        <CanvasPlane w={2.2} h={1.6} px={150} position={[-1.2, 2.2, -4.82]} animate={false} draw={(ctx, w, h) => {
          const r = rng(11);
          ctx.fillStyle = 'rgba(92,55,25,0.92)';
          for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(w * (0.2 + r() * 0.6), h * (0.2 + r() * 0.6), 4 + r() * 22, 0, Math.PI * 2);
            ctx.fill();
          }
          for (let i = 0; i < 12; i++) ctx.fillRect(w * (0.25 + r() * 0.5), h * 0.5, 6, h * 0.2 + r() * h * 0.3);
        }} />
      ) : null}
      {/* news ticker under the main screen */}
      <Screen
        w={6}
        h={0.42}
        position={[0, 0.62, -4.9]}
        bezel={false}
        draw={(ctx, w, h) => {
          ctx.fillStyle = sos ? PALETTE.red : '#111';
          ctx.fillRect(0, 0, w, h);
          ctx.font = `800 ${h * 0.62}px ${DISPLAY}`;
          ctx.fillStyle = '#fff';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillText(sos ? 'SOMEBODY HELP US PLEASE  •  SOMEBODY HELP US PLEASE' : tick, w / 2, h * 0.53, w * 0.97);
        }}
      />
      {/* AI agent wall (left) */}
      {Array.from({length: 3}, (_, r) =>
        Array.from({length: 4}, (_, c) => {
          const seed = r * 4 + c + 1;
          return (
            <Screen
              key={seed}
              w={2.1}
              h={1.15}
              px={170}
              position={[-6.9, 0.9 + r * 1.3, -3.4 + c * 2.25]}
              rotation={[0, Math.PI / 2, 0]}
              draw={(ctx, w, h) =>
                sos ? drawWarning(ctx, w, h, ['ERROR', 'PANIC', '404 MOAT', 'HELP'][seed % 4], (Math.floor(T * 4) + seed) % 2 === 0) : drawChat(ctx, w, h, agentChat(seed, T + seed), {size: h * 0.07})
              }
            />
          );
        }),
      )}
      {/* projector screen lowering */}
      {projDown > 0 ? (
        <group position={[0, 4.2, -1.2]}>
          <Box size={[0.06, 0.6, 0.06]} position={[-2.2, -0.3, 0]} color="#333" basic />
          <Box size={[0.06, 0.6, 0.06]} position={[2.2, -0.3, 0]} color="#333" basic />
          <Screen
            w={4.8}
            h={2.6 * projDown}
            px={160}
            position={[0, -0.6 - 1.3 * projDown, 0]}
            draw={(ctx, w, h) => {
              const pts = Array.from({length: 30}, (_, i) => {
                const x = i / 29;
                const drop = x > 0.6 ? (x - 0.6) / 0.4 : 0;
                return 0.6 - drop * drop * 1.4 * Math.min(1, crash * 1.5);
              });
              drawChart(ctx, w, h, pts, PALETTE.red, {bg: '#fbf8f2', title: 'OUR STOCK', ticker: `-${(crash * 97).toFixed(1)}%`});
              ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            }}
          />
        </group>
      ) : null}
      {/* walkers */}
      {WALKERS.map((w, i) => {
        const sp = sos ? w.speed * 3.2 : w.speed;
        const a = T * sp + w.phase;
        const x = Math.cos(a) * w.r[0];
        const z = Math.sin(a) * w.r[1];
        const yaw = Math.atan2(-Math.sin(a) * w.r[0], Math.cos(a) * w.r[1]);
        const pose: Pose = sos ? 'panic' : 'walk';
        return <Person key={i} t={f + i * 7} outfit={w.outfit} tie={w.outfit === 'board' ? 'gold' : w.outfit === 'suit' ? 'red' : 'none'} pose={pose} position={[x, 0, z]} rotation={[0, Math.PI / 2 - yaw + Math.PI, 0]} head={{hair: ['#3b2a20', '#999', '#c49a5a', '#111', '#6b3b20'][i]}} holding={!sos && i === 1 ? <Box size={[0.4, 0.3, 0.02]} color="#fff" /> : undefined} />;
      })}
      {/* coffee drinker near the main screen */}
      <group position={[-1.6, 0, -3.6]} rotation={[0, sos ? 0.1 : 0.5, 0]}>
        <Person t={f} outfit="board" tie="gold" pose={T < spitT - 0.2 ? 'sip' : sos ? 'panic' : 'stand'} angles={T >= spitT - 0.2 && T < spitT + 0.8 ? {spine: -0.35, shoulderR: 0.8, elbowR: -1.2} : undefined} rotation={[0, Math.PI, 0]} head={{hair: '#777'}}
          holding={<mesh><cylinderGeometry args={[0.06, 0.05, 0.14, 12]} /><meshToonMaterial color="#f4f1ea" /></mesh>}
        />
        {spit > 0 && spit < 1
          ? Array.from({length: 18}, (_, i) => {
              const r = rng(i + 5);
              const d = spit * (1.2 + r() * 0.6);
              return (
                <mesh key={i} position={[(r() - 0.5) * 0.6 * spit, 1.62 + (r() - 0.3) * 0.5 * spit, -0.25 - d]}>
                  <sphereGeometry args={[0.035 + r() * 0.03, 6, 4]} />
                  <meshBasicMaterial color="#5c3719" />
                </mesh>
              );
            })
          : null}
      </group>
      {/* the deadpan singer, back right corner */}
      <group position={[5.6, 0, -3.8]} rotation={[0, -0.5, 0]}>
        <Person t={f} outfit="suit" tie="red" pose="stand" head={{hair: '#1a1a1a'}} angles={{shoulderR: 0.6, elbowR: -1.4}}
          headExtra={<mesh position={[0, -0.09, 0.19]} scale={[1, 0.15 + mouthOpen(T) * 0.85, 1]}><boxGeometry args={[0.1, 0.08, 0.02]} /><meshBasicMaterial color="#3a0d0d" /></mesh>}
          holding={<mesh rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.03, 0.02, 0.22, 8]} /><meshToonMaterial color="#222" /></mesh>}
        />
      </group>
    </group>
  );
};

const CALM_CAM: CamKey[] = [
  {f: 31.5, pos: [8, 3.4, 8], look: [0, 1.5, -1.5]},
  {f: 36.5, pos: [3, 2.6, 6], look: [0, 1.8, -4.5], fov: 38},
  {f: 42, pos: [-2, 2.4, 4.5], look: [-6.5, 1.8, -0.5]},
  {f: 48.8, pos: [-1, 2.2, 3.0], look: [-6.5, 1.6, 0.6]},
  {f: 49.2, pos: [3.4, 1.9, -1.0], look: [5.6, 1.6, -3.8], fov: 34},
  {f: 56, pos: [3.8, 1.9, -1.6], look: [5.6, 1.7, -3.8], fov: 30},
  {f: 58, pos: [5, 3, 5], look: [0, 1.4, -2]},
  {f: 65.8, pos: [0, 2.6, 6.5], look: [0, 2.0, -4.5]},
];
const SOS_CAM: CamKey[] = [
  {f: 65.8, pos: [0, 2.6, 6.5], look: [0, 2.0, -4.5], fov: 44},
  {f: 66.2, pos: [-4.2, 1.9, -4.5], look: [-1.4, 1.7, -4.1], fov: 46},
  {f: 67.4, pos: [-4.0, 1.9, -4.4], look: [-1.4, 1.7, -4.2], fov: 46},
  {f: 68.0, pos: [2.5, 2.2, 4.5], look: [0, 2.3, -1.2], fov: 44},
  {f: 70.4, pos: [0.5, 2.4, 3.4], look: [0, 2.4, -1.2], fov: 40},
  {f: 72.3, pos: [0, 9, 22], look: [0, 1.5, -1], fov: 50},
];

export const BoardroomScene: React.FC = () => {
  const {T} = useSongTime('boardroom');
  return (
    <Stage bg="#ddd6ca">
      <BoardroomSet T={T} sos={false} />
      <CameraRig keys={CALM_CAM} frame={T} ease={easeInOut} />
    </Stage>
  );
};

export const SosScene: React.FC = () => {
  const {T} = useSongTime('sos');
  return (
    <Stage bg="#2a0808">
      <BoardroomSet T={T} sos />
      <CameraRig keys={SOS_CAM} frame={T} ease={easeInOut} shake={0.05} />
    </Stage>
  );
};
