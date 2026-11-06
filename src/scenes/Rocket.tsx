import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {BoardroomSet} from './Boardroom';
import {CorpRocket, GoldenParachute} from '../kit/Rocket';
import {Stars, Planet} from '../kit/Space';
import {Person} from '../kit/Person';
import {CanvasPlane, LogoBadge, Screen} from '../kit/Planes';
import {Box, Explosion, Floor, Puff, Sky} from '../kit/Env';
import {drawTux, drawChart} from '../kit/draw';
import {MARKER} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {rng} from '../lib/rng';
import {interp, prog, easeInOut, easeOut} from '../lib/anim';
import {cue} from '../timing/cues';

const HIT = cue('hit1'); // 101.7
const JUMPS = [85.0, 87.4, 89.8, 92.2, 94.6, 97.0];

const SPACE_CAM: CamKey[] = [
  {f: 72.3, pos: [0, 5.6, 4.2], look: [0, 4.6, 0], fov: 50},
  {f: 75.5, pos: [10, 9, 26], look: [0, 6, 0], fov: 45},
  {f: 78.2, pos: [16, 14, 22], look: [40, -60, -120], fov: 45},
  {f: 82.5, pos: [16, 14, 22], look: [40, -60, -120], fov: 45},
  {f: 84.0, pos: [12, 8, 24], look: [0, 6, 0], fov: 45},
  {f: 97.5, pos: [-14, 10, 22], look: [0, 6, 0], fov: 45},
  {f: 99.6, pos: [-6, 7, 13], look: [0, 6.5, 0], fov: 45},
  {f: HIT - 0.25, pos: [-4, 6.5, 10], look: [0, 6.5, 0], fov: 45},
  {f: HIT, pos: [-4, 6.5, 10], look: [0, 6.5, 0], fov: 45},
  {f: HIT + 0.1, pos: [0, 10, 46], look: [0, 6, 0], fov: 50},
  {f: 106, pos: [0, 4, 60], look: [0, 2, 0], fov: 50},
];
const GROUND_CAM: CamKey[] = [
  {f: 106, pos: [0, 6, 30], look: [0, 30, 0], fov: 55},
  {f: 112, pos: [6, 5, 22], look: [0, 6, 0], fov: 50},
  {f: 118, pos: [10, 4, 14], look: [0, 1.8, 0], fov: 45},
];

const DEBRIS = Array.from({length: 26}, (_, i) => {
  const r = rng(100 + i);
  return {dir: [r() - 0.5, r() * 0.8, r() - 0.5], spin: [r() * 4, r() * 4, r() * 4], kind: i % 5, size: 0.4 + r() * 1.2, x: (r() - 0.5) * 16, z: (r() - 0.5) * 10, land: 108 + r() * 7};
});

export const RocketScene: React.FC = () => {
  const {T} = useSongTime('rocket');
  const ground = T >= 106;
  return (
    <Stage bg={ground ? '#f0d8b8' : '#05060f'}>
      {ground ? <Ground T={T} /> : <Space T={T} />}
      <CameraRig keys={ground ? GROUND_CAM : SPACE_CAM} frame={T} ease={easeInOut} shake={T > 84 && T < HIT - 0.25 ? (T > 99.6 ? 0.25 : 0.06) : 0} />
    </Stage>
  );
};

const Space: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  const exploded = T >= HIT + 0.05;
  const boom = prog(T, HIT, HIT + 2.2);
  const tux = prog(T, 78.4, 79.2, easeOut);
  return (
    <group>
      <Stars />
      <Lights intensity={1.1} />
      <directionalLight position={[50, 20, 30]} intensity={1.2} />
      <Planet radius={160} color="#2d6fb3" land="#4f9a4a" position={[40, interp(T, [[72.3, -150], [100, -260]]) - 60, -120]} seed={4} />
      <Planet radius={22} color="#c1502e" land="#8e3417" position={[-90, 120, -260]} seed={8} />
      {/* laughing Tux over the Earth */}
      {tux > 0 && T < 84 ? (
        <CanvasPlane w={60} h={60} px={10} position={[40, -60, -60]} rotation={[-0.4, -0.5, 0]} scale={tux} opacity={1} draw={(ctx, w, h, fr) => {
          const shake = Math.sin(fr * 1.3) * w * 0.01;
          drawTux(ctx, w / 2 + shake, h * 0.55, w * 0.33);
          ctx.fillStyle = '#7a0000';
          ctx.beginPath();
          ctx.ellipse(w / 2 + shake, h * 0.43, w * 0.07, h * 0.04 + Math.abs(Math.sin(fr * 0.8)) * h * 0.03, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `${h * 0.12}px ${MARKER}`;
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText('HA HA HA', w / 2, h * 0.14);
        }} />
      ) : null}
      {!exploded ? (
        <CorpRocket flame={T > HIT - 0.25 ? 0 : 1 + 0.2 * Math.sin(f * 0.9)}>
          <group scale={0.26} position={[0, 0, 0.3]}>
            <BoardroomSet T={T} sos noSky />
          </group>
        </CorpRocket>
      ) : null}
      {/* golden parachute bail-outs */}
      {JUMPS.map((j, i) => {
        if (T < j) return null;
        const dt = T - j;
        const side = i % 2 ? 1 : -1;
        const x = side * (1 + dt * 1.6);
        const y = 5 - dt * 1.1 + Math.min(dt, 0.6) * 2;
        const z = 1.8 + dt * 2.2;
        const open = prog(dt, 0.6, 1.2, easeOut);
        return (
          <group key={j} position={[x, y, z]} scale={0.6}>
            <Person t={f + i * 9} outfit="board" tie="gold" pose={open > 0.5 ? 'stand' : 'fall'} head={{hair: ['#777', '#3b2a20', '#c49a5a', '#111', '#999', '#6b3b20'][i]}} angles={open > 0.5 ? {spreadL: 2.6, spreadR: 2.6} : undefined} rotation={[0, side * 0.5, 0]} />
            <GoldenParachute open={open} />
          </group>
        );
      })}
      <Explosion p={boom} position={[0, 7, 0]} scale={8} />
      {exploded
        ? DEBRIS.map((d, i) => {
            const dt = T - HIT;
            const pos: [number, number, number] = [d.dir[0] * dt * 9, 7 + d.dir[1] * dt * 6 - dt * dt * 0.4, d.dir[2] * dt * 9];
            return <DebrisPiece key={i} kind={d.kind} size={d.size} position={pos} rotation={[d.spin[0] * dt, d.spin[1] * dt, d.spin[2] * dt]} />;
          })
        : null}
    </group>
  );
};

