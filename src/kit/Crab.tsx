import React from 'react';
import {PALETTE} from '../lib/palette';

export type CrabPose = 'idle' | 'walk' | 'smash' | 'cheer' | 'carry' | 'present' | 'tumble' | 'pilot';
type V3 = [number, number, number];

const V = 0.25; // voxel size

/**
 * Voxel "Clawd": chunky orange block body, two tall black eyes, side arm nubs with claws, four stubby legs.
 * `t` = frame (local). `phase` (0..1) drives one-shot actions like smash.
 */
export const Crab: React.FC<{pose?: CrabPose; t: number; phase?: number; position?: V3; rotation?: V3; scale?: number; hologram?: boolean; color?: string}> = ({
  pose = 'idle', t, phase = 0, position, rotation, scale = 1, hologram = false, color = PALETTE.crab,
}) => {
  const s = Math.sin;
  let bob = 0.03 * s(t * 0.15);
  let armL = 0, armR = 0, legSwing = 0, squash = 1, bodyTilt = 0, armFwd = 0;
  switch (pose) {
    case 'walk':
      legSwing = 0.6 * s(t * 0.5);
      bob = 0.06 * Math.abs(s(t * 0.5));
      armL = 0.2 * s(t * 0.5);
      armR = -0.2 * s(t * 0.5);
      break;
    case 'smash': {
      // phase 0..0.6 raise, 0.6..0.75 slam, then settle
      const up = phase < 0.6 ? phase / 0.6 : phase < 0.75 ? 1 - (phase - 0.6) / 0.15 : 0;
      armR = 2.6 * up;
      armL = 0.4 * up;
      bob = 0.25 * up;
      squash = phase > 0.75 && phase < 0.85 ? 0.8 : 1;
      bodyTilt = -0.25 * up;
      break;
    }
    case 'cheer':
      armL = 2.4 + 0.4 * s(t * 0.6);
      armR = 2.4 + 0.4 * s(t * 0.6 + 1);
      bob = 0.25 * Math.max(0, s(t * 0.3));
      squash = 1 + 0.08 * s(t * 0.6);
      break;
    case 'carry':
      armFwd = 1.3;
      legSwing = 0.5 * s(t * 0.5);
      bob = 0.05 * Math.abs(s(t * 0.5));
      break;
    case 'present':
      armR = 1.2 + 0.2 * s(t * 0.12);
      armL = 0.2;
      break;
    case 'tumble':
      bodyTilt = t * 0.25;
      armL = 2;
      armR = 2;
      break;
    case 'pilot':
      armL = 0.7 + 0.25 * s(t * 0.4);
      armR = 0.7 + 0.25 * s(t * 0.4 + 2);
      armFwd = 0.6;
      break;
  }
  const flick = hologram ? 0.75 + 0.2 * Math.abs(s(t * 0.9)) * (Math.floor(t / 7) % 5 === 0 ? 0.3 : 1) : 1;
  const mat = hologram ? (
    <meshBasicMaterial color={color} transparent opacity={0.55 * flick} toneMapped={false} />
  ) : (
    <meshToonMaterial color={color} />
  );
  const eyeMat = hologram ? <meshBasicMaterial color="#3a1206" transparent opacity={0.8 * flick} /> : <meshBasicMaterial color="#111" />;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, bob, 0]} rotation={[0, 0, bodyTilt]} scale={[1, squash, 1]}>
        {/* body: 6 x 4 x 4 voxels */}
        <mesh position={[0, 2.5 * V, 0]}>
          <boxGeometry args={[6 * V, 3 * V, 4 * V]} />
          {mat}
        </mesh>
        {/* eyes */}
        {[-1.3, 1.3].map((x) => (
          <mesh key={x} position={[x * V, 2.8 * V, 2 * V + 0.01]}>
            <boxGeometry args={[0.7 * V, 1.3 * V, 0.05]} />
            {eyeMat}
          </mesh>
        ))}
        {/* arms with claws */}
        {[
          [-1, armL],
          [1, armR],
        ].map(([side, a]) => (
          <group key={side} position={[side * 3 * V, 2.4 * V, 0]} rotation={[-armFwd, 0, side * a]}>
            <mesh position={[side * 0.7 * V, 0, 0]}>
              <boxGeometry args={[1.4 * V, 1 * V, 1.2 * V]} />
              {mat}
            </mesh>
            <mesh position={[side * 1.6 * V, 0.35 * V, 0]}>
              <boxGeometry args={[0.7 * V, 0.6 * V, 1.2 * V]} />
              {mat}
            </mesh>
            <mesh position={[side * 1.6 * V, -0.4 * V, 0]}>
              <boxGeometry args={[0.7 * V, 0.4 * V, 1.2 * V]} />
              {mat}
            </mesh>
          </group>
        ))}
        {/* legs */}
        {[-2, -0.7, 0.7, 2].map((x, i) => (
          <group key={x} position={[x * V, 1 * V, 0]} rotation={[(i % 2 ? 1 : -1) * legSwing, 0, 0]}>
            <mesh position={[0, -0.5 * V, 0]}>
              <boxGeometry args={[0.6 * V, 1.1 * V, 0.8 * V]} />
              {mat}
            </mesh>
          </group>
        ))}
      </group>
      {hologram ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 32]} />
          <meshBasicMaterial color={PALETTE.holo} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
