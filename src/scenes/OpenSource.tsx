import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {RocketCar, SEATS} from '../kit/RocketCar';
import {Person} from '../kit/Person';
import {Crab} from '../kit/Crab';
import {Crowd} from '../kit/Crowd';
import {Bubble, CanvasPlane, Cutout2D} from '../kit/Planes';
import {Bird, Box, Floor, Minecart, Puff, Rail, Sky, Explosion} from '../kit/Env';
import {drawFawkes} from '../kit/draw';
import {MONO} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {rng} from '../lib/rng';
import {interp, prog, easeInOut, easeOut, easeIn} from '../lib/anim';

type V3 = [number, number, number];

/** The four riders. `seated` places them in seats; `t` frame for idle anims; extras control gags. */
export const Riders: React.FC<{t: number; seated?: boolean; linusMask?: number; linusPose?: 'sit' | 'throw'; reaperPose?: 'sit' | 'throw'; cheer?: boolean}> = ({t, seated = true, linusMask = 1, linusPose = 'sit', reaperPose = 'sit', cheer}) => {
  const sit = {hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, bob: -0.45};
  return (
    <group>
      <group position={SEATS.linus}>
        <Person t={t} outfit="hoodie" head={linusMask >= 1 ? {mask: 'anon'} : {photo: 'linus'}} pose={cheer ? 'cheer' : linusPose === 'throw' ? 'throw' : 'sit'} angles={seated ? sit : undefined} rotation={[0, Math.PI / 2 + (linusPose === 'throw' ? 1.2 : 0), 0]} scale={0.8}
          holding={linusPose === 'throw' ? <mesh><sphereGeometry args={[0.08, 8, 6]} /><meshToonMaterial color="#3d5a2a" /></mesh> : undefined} />
      </group>
      <group position={SEATS.reaper}>
        <Person t={t} outfit="reaper" head={{mask: 'fawkes'}} scythe={reaperPose !== 'throw'} pose={cheer ? 'cheer' : reaperPose === 'throw' ? 'throw' : 'sit'} angles={seated ? sit : undefined} rotation={[0, Math.PI / 2 + (reaperPose === 'throw' ? 1.2 : 0), 0]} scale={0.8} />
      </group>
      <Cutout2D kind="mickey" height={1.3} position={[SEATS.mickey[0], SEATS.mickey[1] + 0.75, SEATS.mickey[2]]} rotation={[0, 0, 0]} />
      <Cutout2D kind="clippy" height={1.1} position={[SEATS.clippy[0], SEATS.clippy[1] + 0.7, SEATS.clippy[2]]} />
    </group>
  );
};

// ───────────────────────── rocketCar: boarding (118–130.2)
const BOARD_CAM: CamKey[] = [
  {f: 118, pos: [0, 4, 16], look: [0, 1.5, 0], fov: 45},
  {f: 121.5, pos: [4, 1.8, 6.5], look: [0, 0.9, 0.8], fov: 40},
  {f: 125.5, pos: [-3.5, 1.6, 5.5], look: [-0.3, 0.9, 0.6], fov: 40},
  {f: 127, pos: [1.5, 3.4, 5.5], look: [0.2, 1.2, 0], fov: 42},
  {f: 130.2, pos: [3, 4.5, 8], look: [0.5, 1.2, 0], fov: 42},
];

const Pad: React.FC<{T: number}> = ({T}) => (
  <group>
    <Sky top="#f5f2eb" bottom="#f5f2eb" />
    {/* big red poster sun */}
    <mesh position={[-20, 14, -60]}>
      <circleGeometry args={[14, 48]} />
      <meshBasicMaterial color={PALETTE.red} />
    </mesh>
    <Floor color="#d9d3c6" size={300} />
    {/* launch track: flat then ramp up to the sky */}
    <Rail length={14} position={[-7, 0, 0]} color={PALETTE.ink} />
    <Rail length={60} position={[7, 0, 0]} rotation={[0, 0, 0.42]} color={PALETTE.ink} />
    {Array.from({length: 10}, (_, i) => (
      <Box key={i} size={[0.25, (7 + i * 5.4) * Math.tan(0.42) - 2.3, 0.25]} position={[7 + i * 5.4 + 2.5, ((7 + i * 5.4) * Math.tan(0.42) - 2.3) / 2 - 0.1, 0]} color={PALETTE.ink} />
    ))}
    <Crowd count={60} seed={21} area={[40, 6]} t={T * 30} cheer={0.4} position={[0, 0, -9]} />
  </group>
);

