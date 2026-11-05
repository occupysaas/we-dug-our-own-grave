import {WORDS} from '../timing/cues';

/** Mouth openness 0..1 at song time T: open on vocal words, flapping within a word. */
export function mouthOpen(T: number): number {
  for (const w of WORDS) {
    if (T >= w.s && T < w.e) return 0.4 + 0.6 * Math.abs(Math.sin((T - w.s) * 18));
    if (w.s > T) break;
  }
  return 0;
}
