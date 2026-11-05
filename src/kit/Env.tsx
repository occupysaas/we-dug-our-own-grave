import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CanvasPlane} from './Planes';
import {rng} from '../lib/rng';
import {PALETTE} from '../lib/palette';

type V3 = [number, number, number];

export const Floor: React.FC<{color?: string; size?: number; y?: number}> = ({color = PALETTE.grey1, size = 200, y = 0}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
    <planeGeometry args={[size, size]} />
    <meshToonMaterial color={color} />
  </mesh>
);

export const Box: React.FC<{size: V3; position?: V3; rotation?: V3; color: string; basic?: boolean; opacity?: number}> = ({size, position, rotation, color, basic, opacity}) => (
  <mesh position={position} rotation={rotation}>
    <boxGeometry args={size} />
    {basic ? <meshBasicMaterial color={color} transparent={opacity !== undefined} opacity={opacity ?? 1} /> : <meshToonMaterial color={color} transparent={opacity !== undefined} opacity={opacity ?? 1} />}
  </mesh>
);

/** Glass skyscraper with a window-grid texture. */
export const Tower: React.FC<{w: number; h: number; d?: number; position?: V3; color?: string; lit?: number; seed?: number; logo?: React.ReactNode}> = ({w, h, d = w, position, color = '#6f8296', lit = 0.25, seed = 1, logo}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 1024;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 1024);
    const r = rng(seed);
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = r() < lit ? '#ffe7a8' : 'rgba(20,30,45,0.55)';
        ctx.fillRect(x * 32 + 5, y * 16 + 3, 22, 10);
      }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(Math.max(1, w / 3), Math.max(1, h / 30));
    return t;
  }, [w, h, color, lit, seed]);
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshToonMaterial map={tex} />
      </mesh>
      {logo ? <group position={[0, h * 0.9, d / 2 + 0.05]}>{logo}</group> : null}
    </group>
  );
};

/** Simple city of towers scattered in a ring/area. */
export const City: React.FC<{count?: number; seed?: number; area?: [number, number]; position?: V3; maxH?: number; color?: string}> = ({count = 40, seed = 9, area = [200, 120], position, maxH = 60, color}) => {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, () => ({x: (r() - 0.5) * area[0], z: (r() - 0.5) * area[1], w: 4 + r() * 8, h: 10 + r() * maxH, s: Math.floor(r() * 1000)}));
  }, [count, seed, area, maxH]);
  return (
    <group position={position}>
      {items.map((b, i) => (
        <Tower key={i} w={b.w} h={b.h} position={[b.x, 0, b.z]} seed={b.s} color={color} />
      ))}
    </group>
  );
};

/** Sky gradient as a big backdrop sphere. */
export const Sky: React.FC<{top: string; bottom: string; radius?: number}> = ({top, bottom, radius = 900}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    g.addColorStop(0.55, bottom);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [top, bottom]);
  return (
    <mesh>
      <sphereGeometry args={[radius, 24, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

/** Flapping cartoon bird (two triangle wings). */
export const Bird: React.FC<{t: number; position?: V3; rotation?: V3; scale?: number; color?: string}> = ({t, position, rotation, scale = 1, color = '#222'}) => {
  const flap = Math.sin(t * 0.9) * 0.8;
  const wing = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.5, 0.08);
    s.lineTo(0.15, -0.12);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshToonMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.02, 0]}>
        <coneGeometry args={[0.03, 0.1, 4]} />
        <meshToonMaterial color="#f0a020" />
      </mesh>
      <mesh geometry={wing} rotation={[Math.PI / 2 + flap, 0, Math.PI / 2]} position={[0, 0.03, 0.05]}>
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={wing} rotation={[-Math.PI / 2 - flap, 0, Math.PI / 2]} position={[0, 0.03, -0.05]}>
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Blocky Minecraft-style minecart (open box on wheels). */
export const Minecart: React.FC<{position?: V3; rotation?: V3; scale?: number}> = ({position, rotation, scale = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <Box size={[1.4, 0.12, 1.0]} position={[0, 0.3, 0]} color="#6b6b6b" />
    <Box size={[1.4, 0.6, 0.1]} position={[0, 0.6, 0.45]} color="#7a7a7a" />
    <Box size={[1.4, 0.6, 0.1]} position={[0, 0.6, -0.45]} color="#7a7a7a" />
    <Box size={[0.1, 0.6, 1.0]} position={[0.65, 0.6, 0]} color="#5e5e5e" />
    <Box size={[0.1, 0.6, 1.0]} position={[-0.65, 0.6, 0]} color="#5e5e5e" />
    {[-0.45, 0.45].flatMap((x) => [-0.5, 0.5].map((z) => <Box key={`${x}${z}`} size={[0.3, 0.3, 0.08]} position={[x, 0.18, z]} color="#2a2a2a" />))}
  </group>
);

/** Straight rail segment (two rails + ties) along +x, length L. */
export const Rail: React.FC<{length: number; position?: V3; rotation?: V3; color?: string}> = ({length, position, rotation, color = '#555'}) => (
  <group position={position} rotation={rotation}>
    <Box size={[length, 0.08, 0.08]} position={[length / 2, 0.1, 0.4]} color={color} />
    <Box size={[length, 0.08, 0.08]} position={[length / 2, 0.1, -0.4]} color={color} />
    {Array.from({length: Math.floor(length / 0.6)}, (_, i) => (
      <Box key={i} size={[0.18, 0.06, 1.1]} position={[i * 0.6 + 0.3, 0.04, 0]} color="#6b4a2f" />
    ))}
  </group>
);

/** Cartoon explosion: expanding layered spheres. p = 0..1 progress. */
export const Explosion: React.FC<{p: number; position?: V3; scale?: number}> = ({p, position, scale = 1}) => {
  if (p <= 0 || p >= 1) return null;
  const grow = 1 - Math.pow(1 - p, 3);
  const fade = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
  const parts = [
    {c: '#fff3b0', r: 0.6, d: [0, 0, 0]},
    {c: '#ffb020', r: 0.9, d: [0.6, 0.3, 0.2]},
    {c: PALETTE.red, r: 0.8, d: [-0.7, 0.2, -0.1]},
    {c: '#ff6a00', r: 0.7, d: [0.1, 0.8, 0.3]},
    {c: '#333', r: 0.6, d: [0.2, 1.3, -0.3]},
    {c: '#444', r: 0.5, d: [-0.6, 1.1, 0.2]},
  ];
  return (
    <group position={position} scale={scale * (0.3 + grow * 2.2)}>
      {parts.map((q, i) => (
        <mesh key={i} position={q.d.map((v) => v * (0.4 + grow)) as V3}>
          <icosahedronGeometry args={[q.r, 1]} />
          <meshBasicMaterial color={q.c} transparent opacity={fade} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Smoke puff. */
export const Puff: React.FC<{p: number; position?: V3; scale?: number; color?: string}> = ({p, position, scale = 1, color = '#e6e1d6'}) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <group position={position} scale={scale * (0.4 + p * 1.6)}>
      {[[0, 0, 0], [0.5, 0.2, 0], [-0.4, 0.3, 0.2], [0.1, 0.6, -0.2]].map((d, i) => (
        <mesh key={i} position={d as V3}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshToonMaterial color={color} transparent opacity={1 - p} />
        </mesh>
      ))}
    </group>
  );
};

export {CanvasPlane};