export const RocketCarScene: React.FC = () => {
  const {T} = useSongTime('rocketCar');
  const f = T * 30;
  // boarding walkers arrive from the left then hop in
  const walkIn = (start: number): number => prog(T, start, start + 2.4, easeInOut);
  const lin = walkIn(119);
  const rea = walkIn(120.5);
  const seatedLinus = T > 121.6;
  const seatedReaper = T > 123.1;
  return (
    <Stage bg={PALETTE.paper}>
      <Lights />
      <Pad T={T} />
      <RocketCar position={[0, 0.1, 0]}>
        {seatedLinus ? null : null}
        <group>
          {seatedLinus ? (
            <group position={SEATS.linus}><Person t={f} outfit="hoodie" head={{mask: 'anon'}} pose="sit" angles={{hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, bob: -0.45}} rotation={[0, Math.PI / 2, 0]} scale={0.8} /></group>
          ) : null}
          {seatedReaper ? (
            <group position={SEATS.reaper}><Person t={f} outfit="reaper" head={{mask: 'fawkes'}} scythe pose="sit" rotation={[0, Math.PI / 2, 0]} scale={0.8} /></group>
          ) : null}
          <Cutout2D kind="mickey" height={1.3} position={[SEATS.mickey[0], SEATS.mickey[1] + 0.75 + (T < 124 ? Math.max(0, Math.sin((T - 123) * 4)) * 0.6 * (T > 123 ? 1 : 0) : 0), SEATS.mickey[2]]} />
          <Cutout2D kind="clippy" height={1.1} position={[SEATS.clippy[0], SEATS.clippy[1] + 0.7, SEATS.clippy[2]]} />
        </group>
      </RocketCar>
      {!seatedLinus ? <Person t={f} outfit="hoodie" head={{mask: 'anon'}} pose="walk" position={[interp(lin, [[0, -9], [1, 0.9]]), 0, 2.0 - lin * 1.6]} rotation={[0, Math.PI / 2, 0]} scale={0.8}
        holding={<Box size={[0.4, 0.28, 0.03]} color="#222" />} /> : null}
      {!seatedReaper ? <Person t={f} outfit="reaper" head={{mask: 'fawkes'}} scythe pose="walk" position={[interp(rea, [[0, -10], [1, -0.5]]), 0, 2.2 - rea * 1.8]} rotation={[0, Math.PI / 2, 0]} scale={0.8} /> : null}
      {/* sack of birds next to the reaper's seat */}
      <group position={[-1.2, 0.75, -0.7]}>
        <mesh><sphereGeometry args={[0.28, 10, 8]} /><meshToonMaterial color="#8a6a3e" /></mesh>
        <Bird t={f} position={[0, 0.35, 0]} scale={0.8} />
      </group>
      {T > 122 && T < 128 ? <Bubble text="Would you like help seizing the means of production?" w={2.8} size={0.24} position={[-0.9, 2.55, 0.6]} /> : null}
      <CameraRig keys={BOARD_CAM} frame={T} ease={easeInOut} />
    </Stage>
  );
};

