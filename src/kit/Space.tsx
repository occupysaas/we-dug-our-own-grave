import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rng} from '../lib/rng';

export const Stars: React.FC<{count?: number; radius?: number; seed?: number}> = ({count = 1500, radius = 700, seed = 3}) => {
  const geo = useMemo(() => {
    const r = rng(seed);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      pos.set([radius * s * Math.cos(th), radius * u, radius * s * Math.sin(th)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius, seed]);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={2.2} sizeAttenuation={false} fog={false} />
    </points>
  );
};

export const Planet: React.FC<{radius: number; color: string; position: [number, number, number]; land?: string; seed?: number}> = ({radius, color, position, land, seed = 1}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 256);
    if (land) {
      const r = rng(seed);
      ctx.fillStyle = land;
      for (let i = 0; i < 26; i++) {
        ctx.beginPath();
        ctx.ellipse(r() * 512, 40 + r() * 176, 20 + r() * 60, 10 + r() * 35, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [color, land, seed]);
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 48, 32]} />
      <meshToonMaterial map={tex} />
    </mesh>
  );
};
