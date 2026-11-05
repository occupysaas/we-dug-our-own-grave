import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {Person} from '../kit/Person';
import {Crab} from '../kit/Crab';
import {Crowd} from '../kit/Crowd';
import {Bubble, CanvasPlane, Screen} from '../kit/Planes';
import {Box, Floor, Puff, Sky} from '../kit/Env';
import {drawChart} from '../kit/draw';
import {PALETTE} from '../lib/palette';
import {rng} from '../lib/rng';
import {interp, prog, easeInOut, easeOut} from '../lib/anim';
import {cue} from '../timing/cues';

const HIT2 = cue('hit2');

// stock line path after it leaves the screen bottom (world coords)
const PATH: [number, number, number][] = [
  [1.6, 1.42, -1.9],
  [1.75, 0.06, -1.6],
  [2.6, 0.06, -0.4],
  [3.4, 0.06, 0.7],
  [3.5, 1.0, 0.95],
  [3.45, 1.55, 1.0],
];
function pathPoint(p: number): [number, number, number] {
  const segs = PATH.length - 1;
  const x = Math.min(segs - 1e-6, Math.max(0, p * segs));
  const i = Math.floor(x);
  const k = x - i;
  return [0, 1, 2].map((d) => PATH[i][d] + (PATH[i + 1][d] - PATH[i][d]) * k) as [number, number, number];
}

const CAM: CamKey[] = [
  {f: 151.6, pos: [0, 3, 11], look: [0, 1.5, -1], fov: 45},
  {f: 153.4, pos: [4.5, 2.2, 5], look: [1.6, 1.2, -1.2], fov: 42},
  {f: 155.2, pos: [6.5, 1.6, 4.2], look: [3.2, 0.8, 0.6], fov: 40},
  {f: 156.6, pos: [6.0, 1.7, 3.8], look: [3.4, 0.9, 0.8], fov: 40},
  {f: 158.5, pos: [0, 9, 16], look: [0, 1, 0], fov: 50},
  {f: 165.5, pos: [-6, 7, 12], look: [0, 0.5, 0], fov: 48},
  {f: 167.5, pos: [-1.0, 2.0, 4.8], look: [0.3, 0.4, 1.6], fov: 40},
  {f: 172, pos: [-3.5, 1.6, 6.5], look: [-2, 0.6, 2], fov: 42},
  {f: 176, pos: [-2.4, 1.4, 9.0], look: [-3.5, 3.0, 4.2], fov: 55},
  {f: 187.8, pos: [-2.8, 1.2, 9.8], look: [-3.5, 4.2, 4.2], fov: 60},
];

