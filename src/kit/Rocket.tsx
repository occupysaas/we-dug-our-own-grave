import React from 'react';
import * as THREE from 'three';
import {LogoBadge, CanvasPlane} from './Planes';
import {drawCenteredText} from './draw';
import {DISPLAY} from '../lib/fonts';
import {PALETTE} from '../lib/palette';

/** Corporate rocket, axis along +y, with an open cutaway facing +z. Children render inside (the boardroom box). */
export const CorpRocket: React.FC<{position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; flame?: number; children?: React.ReactNode}> = ({position, rotation, scale = 1, flame = 1, children}) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* body with front cutaway */}
    <mesh position={[0, 6, 0]}>
      <cylinderGeometry args={[3, 3, 12, 48, 1, true, Math.PI * 0.18, Math.PI * 1.64]} />
      <meshToonMaterial color="#c9ced6" side={THREE.DoubleSide} />
    </mesh>
    {/* red bands */}
    {[1.2, 10.8].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[3.02, 3.02, 0.5, 48, 1, true, Math.PI * 0.18, Math.PI * 1.64]} />
        <meshToonMaterial color={PALETTE.red} side={THREE.DoubleSide} />
      </mesh>
    ))}
    {/* floor + ceiling discs of the cutaway */}
    <mesh position={[0, 3.6, 0]}>
      <cylinderGeometry args={[2.98, 2.98, 0.1, 48]} />
      <meshToonMaterial color="#b9bec6" />
    </mesh>
    <mesh position={[0, 8.6, 0]}>
      <cylinderGeometry args={[2.98, 2.98, 0.1, 48]} />
      <meshToonMaterial color="#b9bec6" />
    </mesh>
    {/* neon trim around the cutaway */}
    {[3.62, 8.62].map((y) => (
      <mesh key={'n' + y} position={[0, y, 0]}>
        <torusGeometry args={[3.0, 0.05, 6, 48]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
    ))}
    {/* nose */}
    <mesh position={[0, 14.5, 0]}>
      <coneGeometry args={[3, 5, 48]} />
      <meshToonMaterial color={PALETTE.red} />
    </mesh>
    {/* fins */}
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 3.3, 1, Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 3.3]} rotation={[0, -(i * Math.PI) / 2 - Math.PI / 4, 0]}>
        <boxGeometry args={[1.4, 3, 0.15]} />
        <meshToonMaterial color="#2b2e36" />
      </mesh>
    ))}
    {/* logos on the side */}
    {['salesforce', 'aws', 'azure', 'adobecc', 'docusign'].map((n, i) => (
      <group key={n} rotation={[0, -0.9 - i * 0.35, 0]}>
        <LogoBadge name={n} size={1.1} position={[0, 2.4 + (i % 2) * 7.4, 3.03]} />
      </group>
    ))}
    <group rotation={[0, Math.PI, 0]}>
      <CanvasPlane w={3.4} h={1.0} px={200} position={[0, 6, 3.05]} animate={false} draw={(ctx, w, h) => drawCenteredText(ctx, 'SAAS INC. TO MARS', w, h, DISPLAY, h * 0.5, PALETTE.ink)} />
    </group>
    {/* exhaust */}
    {flame > 0 ? (
      <mesh position={[0, -1.5 * flame, 0]} rotation={[Math.PI, 0, 0]} scale={[1, flame, 1]}>
        <coneGeometry args={[2, 5, 24]} />
        <meshBasicMaterial color="#ffb020" transparent opacity={0.85} toneMapped={false} />
      </mesh>
    ) : null}
    <group position={[0, 3.65, 0]}>{children}</group>
  </group>
);

export const GoldenParachute: React.FC<{open: number}> = ({open}) => (
  <group position={[0, 2.0, 0]} scale={Math.max(0.01, open)}>
    <mesh>
      <sphereGeometry args={[1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshToonMaterial color={PALETTE.gold} side={THREE.DoubleSide} />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.57) * 0.5, -0.5, Math.sin(i * 1.57) * 0.5]} rotation={[Math.sin(i * 1.57) * 0.45, 0, -Math.cos(i * 1.57) * 0.45]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 4]} />
        <meshBasicMaterial color="#555" />
      </mesh>
    ))}
  </group>
);
