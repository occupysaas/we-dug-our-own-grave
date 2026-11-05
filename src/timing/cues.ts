import timing from '../../docs/lyrics-timing.json';

export const FPS = 30;
export const TOTAL_SECONDS = 368;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const sec = (s: number): number => Math.round(s * FPS);

type Seg = {start: number; end: number; text: string; words: {w: string; s: number; e: number}[]};
export const WORDS: {w: string; s: number; e: number}[] = (timing as Seg[]).flatMap((seg) =>
  seg.words.map((w) => ({w: w.w.trim(), s: w.s, e: w.e})),
);
export const SEGMENTS: Seg[] = timing as Seg[];

/** Manually measured cues (RMS onsets) for things Whisper can't give us. */
export const CUE_OVERRIDES: Record<string, number> = {
  hit1: 101.7, // chorus 1 "OUR OWN GRAVE!" after the silence
  hit2: 187.4, // chorus 2
  hit3: 319.4, // final chorus
  No: 349.74, // the warm "No."
  eye: 345.74, // "You will own nothing"
};

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

export function cue(word: string, occurrence = 1): number {
  if (occurrence === 1 && word in CUE_OVERRIDES) return CUE_OVERRIDES[word];
  const target = norm(word);
  const alt = target === 'sos' ? 'sos' : target;
  let n = 0;
  for (const w of WORDS) {
    if (norm(w.w) === alt) {
      n++;
      if (n === occurrence) return w.s;
    }
  }
  throw new Error(`cue not found: ${word}#${occurrence}`);
}

/** Current lyric segment text at time t (seconds), or ''. */
export function lyricAt(t: number): string {
  for (const s of SEGMENTS) if (t >= s.start && t < s.end) return s.text.trim();
  return '';
}
