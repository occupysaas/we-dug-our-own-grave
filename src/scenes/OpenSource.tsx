import React from 'react';
import * as THREE from 'three';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {RocketCar, SEATS} from '../kit/RocketCar';
import {Person} from '../kit/Person';
import {Crab} from '../kit/Crab';
import {Crowd} from '../kit/Crowd';
import {Bubble, CanvasPlane, Cutout2D, ClippyBalloon} from '../kit/Planes';
import {Ground} from '../kit/Ground';
import {Bird, Box, City, Floor, Minecart, Puff, Rail, Sky, Explosion} from '../kit/Env';
import {drawFawkes} from '../kit/draw';
import {MONO} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {rng} from '../lib/rng';
import {interp, prog, easeInOut, easeOut, easeIn} from '../lib/anim';

type V3 = [number, number, number];

/** The four riders. `seated` places them in seats; `t` frame for idle anims; extras control gags. */
export const Riders: React.FC<{t: number; seated?: boolean; linusMask?: number; linusPose?: 'sit' | 'throw' | 'look'; reaperPose?: 'sit' | 'throw' | 'flip'; cheer?: boolean}> = ({t, seated = true, linusMask = 1, linusPose = 'sit', reaperPose = 'sit', cheer}) => {
  const sit = {hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, bob: -0.45};
  return (
    <group>
      <group position={SEATS.linus}>
        <Person t={t} outfit="hoodie" head={linusMask >= 1 ? {mask: 'anon'} : {photo: 'linus'}} pose={cheer ? 'cheer' : linusPose === 'throw' ? 'throw' : 'sit'} angles={seated ? sit : undefined} rotation={[0, Math.PI / 2 + (linusPose !== 'sit' ? 1.3 : 0), 0]} scale={0.8}
          holding={linusPose === 'throw' ? <mesh><sphereGeometry args={[0.08, 8, 6]} /><meshToonMaterial color="#3d5a2a" /></mesh> : undefined} />
      </group>
      <group position={SEATS.reaper}>
        <Person t={t} outfit="reaper" head={{mask: 'fawkes'}} scythe={reaperPose === 'sit' && !cheer} pose={cheer ? 'cheer' : reaperPose === 'throw' ? 'throw' : 'sit'} scale={0.8}
          angles={reaperPose === 'flip' ? {...(seated ? sit : {}), shoulderL: 1.45 + Math.sin(t * 0.35) * 0.08, shoulderR: 1.45 + Math.sin(t * 0.35 + 1) * 0.08, spreadL: 0.25, spreadR: 0.25, elbowL: -1.5, elbowR: -1.5, spine: 0.1} : seated ? sit : undefined}
          middleFingers={reaperPose === 'flip'}
          rotation={[0, Math.PI / 2 + (reaperPose !== 'sit' ? 1.3 : 0), 0]} />
      </group>
      <Cutout2D kind="mickey" height={1.3} position={[SEATS.mickey[0], SEATS.mickey[1] + 0.75, SEATS.mickey[2]]} rotation={[0, 0, 0]} />
      <Cutout2D kind="clippy" height={1.1} position={[SEATS.clippy[0], SEATS.clippy[1] + 0.7, SEATS.clippy[2]]} />
    </group>
  );
};

/** Moon hanging in the sky (with halo). */
export const SkyMoon: React.FC<{position: [number, number, number]; r?: number}> = ({position, r = 30}) => (
  <group position={position}>
    <mesh><sphereGeometry args={[r, 32, 24]} /><meshBasicMaterial color="#f3efe2" toneMapped={false} /></mesh>
    <mesh position={[r * 0.3, r * 0.2, r * 0.9]}><circleGeometry args={[r * 0.18, 20]} /><meshBasicMaterial color="#d8d2c2" /></mesh>
    <mesh position={[-r * 0.35, -r * 0.25, r * 0.88]}><circleGeometry args={[r * 0.24, 20]} /><meshBasicMaterial color="#d8d2c2" /></mesh>
  </group>
);

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
    <Sky top="#140a2a" bottom="#ff6a88" />
    <SkyMoon position={[60, 90, -260]} r={34} />
    <Ground kind="concrete" size={400} tile={6} y={-0.01} />
    <Ground kind="asphalt" size={[400, 8]} tile={8} y={0.0} />
    <City count={60} seed={33} area={[300, 40]} position={[0, 0, -60]} maxH={110} />
    <Crowd count={70} seed={21} area={[46, 5]} t={T * 30} cheer={0.5} position={[0, 0, -7.5]} />
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
    <Stage bg="#2a1238">
      <Lights intensity={0.9} />
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
      {T > 122 && T < 128 ? <ClippyBalloon w={2.3} position={[-0.6, 2.15, 1.0]} /> : null}
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
    <Stage bg="#2a1238">
      <Sky top="#1c0d30" bottom="#ff7a5c" />
      <Lights warm />
      <Ground kind="concrete" size={200} tile={4} />
      <City count={30} seed={78} area={[160, 40]} position={[0, 0, -70]} maxH={80} />
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

