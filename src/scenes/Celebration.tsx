import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {Person} from '../kit/Person';
import {Crab} from '../kit/Crab';
import {Crowd} from '../kit/Crowd';
import {Cutout2D, LogoBadge, CanvasPlane} from '../kit/Planes';
import {Box, City, Floor, Puff, Sky} from '../kit/Env';
import {Ground} from '../kit/Ground';
import {RocketCar} from '../kit/RocketCar';
import {Riders} from './OpenSource';
import {Confetti} from '../kit/Confetti';
import {drawCenteredText} from '../kit/draw';
import {DISPLAY, MONO} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {interp, prog, easeInOut, easeIn, easeOut} from '../lib/anim';
import {cue} from '../timing/cues';

const HIT3 = cue('hit3');
// towers from the logo, left → right, with fall times
const TOWERS: {logo: string; x: number; h: number; w: number; fall: number}[] = [
  {logo: 'salesforce', x: -9, h: 22, w: 5, fall: 304.0},
  {logo: 'aws', x: -3.5, h: 17, w: 5, fall: 307.6},
  {logo: 'google', x: 1.5, h: 15, w: 4, fall: 311.2},
  {logo: 'windows', x: 6, h: 13, w: 3.5, fall: 314.8},
  {logo: 'notion', x: 10.5, h: 11, w: 3.5, fall: HIT3 - 1.6},
];

const CAM: CamKey[] = [
  {f: 287.8, pos: [0, 2.2, 22], look: [0, 4, 0], fov: 50},
  {f: 296, pos: [-6, 6, 26], look: [0, 6, -4], fov: 52},
  {f: 302, pos: [0, 4, 30], look: [0, 8, -10], fov: 55},
  {f: 312, pos: [8, 5, 28], look: [2, 7, -10], fov: 55},
  {f: HIT3, pos: [4, 3, 26], look: [6, 5, -10], fov: 55},
  {f: 321, pos: [-4, 6.5, 15], look: [-3, 2.6, 4], fov: 46},
  {f: 330, pos: [2, 6.5, 14], look: [2, 2.6, 4], fov: 46},
  {f: 337.4, pos: [6, 6.5, 15], look: [5, 2.6, 4], fov: 46},
];

export const CelebrationScene: React.FC = () => {
  const {T} = useSongTime('celebration');
  const f = T * 30;
  const swell = prog(T, 287.8, 300, easeOut);
  const fist = prog(T, 292, 296, easeOut);
  const lap = prog(T, 305, 315);
  const lapA = lap * Math.PI * 2;
  // after the lap: climb up and away out of frame
  const exit = prog(T, 315, 319.5, easeIn);
  const surf = prog(T, 320.5, 337.4);
  const crabX = interp(surf, [[0, -7], [1, 7]]);
  return (
    <Stage bg="#2a1238" bloom={0.7} threshold={0.93}>
      <Sky top="#140a2a" bottom="#ff6a88" />
      <City count={50} seed={80} area={[320, 60]} position={[0, 0, -110]} maxH={120} />
      <Lights />
      <Ground kind="street" size={400} tile={16} />
      {/* SaaS towers topple */}
      {TOWERS.map((t, i) => {
        const p = prog(T, t.fall, t.fall + 1.6, easeIn);
        return (
          <group key={t.logo} position={[t.x, 0, -16]} rotation={[-p * 0.25, 0, -p * 1.4]}>
            <Box size={[t.w, t.h, t.w]} position={[0, t.h / 2, 0]} color={PALETTE.ink} />
            {[[-1, 1], [1, 1]].map(([sx, sz]) => (
              <mesh key={sx} position={[(sx * t.w) / 2, t.h / 2, (sz * t.w) / 2]}>
                <boxGeometry args={[0.12, t.h, 0.12]} />
                <meshBasicMaterial color={i % 2 ? '#ff2bd6' : '#00e5ff'} toneMapped={false} />
              </mesh>
            ))}
            <LogoBadge name={t.logo} size={t.w * 0.7} position={[0, t.h * 0.82, t.w / 2 + 0.08]} />
            
          </group>
        );
      })}
      {/* giant fist + laptop from the logo */}
      {fist > 0 ? (
        <group position={[-2, -14 + fist * 12, -8]} scale={2.6}>
          <Box size={[2.2, 6, 1.6]} position={[0, 3, 0]} color={PALETTE.ink} />
          <Box size={[2.6, 1.8, 1.9]} position={[0, 6.6, 0]} color={PALETTE.ink} />
          <group position={[0, 8.6, 0.1]} rotation={[0, 0, 0.12]}>
            <Box size={[3.4, 2.3, 0.2]} color={PALETTE.ink} />
            <CanvasPlane w={2.9} h={1.8} px={150} position={[0, 0, 0.11]} animate={false} draw={(ctx, w, h) => {
              ctx.fillStyle = PALETTE.paper;
              ctx.fillRect(0, 0, w, h);
              drawCenteredText(ctx, '</>', w, h, MONO, h * 0.5, PALETTE.ink, w, '700');
            }} />
          </group>
        </group>
      ) : null}
      {/* the crowd swells */}
      {[-1, 0, 1].map((k) => (
        <Crowd key={k} count={Math.floor(30 + swell * 40)} seed={500 + k} area={[14, 8]} t={f} cheer={T > 302 ? 1 : 0.5} position={[k * 14, 0, 4]} placardEvery={6} />
      ))}
      <Crowd count={50} seed={590} area={[40, 6]} t={f} cheer={1} position={[0, 0, -4]} placardEvery={5} />
      {/* rocket car victory lap */}
      {lap > 0 && exit < 1 ? (
        <RocketCar position={[Math.cos(lapA) * 14 - exit * 10, 10 + Math.sin(lapA * 2) * 1.5 + exit * 45, -4 + Math.sin(lapA) * 8 - exit * 30]} rotation={[0, -lapA - Math.PI / 2, 0.25 + exit * 0.7]} flame={1.2 + exit}>
          <Riders t={f} cheer />
        </RocketCar>
      ) : null}
      {/* post-chorus: crab crowd-surfs; cast in the crowd */}
      {T > 320 ? (
        <>
          <group position={[crabX, 2.6 + Math.abs(Math.sin(f * 0.15)) * 0.4, 4]} rotation={[0, Math.sin(f * 0.05) * 0.5, Math.sin(f * 0.1) * 0.2]}>
            <Crab t={f} pose="cheer" scale={1.2} />
          </group>
          <Person t={f} outfit="hoodie" head={{photo: 'linus'}} pose="cheer" position={[-3, 0.9, 6]} />
          <Person t={f + 10} outfit="reaper" head={{mask: 'fawkes'}} scythe pose="cheer" position={[1.5, 0.9, 6.5]} />
          <Cutout2D kind="mickey" height={1.8} position={[4.5, 1.8 + Math.abs(Math.sin(f * 0.2)) * 0.4, 6.2]} />
          <Cutout2D kind="clippy" height={1.5} position={[-6, 1.7 + Math.abs(Math.sin(f * 0.25)) * 0.3, 6.3]} />
          <Confetti t={f} area={[24, 12, 10]} position={[0, 0, 2]} />
        </>
      ) : null}
      <CameraRig keys={CAM} frame={T} ease={easeInOut} />
    </Stage>
  );
};
