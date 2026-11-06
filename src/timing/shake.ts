import beats from './beats.json';

/** [time_sec, strength 0..1] from scripts/beats.py (librosa beat tracking). */
export const BEATS = beats as [number, number][];

/** Sections where the kick is bigger (choruses / big moments) → multiplier. */
const BOOST: [number, number, number][] = [
  [65.8, 118, 1.6], // SOS + chorus 1
  [151.6, 188, 1.6], // SOS 2 + chorus 2
  [287.8, 337.4, 1.8], // final pre-chorus + chorus + post
  [221.4, 246, 0.4], // whispered bridge: barely
  [337.4, 360, 0.5], // outro
];

/** Screen offset in px (at 1080p) and roll in degrees for song time t. */
export function shakeAt(t: number): {x: number; y: number; rot: number} {
  if (t >= 359.5) return {x: 0, y: 0, rot: 0};
  // binary search last beat <= t
  let lo = 0, hi = BEATS.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (BEATS[mid][0] <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1;
  }
  if (idx < 0) return {x: 0, y: 0, rot: 0};
  const [bt, s] = BEATS[idx];
  const dt = t - bt;
  const boost = BOOST.find(([a, b]) => t >= a && t < b)?.[2] ?? 1;
  const amp = 7 * s * boost * Math.exp(-dt * 11);
  // alternate direction per beat; deterministic wobble
  const dir = idx % 2 ? 1 : -1;
  return {
    x: amp * dir * Math.cos(dt * 40) * 0.6,
    y: amp * Math.cos(dt * 34),
    rot: amp * 0.04 * dir,
  };
}