export const OccupationScene: React.FC = () => {
  const {T} = useSongTime('occupation');
  const f = T * 30;
  const line = prog(T, 153.4, 156.0, easeInOut);
  const bonked = T >= 156.0;
  const encircle = prog(T, 158, 165, easeOut);
  // crab: walk in, grab docs, walk to crowd, get tossed
  const crabIn = prog(T, 165.5, 168.5);
  const crabOut = prog(T, 170, 174.5);
  const crabX = T < 170 ? interp(crabIn, [[0, -6], [1, 0.3]]) : interp(crabOut, [[0, 0.3], [1, -3.5]]);
  const crabZ = T < 170 ? interp(crabIn, [[0, 4], [1, 1.6]]) : interp(crabOut, [[0, 1.6], [1, 4.2]]);
  const tossing = T >= 175;
  const tossCycle = 2.4;
  const tossT = T - 175;
  // last toss peaks exactly at hit2
  const toss = tossing ? Math.abs(Math.sin(((T - HIT2) / tossCycle) * Math.PI + Math.PI / 2)) : 0;
  const crabY = tossing ? 1.5 + toss * (T > HIT2 - 2.4 ? 5.5 : 3.5) : 0;
  const hasDocs = T > 168.8;
  const r = rng(9);
  const rubble = Array.from({length: 30}, () => ({x: (r() - 0.5) * 9, z: (r() - 0.5) * 5 - 1, s: 0.3 + r() * 0.9, rot: r() * 3, c: ['#eef1f5', PALETTE.red, '#2b2e36', '#9a948a'][Math.floor(r() * 4)]}));
  const crowdRing = (n: number, radius: number) =>
    Array.from({length: n}, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rr = radius + (1 - encircle) * 14;
      return {x: Math.cos(a) * rr, z: Math.sin(a) * rr * 0.75 + 0.5, a};
    });
  const BOARD: {pos: [number, number, number]; rot: number; hair: string}[] = [
    {pos: [-1.5, 0, 0.5], rot: 0.4, hair: '#777'},
    {pos: [0.6, 0, 1.4], rot: -0.3, hair: '#3b2a20'},
    {pos: [-0.4, 0, -0.2], rot: 2.5, hair: '#c49a5a'},
  ];
  return (
    <Stage bg="#f0d8b8">
      <Sky top={T > 170 ? '#d7141a' : '#e9a26b'} bottom="#f6e2c4" />
      <Lights warm />
      <Floor color="#b9a98f" size={300} />
      {rubble.map((b, i) => (
        <Box key={i} size={[b.s, b.s * 0.45, b.s * 0.7]} position={[b.x, b.s * 0.18, b.z]} rotation={[b.rot * 0.2, b.rot, b.rot * 0.15]} color={b.c} />
      ))}
      {/* the surviving projector screen */}
      <group position={[0, 1.7, -2]}>
        <Box size={[0.12, 1.6, 0.12]} position={[-2.2, -0.8, 0]} color="#333" />
        <Box size={[0.12, 1.6, 0.12]} position={[2.2, -0.8, 0]} color="#333" />
        <Screen w={4.8} h={2.6} position={[0, 0.9, 0]} draw={(ctx, w, h) => {
          const pts = Array.from({length: 30}, (_, i) => {
            const x = i / 29;
            const drop = x > 0.5 ? (x - 0.5) / 0.5 : 0;
            return 0.6 - drop * drop * (1.4 + line * 2);
          });
          drawChart(ctx, w, h, pts, PALETTE.red, {bg: '#fbf8f2', title: 'OUR STOCK', ticker: line > 0.2 ? 'ERR: BELOW ZERO' : '-97.0%'});
        }} />
      </group>
      {/* the stock line escaping the screen as a 3D red tube */}
      {line > 0
        ? Array.from({length: Math.floor(line * 60)}, (_, i) => {
            const p = pathPoint(i / 60);
            return (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.06, 8, 6]} />
                <meshToonMaterial color={PALETTE.red} />
              </mesh>
            );
          })
        : null}
      {/* board members crawling out, one gets bonked */}
      {BOARD.map((b, i) => (
        <Person key={i} t={f + i * 11} outfit="board" tie="gold" head={{hair: b.hair}} pose={T < 153 + i * 0.6 ? 'crawl' : T > 158 ? 'panic' : 'stand'} position={[b.pos[0], 0, b.pos[2] + (T < 153 ? (153 - T) * -0.3 : 0)]} rotation={[0, b.rot, 0]} />
      ))}
      <group position={[3.45, 0, 1.0]}>
        <Person t={f} outfit="board" tie="gold" head={{hair: '#111'}} pose={bonked ? 'stand' : 'stand'} angles={bonked ? {spine: 0, bob: -0.0} : undefined} rotation={bonked ? [-Math.PI / 2 * prog(T, 156, 156.5, easeOut), -0.8, 0] : [0, -0.8, 0]} />
        {bonked && T < 160 ? (
          <group rotation={[-Math.PI / 2 * prog(T, 156, 156.5, easeOut), -0.8, 0]}>
            {[0, 1, 2].map((k) => {
              const a = f * 0.25 + (k * Math.PI * 2) / 3;
              return (
                <mesh key={k} position={[Math.cos(a) * 0.3, 2.0, Math.sin(a) * 0.3]}>
                  <octahedronGeometry args={[0.07]} />
                  <meshBasicMaterial color="#ffd400" />
                </mesh>
              );
            })}
          </group>
        ) : null}
      </group>
      {T > 155.8 && T < 157.6 ? <Bubble text="BONK!" font="display" w={1.2} size={0.34} bg={PALETTE.red} fg="#fff" tail="none" position={[2.3, 2.4, 0.0]} rotation={[0, 0.9, 0]} /> : null}
      {/* the protest crowd encircles */}
      {encircle > 0
        ? crowdRing(16, 7.5).map((p, i) => (
            <Crowd key={i} count={9} seed={300 + i} area={[3.0, 1.6]} t={f} cheer={T > 170 ? 1 : 0.2} position={[p.x, 0, p.z]} rotation={[0, -p.a - Math.PI / 2, 0]} placardEvery={3} />
          ))
        : null}
      {/* Claude crab */}
      {T > 165.5 ? (
        <group position={[crabX, crabY, crabZ]}>
          <Crab t={f} pose={tossing ? 'cheer' : T > 168.5 && T < 170 ? 'carry' : 'walk'} rotation={[0, tossing ? f * 0.05 : T < 170 ? 0.9 : -2.2, tossing ? Math.sin(f * 0.1) * 0.3 : 0]} scale={tossing ? 1.1 : 0.7} />
          {hasDocs ? (
            <group position={[0, 1.05, 0.2]}>
              {[0, 1, 2].map((k) => (
                <CanvasPlane key={k} w={0.5} h={0.65} px={200} lit animate={false} position={[k * 0.06 - 0.06, k * 0.02, k * 0.01]} rotation={[-0.2, 0, (k - 1) * 0.15]} draw={(ctx, w, h) => {
                  ctx.fillStyle = '#fff';
                  ctx.fillRect(0, 0, w, h);
                  ctx.fillStyle = '#111';
                  ctx.font = `900 ${h * 0.09}px sans-serif`;
                  ctx.fillText(['ROADMAP', 'API DOCS', 'PRICING'][k], w * 0.08, h * 0.14);
                  ctx.fillStyle = '#999';
                  for (let l = 0; l < 8; l++) ctx.fillRect(w * 0.08, h * (0.24 + l * 0.08), w * (0.5 + ((l * 37) % 30) / 100), h * 0.025);
                  ctx.fillStyle = PALETTE.red;
                  ctx.font = `900 ${h * 0.1}px sans-serif`;
                  ctx.fillText('CONFIDENTIAL', w * 0.1, h * 0.94);
                }} />
              ))}
            </group>
          ) : null}
        </group>
      ) : null}
      {/* the tossing crowd under the crab */}
      {tossing ? <Crowd count={14} seed={77} area={[3, 2]} t={f} cheer={1} position={[-3.5, 0, 4.2]} placardEvery={0} /> : null}
      <CameraRig keys={CAM} frame={T} ease={easeInOut} />
    </Stage>
  );
};
