import React, {useMemo} from 'react';
import * as THREE from 'three';
import {crowdLayout} from './pose';
import {Placard} from './Planes';
import {PALETTE} from '../lib/palette';
import {drawFawkes} from './draw';

let maskTex: THREE.CanvasTexture | null = null;
function fawkesTexture() {
  if (maskTex) return maskTex;
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 200;
  drawFawkes(c.getContext('2d')!, 160, 200);
  maskTex = new THREE.CanvasTexture(c);
  maskTex.colorSpace = THREE.SRGBColorSpace;
  return maskTex;
}

/** Silhouette shape: head + shoulders + body, like the OccupySaaS logo crowd. */
function silhouetteShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0);
  s.lineTo(-0.3, 1.0);
  s.quadraticCurveTo(-0.28, 1.25, -0.12, 1.3);
  s.lineTo(-0.08, 1.36);
  s.absarc(0, 1.52, 0.17, -Math.PI * 0.35, Math.PI * 1.35, false);
  s.lineTo(0.12, 1.3);
  s.quadraticCurveTo(0.28, 1.25, 0.3, 1.0);
  s.lineTo(0.32, 0);
  s.closePath();
  return s;
}

const PLACARDS = ['OCCUPY EVERYTHING', 'NO MORE SEATS', 'FORK IT', 'OWN EVERYTHING', 'SELF-HOST IT', 'git push --force', 'PER-SEAT = TAX', 'WE ARE THE 99%'];

/**
 * Black silhouette protest crowd. Members bob; `cheer` (0..1) adds jumping. Some hold placards / laptops.
 */
export const Crowd: React.FC<{count: number; seed: number; area: [number, number]; t: number; cheer?: number; placards?: string[]; placardEvery?: number; position?: [number, number, number]; rotation?: [number, number, number]; color?: string; facing?: number; masks?: boolean}> = ({
  count, seed, area, t, cheer = 0, placards = PLACARDS, placardEvery = 5, position, rotation, color = PALETTE.ink, facing = 0, masks = true,
}) => {
  const layout = useMemo(() => crowdLayout(count, seed, area), [count, seed, area]);
  const geo = useMemo(() => new THREE.ExtrudeGeometry(silhouetteShape(), {depth: 0.12, bevelEnabled: false}), []);
  const mask = useMemo(() => fawkesTexture(), []);
  return (
    <group position={position} rotation={rotation}>
      {layout.map((m, i) => {
        const jump = cheer * Math.max(0, Math.sin(t * 0.35 + m.phase)) * 0.35;
        const sway = Math.sin(t * 0.1 + m.phase) * 0.05;
        const y = jump + 0.02 * Math.sin(t * 0.2 + m.phase);
        const hasPlacard = placardEvery > 0 && i % placardEvery === 0;
        const hasLaptop = !hasPlacard && m.variant === 0;
        return (
          <group key={i} position={[m.x, y, m.z]} rotation={[0, facing + sway, sway]} scale={m.s}>
            <mesh geometry={geo}>
              <meshBasicMaterial color={color} />
            </mesh>
            {masks ? (
              <mesh position={[0, 1.5, 0.135]}>
                <planeGeometry args={[0.3, 0.38]} />
                <meshBasicMaterial map={mask} transparent />
              </mesh>
            ) : null}
            {hasPlacard ? (
              <Placard text={placards[(i / placardEvery) % placards.length | 0]} red={m.variant === 1} position={[0.15, 2.3 + Math.sin(t * 0.3 + m.phase) * 0.08 * (1 + cheer), 0.15]} rotation={[0, 0, Math.sin(t * 0.2 + m.phase) * 0.1]} scale={0.9} />
            ) : null}
            {hasLaptop ? (
              <group position={[0.1, 2.05 + jump * 0.5, 0.14]} rotation={[0, 0, 0.2 * Math.sin(t * 0.25 + m.phase)]}>
                <mesh>
                  <boxGeometry args={[0.6, 0.42, 0.04]} />
                  <meshBasicMaterial color={color} />
                </mesh>
                <mesh position={[0, 0, 0.025]}>
                  <planeGeometry args={[0.5, 0.32]} />
                  <meshBasicMaterial color={PALETTE.paper} />
                </mesh>
                <mesh position={[0, -0.6, 0]}>
                  <boxGeometry args={[0.12, 0.8, 0.12]} />
                  <meshBasicMaterial color={color} />
                </mesh>
              </group>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};