// ───────────────────────── crabDebris (130.2–134.6)
const CRAB_CAM: CamKey[] = [
  {f: 130.2, pos: [0, 0.8, 4.5], look: [0, 0.5, 0], fov: 40},
  {f: 134.6, pos: [0.8, 0.9, 3.0], look: [0, 0.8, 0], fov: 38},
];
export const CrabDebrisScene: React.FC = () => {
  const {T} = useSongTime('crabDebris');
  const f = T * 30;
  const climb = prog(T, 130.4, 132.2, easeOut);
  const r = rng(77);
  const rubble = Array.from({length: 22}, () => ({x: (r() - 0.5) * 4, y: r() * 0.6, z: (r() - 0.5) * 2 - 0.6, s: 0.3 + r() * 0.6, rot: r() * 3, c: ['#eef1f5', PALETTE.red, '#2b2e36', '#9a948a'][Math.floor(r() * 4)]}));
  return (
    <Stage bg="#f0d8b8">
      <Sky top="#e9a26b" bottom="#f6e2c4" />
      <Lights warm />
      <Floor color="#b9a98f" />
      {rubble.map((b, i) => (
        <Box key={i} size={[b.s, b.s * 0.5, b.s * 0.7]} position={[b.x, b.y * 0.5, b.z]} rotation={[b.rot, b.rot * 2, b.rot * 0.5]} color={b.c} />
      ))}
      {Array.from({length: 4}, (_, i) => (
        <Puff key={i} p={((T - 130.2) * 0.3 + i * 0.25) % 1} position={[-1 + i * 0.7, 0.8 + i * 0.2, -1.2]} scale={0.7} color="#bdb6a8" />
      ))}
      <group position={[0, interp(climb, [[0, -0.9], [1, 0.25]]), 0.3]}>
        <Crab t={f} pose={climb < 1 ? 'idle' : 'walk'} position={[climb >= 1 ? (T - 132.2) * 0.4 : 0, 0, 0]} scale={0.6} />
        {/* glowing source code held overhead */}
        <group position={[climb >= 1 ? (T - 132.2) * 0.4 : 0, 1.15 + Math.sin(f * 0.2) * 0.03, 0.1]} rotation={[0, 0.1, 0]}>
          <Box size={[1.3, 0.6, 0.3]} color="#f5f2eb" />
          <CanvasPlane w={1.3} h={0.6} px={400} position={[0, 0, 0.16]} draw={(ctx, w, h, fr) => {
            ctx.fillStyle = '#0f1a12';
            ctx.fillRect(0, 0, w, h);
            ctx.font = `700 ${h * 0.12}px ${MONO}`;
            ctx.fillStyle = '#7dff9a';
            const lines = ['int main(void) {', '  fork();', '  return FREE;', '}', '// SOURCE CODE'];
            lines.forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.18 + i * 0.17)));
          }} />
          
        </group>
      </group>
      <CameraRig keys={CRAB_CAM} frame={T} ease={easeInOut} />
    </Stage>
  );
};

// ───────────────────────── slowmo (134.6–151.6)
/** Virtual time: 1/10 speed between 140 and 148. */
export function tau(T: number): number {
  if (T < 140) return T;
  if (T < 148) return 140 + (T - 140) * 0.1;
  return 140.8 + (T - 148);
}

const SLOW_CAM: CamKey[] = [
  {f: 134.6, pos: [-6, 2.2, 7], look: [0, 1, 0], fov: 45},
  {f: 137.5, pos: [-3, 3, 9], look: [2, 1.5, 0], fov: 45},
  {f: 140.0, pos: [1.5, 2.6, 5.0], look: [0, 1, -1.6], fov: 45},
  {f: 141.0, pos: [2.6, 1.8, 1.6], look: [0.9, 1.3, -0.45], fov: 40},
  {f: 143.4, pos: [2.4, 1.7, 1.4], look: [0.9, 1.35, -0.45], fov: 32},
  {f: 144.4, pos: [3.0, 2.8, 3.0], look: [0.3, 0.8, -2.2], fov: 45},
  {f: 145.4, pos: [-2.8, 2.7, -5.0], look: [-0.5, 1.2, -0.6], fov: 40},
  {f: 147.6, pos: [-1.6, 3.0, -5.8], look: [-0.2, 1.1, -1.8], fov: 44},
  {f: 148.6, pos: [0, 3.5, 7], look: [0, 0, -3], fov: 48},
  {f: 151.6, pos: [0, 5, 10], look: [0, -2, -3], fov: 48},
];

