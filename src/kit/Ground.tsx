import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rng} from '../lib/rng';

export type GroundKind = 'tile' | 'gold' | 'asphalt' | 'street' | 'concrete' | 'carpet' | 'wood' | 'moonrock' | 'grid';

const cache = new Map<string, THREE.CanvasTexture>();

/** Procedural repeating ground texture (cached per kind). */
export function groundTexture(kind: GroundKind): THREE.CanvasTexture {
  const hit = cache.get(kind);
  if (hit) return hit;
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  const r = rng(kind.length * 97 + 3);
  const noise = (alpha: number, col = '0,0,0') => {
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(${col},${r() * alpha})`;
      ctx.fillRect(r() * S, r() * S, 2, 2);
    }
  };
  switch (kind) {
    case 'tile': {
      // dark polished marble tiles with light grout + veins
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          const v = 40 + r() * 18;
          ctx.fillStyle = `rgb(${v},${v + 2},${v + 8})`;
          ctx.fillRect(x * 128, y * 128, 128, 128);
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x * 128 + r() * 128, y * 128);
          ctx.bezierCurveTo(x * 128 + r() * 128, y * 128 + 40, x * 128 + r() * 128, y * 128 + 90, x * 128 + r() * 128, y * 128 + 128);
          ctx.stroke();
        }
      ctx.strokeStyle = '#9aa0aa';
      ctx.lineWidth = 3;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(i * 128, 0); ctx.lineTo(i * 128, S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(S, i * 128); ctx.stroke();
      }
      break;
    }
    case 'gold': {
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          const g = ctx.createLinearGradient(x * 128, y * 128, x * 128 + 128, y * 128 + 128);
          g.addColorStop(0, '#f7d774');
          g.addColorStop(0.5, '#c99a2e');
          g.addColorStop(1, '#e8c25a');
          ctx.fillStyle = g;
          ctx.fillRect(x * 128, y * 128, 128, 128);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(x * 128 + 10, y * 128 + 10, 50, 6);
        }
      ctx.strokeStyle = '#6b4e12';
      ctx.lineWidth = 4;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(i * 128, 0); ctx.lineTo(i * 128, S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(S, i * 128); ctx.stroke();
      }
      break;
    }
    case 'asphalt': {
      ctx.fillStyle = '#26262c';
      ctx.fillRect(0, 0, S, S);
      noise(0.35, '255,255,255');
      noise(0.5);
      // dashed center line (texture runs along x)
      ctx.fillStyle = '#ffd400';
      for (let x = 0; x < S; x += 128) ctx.fillRect(x + 20, S / 2 - 6, 70, 12);
      // neon edge lines
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(0, 18, S, 8);
      ctx.fillRect(0, S - 26, S, 8);
      break;
    }
    case 'street': {
      // cyberpunk city ground from above: dark blocks, glowing street grid
      ctx.fillStyle = '#0d0b14';
      ctx.fillRect(0, 0, S, S);
      noise(0.3, '120,100,160');
      ctx.fillStyle = '#ff2bd6';
      ctx.fillRect(0, 0, S, 6);
      ctx.fillRect(0, 0, 6, S);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(0, S / 2, S, 4);
      ctx.fillRect(S / 2, 0, 4, S);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = ['#ffd400', '#ff2bd6', '#00e5ff', '#ff6a00'][i % 4];
        ctx.fillRect(r() * S, r() * S, 3, 3);
      }
      break;
    }
    case 'concrete': {
      ctx.fillStyle = '#8f8a80';
      ctx.fillRect(0, 0, S, S);
      noise(0.25, '255,255,255');
      noise(0.35);
      ctx.strokeStyle = 'rgba(30,30,30,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        let x = r() * S, y = r() * S;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 80; y += (r() - 0.5) * 80; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, S, S);
      break;
    }
    case 'carpet': {
      ctx.fillStyle = '#3a1d2a';
      ctx.fillRect(0, 0, S, S);
      noise(0.25, '255,180,200');
      ctx.strokeStyle = 'rgba(212,160,23,0.35)';
      ctx.lineWidth = 3;
      for (let i = 0; i < S; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 32, 32); ctx.lineTo(i + 64, 0); ctx.stroke();
      }
      break;
    }
    case 'wood': {
      for (let y = 0; y < 8; y++) {
        const v = 90 + r() * 30;
        ctx.fillStyle = `rgb(${v},${v * 0.62},${v * 0.38})`;
        ctx.fillRect(0, y * 64, S, 64);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.strokeRect(r() * 200, y * 64, 300, 64);
        for (let k = 0; k < 5; k++) {
          ctx.strokeStyle = 'rgba(40,20,10,0.18)';
          ctx.beginPath(); ctx.moveTo(0, y * 64 + r() * 64); ctx.lineTo(S, y * 64 + r() * 64); ctx.stroke();
        }
      }
      break;
    }
    case 'moonrock': {
      ctx.fillStyle = '#b9b6ad';
      ctx.fillRect(0, 0, S, S);
      noise(0.3);
      break;
    }
    case 'grid': {
      ctx.fillStyle = '#0a0612';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = '#ff2bd6';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, S, S);
      ctx.strokeStyle = 'rgba(0,229,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(S / 2, 0); ctx.lineTo(S / 2, S); ctx.moveTo(0, S / 2); ctx.lineTo(S, S / 2); ctx.stroke();
      break;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  cache.set(kind, t);
  return t;
}

/** Textured ground plane. `tile` = world units per texture repeat. */
export const Ground: React.FC<{kind: GroundKind; size?: number | [number, number]; tile?: number; y?: number; position?: [number, number, number]; rotation?: [number, number, number]; basic?: boolean}> = ({kind, size = 200, tile = 4, y = 0, position, rotation, basic}) => {
  const [w, d] = typeof size === 'number' ? [size, size] : size;
  const tex = useMemo(() => {
    const t = groundTexture(kind).clone();
    t.needsUpdate = true;
    t.repeat.set(w / tile, d / tile);
    return t;
  }, [kind, w, d, tile]);
  return (
    <mesh rotation={rotation ?? [-Math.PI / 2, 0, 0]} position={position ?? [0, y, 0]}>
      <planeGeometry args={[w, d]} />
      {basic ? <meshBasicMaterial map={tex} /> : <meshToonMaterial map={tex} />}
    </mesh>
  );
};
