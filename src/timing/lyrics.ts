import data from './lyrics-aligned.json';

export type LyricWord = {w: string; s: number; e: number};
export type LyricLine = {text: string; start: number; end: number; words: LyricWord[]};

/** Official lyrics aligned to the song (scripts/align_lyrics.py). */
export const LYRICS = data as LyricLine[];

const LEAD = 0.25; // show a line slightly before it's sung
const HOLD = 2.2; // keep the last line up this long if nothing follows
export const isHit = (l: LyricLine) => l.text === 'OUR OWN GRAVE!';

/** The lyric line to display at song time t (null in gaps and the silent tag). */
export function lineAt(t: number): LyricLine | null {
  if (t >= 359.5) return null;
  // the big hits stay up for at least 1.1s even if the next line starts
  for (const l of LYRICS) if (isHit(l) && t >= l.start && t < l.start + 1.1) return l;
  let cur: LyricLine | null = null;
  let next: LyricLine | null = null;
  for (let i = 0; i < LYRICS.length; i++) {
    if (LYRICS[i].start - LEAD <= t) {
      cur = LYRICS[i];
      next = LYRICS[i + 1] ?? null;
    } else break;
  }
  if (!cur) return null;
  const until = next ? Math.min(next.start - LEAD, cur.end + HOLD) : cur.end + HOLD;
  return t < Math.max(until, cur.end) ? cur : null;
}

/** Where lyrics sit on screen, avoiding other on-screen text. */
export function placementAt(t: number): 'top' | 'bottom' {
  if (t >= 271.4 && t < 279.6) return 'top'; // secretary bubble is at the bottom
  return 'bottom';
}