export const SlowmoScene: React.FC = () => {
  const {T} = useSongTime('slowmo');
  const v = tau(T);
  const fv = v * 30;
  const launch = T < 140;
  const flame = 1 + 0.3 * Math.sin(fv * 1.3);
  // car speed: scrolling world
  const scroll = v * 30;
  const slow = T >= 140 && T < 148;
  const maskOff = prog(T, 140.6, 141.6);
  const grenadeP = prog(T, 143.4, 145.0);
  const birdP = prog(T, 145.6, 147.8);
  const after = T >= 148;
  const cartFall = prog(T, 148.4, 151.6, easeIn);
  const r = rng(5);
  const clouds = Array.from({length: 18}, () => ({x: r() * 120, y: -4 + r() * 12, z: -6 - r() * 30, s: 1 + r() * 3}));
  return (
    <Stage bg="#9fc3e8">
      <Sky top="#6e9fd6" bottom="#f5f2eb" />
      <Lights />
      {launch && T < 137 ? (
        <group position={[-(T - 134.6) * (T - 134.6) * 4, -(T - 134.6) * (T - 134.6) * 1.2, 0]}>
          <Floor color="#d9d3c6" size={300} y={-0.1} />
          <Crowd count={60} seed={21} area={[40, 6]} t={fv} cheer={1} position={[0, 0, -9]} />
        </group>
      ) : null}
      {/* clouds scroll past */}
      {clouds.map((c, i) => (
        <Puff key={i} p={0.35} position={[((c.x - scroll) % 120 + 120) % 120 - 60, c.y, c.z]} scale={c.s} color="#ffffff" />
      ))}
      {/* speed lines */}
      {Array.from({length: 14}, (_, i) => (
        <Box key={i} size={[3 + (i % 3), 0.03, 0.03]} position={[((i * 9 - scroll * 1.5) % 40 + 40) % 40 - 20, -1 + (i % 7) * 0.7, 1.5 + (i % 4)]} color="#ffffff" basic opacity={0.6} />
      ))}
      <RocketCar position={[0, Math.sin(fv * 0.15) * 0.05, 0]} flame={flame}>
        <Riders t={fv} linusMask={maskOff > 0 ? 0 : 1} linusPose={T > 143.2 && T < 145.4 ? 'throw' : 'sit'} reaperPose={T > 145.4 && T < 148 ? 'throw' : 'sit'} />
      </RocketCar>
      {/* the falling Anonymous mask */}
      {maskOff > 0 && maskOff < 1 ? (
        <CanvasPlane w={0.4} h={0.5} px={300} lit position={[0.9 + maskOff * 0.8, 1.6 + maskOff * 0.6 - maskOff * maskOff * 1.6, -0.45 + maskOff * 0.6]} rotation={[maskOff * 2, maskOff * 3, maskOff]} animate={false} draw={(ctx, w, h) => drawFawkes(ctx, w, h, {pale: true})} />
      ) : null}
      {/* minecart rail alongside */}
      <group position={[0, after ? -cartFall * 10 : 0, -2.8]} rotation={[after ? cartFall * 1.5 : 0, 0, after ? cartFall * 2 : 0]}>
        <Minecart position={[0, -0.2, 0]} />
        <Person t={fv} outfit="suit" tie="red" pose="panic" angles={{hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, bob: -0.2}} rotation={[0, 0.4, 0]} />
        <Puff p={prog(T, 148, 149.6)} position={[0, 1.2, 0]} scale={1.6} color="#555" />
      </group>
      <Rail length={200} position={[-100, -0.3, -2.8]} color="#555" />
      {/* grenades arcing in slow-mo */}
      {grenadeP > 0 && grenadeP < 1
        ? [0, 1].map((k) => {
            const p = Math.max(0, Math.min(1, grenadeP * 1.2 - k * 0.2));
            return (
              <group key={k} position={[0.9 - k * 0.3 - p * 0.6, 1.5 + Math.sin(p * Math.PI) * 1.2 - p * 0.6, -0.45 - p * 2.3]} rotation={[p * 6, p * 4, 0]}>
                <mesh><sphereGeometry args={[0.1, 10, 8]} /><meshToonMaterial color="#3d5a2a" /></mesh>
                <mesh position={[0, 0.11, 0]}><torusGeometry args={[0.04, 0.012, 6, 12]} /><meshToonMaterial color="#aaa" /></mesh>
              </group>
            );
          })
        : null}
      {/* two birds thrown in slow-mo */}
      {birdP > 0 && !after
        ? [0, 1].map((k) => {
            const p = Math.max(0, Math.min(1, birdP * 1.15 - k * 0.15));
            return <Bird key={k} t={fv * 6} position={[-0.5 + k * 0.3 + p * 0.5, 1.6 + Math.sin(p * Math.PI) * 0.8 - p * 0.4, -0.45 - p * 2.2]} rotation={[0, Math.PI / 2, 0]} scale={1.3} />;
          })
        : null}
      <Explosion p={prog(T, 148, 149.4)} position={[0, 0.8, -2.8]} scale={1.1} />
      {/* slow-mo letterbox hint */}
      {slow ? (
        <CanvasPlane w={0.0001} h={0.0001} px={1} draw={() => {}} />
      ) : null}
      <CameraRig keys={SLOW_CAM} frame={T} ease={easeInOut} />
    </Stage>
  );
};