const DebrisPiece: React.FC<{kind: number; size: number; position: [number, number, number]; rotation: [number, number, number]}> = ({kind, size, position, rotation}) => (
  <group position={position} rotation={rotation} scale={size}>
    {kind === 0 ? <Box size={[1, 0.6, 0.1]} color="#eef1f5" /> : null}
    {kind === 1 ? <Box size={[0.8, 0.8, 0.12]} color={PALETTE.red} /> : null}
    {kind === 2 ? <LogoBadge name={['salesforce', 'aws', 'azure', 'adobecc'][Math.floor(size * 10) % 4]} size={0.9} /> : null}
    {kind === 3 ? <Box size={[0.4, 0.9, 0.4]} color="#2b2e36" /> : null}
    {kind === 4 ? <Box size={[1.2, 0.08, 0.5]} color="#2e221a" /> : null}
  </group>
);

/** Descent: debris and parachuters fall into a crater; the projector screen lands upright. */
const Ground: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  const screenY = interp(T, [[106, 60], [113, 1.7]], (x) => x * x);
  const screenLanded = T >= 113;
  return (
    <group>
      <Sky top="#e9a26b" bottom="#f6e2c4" />
      <Lights warm />
      <fog attach="fog" args={['#f0d8b8', 40, 160]} />
      <Floor color="#b9a98f" size={400} />
      {/* crater rim */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 10, 32]} />
        <meshToonMaterial color="#8f7f66" />
      </mesh>
      {DEBRIS.map((d, i) => {
        const y = interp(T, [[106, 40 + i * 2], [d.land, 0.2]], (x) => x * x);
        const landed = T >= d.land;
        return (
          <group key={i}>
            <DebrisPiece kind={d.kind} size={d.size} position={[d.x, y, d.z]} rotation={landed ? [0.2 * i, i, 0.3] : [f * 0.05 + i, f * 0.03, i]} />
            <Puff p={prog(T, d.land, d.land + 1.5)} position={[d.x, 0.3, d.z]} scale={0.8} />
          </group>
        );
      })}
      {/* parachuting board members drifting down */}
      {JUMPS.map((j, i) => {
        const y = interp(T, [[106, 26 + i * 3], [116 + i * 0.3, 0]]);
        const r = rng(i + 40);
        const x = (r() - 0.5) * 18;
        const z = (r() - 0.5) * 8 + 2;
        const landed = y <= 0.01;
        return (
          <group key={j} position={[x + Math.sin(T + i) * 0.5, y, z]}>
            <Person t={f + i * 9} outfit="board" tie="gold" pose={landed ? 'crawl' : 'stand'} angles={landed ? undefined : {spreadL: 2.6, spreadR: 2.6}} head={{hair: ['#777', '#3b2a20', '#c49a5a', '#111', '#999', '#6b3b20'][i]}} />
            {!landed ? <GoldenParachute open={1} /> : null}
          </group>
        );
      })}
      {/* the projector screen survives */}
      <group position={[0, screenY, -2]} rotation={screenLanded ? [0, 0, 0] : [0, f * 0.04, 0.2]}>
        <Box size={[0.12, 1.6, 0.12]} position={[-2.2, -0.8, 0]} color="#333" />
        <Box size={[0.12, 1.6, 0.12]} position={[2.2, -0.8, 0]} color="#333" />
        <Screen w={4.8} h={2.6} position={[0, 0.9, 0]} draw={(ctx, w, h) => {
          const pts = Array.from({length: 30}, (_, i) => {
            const x = i / 29;
            const drop = x > 0.6 ? (x - 0.6) / 0.4 : 0;
            return 0.6 - drop * drop * 1.4;
          });
          drawChart(ctx, w, h, pts, PALETTE.red, {bg: '#fbf8f2', title: 'OUR STOCK', ticker: '-97.0%'});
        }} />
      </group>
      <Puff p={prog(T, 113, 115)} position={[0, 0.5, -2]} scale={2.5} />
    </group>
  );
};
