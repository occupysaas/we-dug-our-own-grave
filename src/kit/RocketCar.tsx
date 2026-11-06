import React from 'react';
import {LogoBadge, CanvasPlane} from './Planes';
import {Box} from './Env';
import {drawCenteredText} from './draw';
import {MARKER, DISPLAY} from '../lib/fonts';
import {PALETTE} from '../lib/palette';

type V3 = [number, number, number];
/** Seat positions (car-local) for riders. */
export const SEATS: Record<'linus' | 'reaper' | 'mickey' | 'clippy', V3> = {
  linus: [0.9, 0.55, -0.45],
  reaper: [-0.5, 0.55, -0.45],
  mickey: [0.9, 0.55, 0.45],
  clippy: [-0.5, 0.55, 0.45],
};

/**
 * Open-source rocket car in OccupySaaS colors. Faces +x. Riders are passed as children (car-local coords).
 */
export const RocketCar: React.FC<{position?: V3; rotation?: V3; scale?: number; flame?: number; children?: React.ReactNode}> = ({position, rotation, scale = 1, flame = 0, children}) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* chassis */}
    <Box size={[4.2, 0.5, 1.6]} position={[0, 0.35, 0]} color={PALETTE.red} />
    <Box size={[4.25, 0.12, 1.65]} position={[0, 0.62, 0]} color={PALETTE.ink} />
    {/* nose */}
    <mesh position={[2.55, 0.4, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.55, 1.0, 4]} />
      <meshToonMaterial color={PALETTE.ink} />
    </mesh>
    {/* side paper stripes */}
    {[-0.81, 0.81].map((z) => (
      <Box key={z} size={[4.0, 0.14, 0.02]} position={[0, 0.3, z]} color={PALETTE.paper} />
    ))}
    {/* boosters */}
    {[-0.55, 0.55].map((z) => (
      <group key={z} position={[-2.2, 0.45, z]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.38, 1.2, 16]} />
          <meshToonMaterial color="#2a2a2a" />
        </mesh>
        {flame > 0 ? (
          <mesh position={[-0.6 - flame * 0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, flame, 1]}>
            <coneGeometry args={[0.3, 1.8, 16]} />
            <meshBasicMaterial color="#ffb020" transparent opacity={0.9} toneMapped={false} />
          </mesh>
        ) : null}
      </group>
    ))}
    {/* seats */}
    {Object.values(SEATS).map((p, i) => (
      <Box key={i} size={[0.55, 0.5, 0.55]} position={[p[0] - 0.25, p[1] + 0.1, p[2]]} color={PALETTE.ink} />
    ))}
    {/* wheels (fold up in flight) + neon underglow */}
    {[-1.4, 1.4].flatMap((x) =>
      [-0.85, 0.85].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.22, 16]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      )),
    )}
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.2, 1.9]} />
      <meshBasicMaterial color="#00e5ff" transparent opacity={0.55} toneMapped={false} />
    </mesh>
    {[-0.82, 0.82].map((z) => (
      <mesh key={'g' + z} position={[0, 0.12, z]}>
        <boxGeometry args={[4.1, 0.05, 0.03]} />
        <meshBasicMaterial color="#ff2bd6" toneMapped={false} />
      </mesh>
    ))}
    {/* logos + signature on both sides */}
    {[1, -1].map((side) => (
      <group key={side} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
        {['linux', 'brave', 'ubuntu', 'mint', 'occupysaas'].map((n, i) => (
          <LogoBadge key={n} name={n} size={0.42} position={[-1.6 + i * 0.62, 0.33, 0.83]} />
        ))}
        <CanvasPlane w={1.6} h={0.36} px={260} position={[1.4, 0.84, 0.83]} doubleSide={false} animate={false} draw={(ctx, w, h) => drawCenteredText(ctx, 'Linus Torvalds', w, h, MARKER, h * 0.62, PALETTE.paper, w, '400')} />
        <CanvasPlane w={2.2} h={0.22} px={260} position={[-0.7, 0.84, 0.83]} doubleSide={false} animate={false} draw={(ctx, w, h) => drawCenteredText(ctx, 'OPEN SOURCE EXPRESS', w, h, DISPLAY, h * 0.7, PALETTE.paper)} />
      </group>
    ))}
    {children}
  </group>
);
