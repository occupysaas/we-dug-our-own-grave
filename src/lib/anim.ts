export type Ease = (x: number) => number;
export const linear: Ease = (x) => x;
export const easeInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut: Ease = (x) => 1 - Math.pow(1 - x, 3);
export const easeIn: Ease = (x) => x * x * x;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Piecewise interpolation over [t, value] keys (t in any unit), clamped at ends. */
export function interp(t: number, keys: [number, number][], ease: Ease = linear): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

/** Interpolate vectors. */
export function interpV(t: number, keys: [number, number[]][], ease: Ease = easeInOut): number[] {
  const n = keys[0][1].length;
  return Array.from({length: n}, (_, i) => interp(t, keys.map(([k, v]) => [k, v[i]] as [number, number]), ease));
}

/** 0→1 progress of t across [a,b]. */
export const prog = (t: number, a: number, b: number, ease: Ease = linear) => ease(clamp01((t - a) / (b - a)));