type V3s = [number, number, number];
const R = 3.3;
const THETA0 = 0.4;
/** Orbit angle of the car around the falling minecart: fast, then 1/10-speed slow-mo. */
function theta(T: number) {
  return T < 140 ? THETA0 + (140 - T) * 1.6 : THETA0 - (T - 140) * 0.17;
}
function rotY(v: V3s, phi: number): V3s {
  return [v[0] * Math.cos(phi) + v[2] * Math.sin(phi), v[1], -v[0] * Math.sin(phi) + v[2] * Math.cos(phi)];
}
function add(a: V3s, b: V3s): V3s {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function lerp3(a: V3s, b: V3s, k: number): V3s {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

const CLOUDS = (() => {
  const r = rng(808);
  return Array.from({length: 46}, () => {
    const a = r() * Math.PI * 2, d = 6 + r() * 26;
    return {x: Math.cos(a) * d, z: Math.sin(a) * d, y0: r() * 60, s: 2 + r() * 4};
  });
})();

/** Clouds rising past (we are falling). `fall` = distance fallen so far. */
const FallingClouds: React.FC<{fall: number}> = ({fall}) => (
  <group>
    {CLOUDS.map((c, i) => (
      <Puff key={i} p={0.3} position={[c.x, (((c.y0 + fall) % 60) + 60) % 60 - 30, c.z]} scale={c.s} color="#f4ecf6" />
    ))}
  </group>
);

export const SlowmoScene: React.FC = () => {
  const {T} = useSongTime('slowmo');
  const v = tau(T);
  const fv = v * 30;
  if (T < 137.6) return <Launch T={T} />;
  if (T < 139.2) return <Climb T={T} />;
  const th = theta(T);
  const phi = Math.PI / 2 - th;
  const after = T >= 148;
  const drop = after ? (T - 148) * (T - 148) * 7 : 0;
  const carLift = after ? Math.max(0, T - 148.6) ** 2 * 5 : 0;
  const carPos: V3s = [R * Math.cos(th), 0.3 + Math.sin(fv * 0.15) * 0.05 + carLift, R * Math.sin(th)];
  const local = (seat: V3s): V3s => add(carPos, rotY([seat[0], seat[1] + 1.0, seat[2]], phi));
  const linusHead = local(SEATS.linus);
  const reaperHead = local(SEATS.reaper);
  const cart: V3s = [0, 0.8 - drop, 0];
  const maskOff = prog(T, 140.6, 141.6);
  const grenadeP = prog(T, 143.4, 145.2);
  const birdP = prog(T, 145.6, 147.8);
  const outward = (p: V3s): V3s => {
    const l = Math.hypot(p[0], p[2]);
    return [p[0] / l, 0, p[2] / l];
  };
  const oL = outward(linusHead), oR = outward(reaperHead);
  const linusYaw = Math.PI / 2 + 1.3;
  const linusFace = rotY([Math.sin(linusYaw), 0, Math.cos(linusYaw)], phi);
  const linusSide: V3s = [-linusFace[2], 0, linusFace[0]];
  const linusHeadW: V3s = [linusHead[0] - linusFace[2] * 0.12, carPos[1] + 0.55 + 0.72, linusHead[2] + linusFace[0] * 0.12];
  // exact world position of Linus's face (seat + seated head height + face offset), through the car's full rotation
  const carEuler = new THREE.Euler(after ? -Math.min(0.9, (T - 148.6) * 0.8) : 0, phi, after ? 0 : -0.25);
  const faceLocal = new THREE.Vector3(SEATS.linus[0] + 0.2 * Math.sin(linusYaw), SEATS.linus[1] + 0.97, SEATS.linus[2] + 0.2 * Math.cos(linusYaw)).applyEuler(carEuler);
  const faceW: V3s = [carPos[0] + faceLocal.x, carPos[1] + faceLocal.y, carPos[2] + faceLocal.z];
  const faceDir = new THREE.Vector3(Math.sin(linusYaw), 0, Math.cos(linusYaw)).applyEuler(carEuler);
  // camera per beat
  let camPos: V3s, camLook: V3s, fov = 45;
  if (T < 140.6) {
    const a = th + 2.2;
    camPos = [7.5 * Math.cos(a), 2.4, 7.5 * Math.sin(a)];
    camLook = [0, 0.6, 0];
  } else if (T < 143.4) {
    // the Suit's POV: looking out at Linus as the mask falls
    const k = prog(T, 140.6, 141.8, easeInOut);
    const yaw = Math.PI / 2 + 1.3;
    const face = rotY([Math.sin(yaw), 0, Math.cos(yaw)], phi);
    const headW: V3s = [linusHead[0] - face[2] * 0.12, carPos[1] + 0.55 + 0.72, linusHead[2] + face[0] * 0.12];
    camPos = lerp3(add(headW, [face[0] * 3.2, 0.5, face[2] * 3.2]), add(headW, [face[0] * 1.7, 0.05, face[2] * 1.7]), k);
    camLook = headW;
    fov = 36;
  } else if (T < 145.4) {
    camPos = add(linusHead, [oL[0] * 1.8, 0.7, oL[2] * 1.8]);
    camLook = [0, 0.7, 0];
    fov = 50;
  } else if (T < 148) {
    if (T < 145.6) {
      camPos = add(reaperHead, [oR[0] * 1.8, 0.8, oR[2] * 1.8]);
      camLook = [0, 0.7, 0];
      fov = 50;
    } else {
      // from the Suit's side, facing the Reaper as he flips him off with both hands
      const rEuler = new THREE.Euler(0, phi, -0.25);
      const rHead = new THREE.Vector3(SEATS.reaper[0], SEATS.reaper[1] + 0.85, SEATS.reaper[2]).applyEuler(rEuler);
      const rFace = new THREE.Vector3(Math.sin(linusYaw), 0, Math.cos(linusYaw)).applyEuler(rEuler);
      const head: V3s = [carPos[0] + rHead.x, carPos[1] + rHead.y, carPos[2] + rHead.z];
      const k = prog(T, 145.6, 147.6, easeInOut);
      camPos = add(head, [rFace.x * (2.6 - k * 0.6), 0.15 + rFace.y, rFace.z * (2.6 - k * 0.6)]);
      camLook = add(head, [0, -0.05, 0]);
      fov = 42;
    }
  } else {
    camPos = [carPos[0] * 1.6, 4 + carLift * 0.6, carPos[2] * 1.6 + 4];
    camLook = [carPos[0] * 0.5, -drop * 0.4 + carLift * 0.5, carPos[2] * 0.5];
    fov = 55;
  }
  const grenadeFrom = add(linusHead, [0, -0.2, 0]);
  const birdFrom = add(reaperHead, [0, -0.1, 0]);
  return (
    <Stage bg="#7a5ca8" bloom={0.5} threshold={0.95}>
      <Sky top="#2a1a5a" bottom="#ffb0c8" />
      <SkyMoon position={[80, 140, -220]} r={40} />
      <Lights intensity={1.1} />
      <FallingClouds fall={(v - 139.2) * 9} />
      {/* the falling Suit in the minecart */}
      <group position={cart} rotation={[Math.sin(fv * 0.04) * 0.25 + (after ? (T - 148) * 2 : 0), fv * 0.01, Math.sin(fv * 0.03) * 0.2]}>
        <Minecart position={[0, -0.8, 0]} />
        <Person t={fv} outfit="suit" tie="red" pose="panic" angles={{hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, bob: -0.95}} />
        <Puff p={prog(T, 148, 149.6)} position={[0, 0.4, 0]} scale={1.8} color="#555" />
      </group>
      <Explosion p={prog(T, 148, 149.4)} position={cart} scale={1.1} />
      {/* the rocket car orbiting */}
      <RocketCar position={carPos} rotation={[after ? -Math.min(0.9, (T - 148.6) * 0.8) : 0, phi, after ? 0 : -0.25]} flame={1 + 0.3 * Math.sin(fv * 1.3)}>
        <Riders t={fv} linusMask={maskOff > 0 ? 0 : 1} linusPose={T > 143.2 && T < 145.4 ? 'throw' : T > 140.6 && T < 145.4 ? 'look' : 'sit'} reaperPose={T > 145.4 && T < 148 ? 'flip' : 'sit'} cheer={after} />
      </RocketCar>
      {/* the Anonymous mask peels off his face toward camera and tumbles up/aside in slow-mo */}
      {maskOff > 0 && maskOff < 1 ? (
        <CanvasPlane
          w={0.4}
          h={0.5}
          px={300}
          lit
          position={[
            faceW[0] + faceDir.x * (0.06 + maskOff * 1.1) + linusSide[0] * maskOff * 0.7,
            faceW[1] + faceDir.y * 0.06 + Math.sin(maskOff * Math.PI) * 0.45 - maskOff * 0.2,
            faceW[2] + faceDir.z * (0.06 + maskOff * 1.1) + linusSide[2] * maskOff * 0.7,
          ]}
          rotation={[maskOff * 1.6, Math.atan2(faceDir.x, faceDir.z) + maskOff * 2.2, -0.25 + maskOff * 0.9]}
          animate={false}
          draw={(ctx, w, h) => drawFawkes(ctx, w, h, {pale: true})}
        />
      ) : null}
      {/* grenades arcing in slow-mo */}
      {grenadeP > 0 && grenadeP < 1
        ? [0, 1].map((k) => {
            const p = Math.max(0, Math.min(1, grenadeP * 1.25 - k * 0.25));
            const pos = lerp3(grenadeFrom, cart, p);
            return (
              <group key={k} position={[pos[0], pos[1] + Math.sin(p * Math.PI) * 0.9, pos[2]]} rotation={[p * 6, p * 4, 0]}>
                <mesh><sphereGeometry args={[0.1, 10, 8]} /><meshToonMaterial color="#3d5a2a" /></mesh>
                <mesh position={[0, 0.11, 0]}><torusGeometry args={[0.04, 0.012, 6, 12]} /><meshToonMaterial color="#aaa" /></mesh>
              </group>
            );
          })
        : null}

      {/* slow-mo caption */}
      {T >= 140 && T < 148 ? (
        <CanvasPlane w={0.0001} h={0.0001} px={1} draw={() => {}} />
      ) : null}
      <CameraRig keys={[{f: 0, pos: camPos, look: camLook, fov}]} frame={0} />
    </Stage>
  );
};

/** 134.6–137.6: the car drives off down the neon road and lifts off toward the moon. */
const Launch: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  const dt = T - 134.6;
  const x = 3.2 * dt * dt;
  const lift = Math.max(0, T - 136.0);
  const y = 0.1 + lift * lift * 4;
  const pitch = Math.min(0.55, lift * 0.7);
  return (
    <Stage bg="#2a1238">
      <Lights intensity={0.9} />
      <Pad T={T} />
      <RocketCar position={[x, y, 0]} rotation={[0, 0, pitch]} flame={1.3 + 0.3 * Math.sin(f * 1.3)}>
        <Riders t={f} cheer={lift > 0.3} />
      </RocketCar>
      {Array.from({length: 6}, (_, i) => (
        <Puff key={i} p={((dt * 1.5 + i / 6) % 1)} position={[x - 3 - i * 1.2, 0.4, (i % 2 ? 0.6 : -0.6)]} scale={0.8} color="#cfc8d8" />
      ))}
      <CameraRig frame={T} keys={[
        {f: 134.6, pos: [-5, 1.6, 8], look: [0, 1, 0], fov: 45},
        {f: 136.2, pos: [x * 0 + 4, 1.8, 10], look: [8, 1.2, 0], fov: 48},
        {f: 137.6, pos: [14, 3, 14], look: [24, 6, 0], fov: 50},
      ]} />
    </Stage>
  );
};

/** 137.6–139.2: climbing through clouds toward the moon. */
const Climb: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  return (
    <Stage bg="#7a5ca8" bloom={0.5} threshold={0.95}>
      <Sky top="#2a1a5a" bottom="#ffb0c8" />
      <SkyMoon position={[40, 120, -200]} r={40} />
      <Lights intensity={1.1} />
      <group rotation={[0, 0, 0]}>
        <FallingClouds fall={-(T - 137.6) * 25} />
      </group>
      <RocketCar position={[0, 0, 0]} rotation={[0, -0.3, 0.6]} flame={1.4 + 0.3 * Math.sin(f * 1.3)}>
        <Riders t={f} cheer />
      </RocketCar>
      <CameraRig frame={T} keys={[
        {f: 137.6, pos: [-6, -3, 6], look: [0, 0.5, 0], fov: 50},
        {f: 139.2, pos: [-4, -1.5, 7], look: [2, 2, 0], fov: 50},
      ]} />
    </Stage>
  );
};
