import React, {useMemo} from 'react';
import {rng} from '../lib/rng';
import {PALETTE} from '../lib/palette';

/** Falling confetti squares in a box volume; deterministic from t (frames). */
export const Confetti: React.FC<{t: number; count?: number; area?: [number, number, number]; position?: [number, number, number]; colors?: string[]}> = ({t, count = 160, area = [20, 12, 10], position, colors = [PALETTE.red, PALETTE.paper, '#ffd400', PALETTE.crab, '#7dff9a']}) => {
  const items = useMemo(() => {
    const r = rng(1234);
    return Array.from({length: count}, () => ({x: (r() - 0.5) * area[0], y0: r() * area[1], z: (r() - 0.5) * area[2], sp: 0.02 + r() * 0.03, rot: r() * 6, c: colors[Math.floor(r() * colors.length)]}));
  }, [count, area, colors]);
  return (
    <group position={position}>
      {items.map((p, i) => {
        const y = area[1] - ((p.y0 + t * p.sp) % area[1]);
        return (
          <mesh key={i} position={[p.x + Math.sin(t * 0.05 + p.rot) * 0.3, y, p.z]} rotation={[t * 0.1 + p.rot, t * 0.07, p.rot]}>
            <planeGeometry args={[0.15, 0.1]} />
            <meshBasicMaterial color={p.c} side={2} />
          </mesh>
        );
      })}
    </group>
  );
};
