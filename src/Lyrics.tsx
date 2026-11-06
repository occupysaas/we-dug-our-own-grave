import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from './timing/cues';
import {lineAt, placementAt, isHit, LyricLine, LYRICS} from './timing/lyrics';
import {DISPLAY, MONO, MARKER} from './lib/fonts';
import {PALETTE} from './lib/palette';
import {prog, easeOut} from './lib/anim';

type Style = 'sung' | 'ai' | 'cold' | 'no' | 'anthem' | 'hit';

function styleOf(l: LyricLine): Style {
  const i = LYRICS.indexOf(l);
  if (isHit(l)) return 'hit';
  if (i <= 5) return 'ai';
  if (l.text === 'You will own nothing...' || l.text === 'And be happy.') return 'cold';
  if (l.text === 'No.') return 'no';
  if (l.text === l.text.toUpperCase() && /EVERYTHING|HAPPY/.test(l.text)) return 'anthem';
  return 'sung';
}

const OUTLINE = '#0b0712';

/** Sing-along lyric overlay with per-word highlight. */
export const Lyrics: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const line = lineAt(t);
  if (!line) return null;
  const st = styleOf(line);
  const appear = prog(t, line.start - 0.25, line.start - 0.05, easeOut);
  const place = placementAt(t);

  if (st === 'hit' || st === 'no') {
    const p = prog(t, line.start, line.start + 0.18, easeOut);
    const scale = 1.35 - 0.35 * p;
    return (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: st === 'hit' ? 150 : 220, letterSpacing: 2, color: st === 'hit' ? '#ff2a3a' : PALETTE.paper, WebkitTextStroke: `14px ${OUTLINE}`, paintOrder: 'stroke fill', transform: `scale(${scale}) rotate(${st === 'hit' ? -3 : 0}deg)`, opacity: p, textShadow: st === 'hit' ? '0 0 60px rgba(255,40,60,0.8)' : '0 0 50px rgba(255,240,200,0.7)', whiteSpace: 'nowrap'}}>
          {line.text}
        </div>
      </AbsoluteFill>
    );
  }

  const mono = st === 'ai' || st === 'cold';
  const anthem = st === 'anthem';
  const size = anthem ? 96 : mono ? 46 : 60;
  const family = anthem ? MARKER : mono ? MONO : DISPLAY;
  const weight = anthem ? 400 : mono ? 700 : 900;
  // machine voices recolor the text; humans get a red marker swipe behind each sung word
  const machine = st === 'cold' ? '#ff5a5a' : '#7ff6ff';
  const swipe = anthem ? PALETTE.red : PALETTE.red;
  const band = place === 'bottom' ? 'linear-gradient(to top, rgba(10,6,20,0.7), rgba(10,6,20,0))' : 'linear-gradient(to bottom, rgba(10,6,20,0.7), rgba(10,6,20,0))';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, [place]: 0, height: 280, background: band, opacity: appear}} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          maxWidth: anthem ? 1500 : 1280,
          [place]: 70,
          textAlign: 'left',
          fontFamily: family,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.2,
          opacity: appear,
        }}
      >
        {line.words.map((w, i) => {
          const p = prog(t, w.s, Math.max(w.s + 0.12, Math.min(w.e, w.s + 0.45)));
          const sung = t >= w.s;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                padding: '0 0.12em',
                marginRight: '0.12em',
                color: mono ? (sung ? machine : 'rgba(200,240,255,0.55)') : sung ? PALETTE.paper : 'rgba(245,242,235,0.62)',
                WebkitTextStroke: `${mono ? 6 : 7}px #0a0610`,
                paintOrder: 'stroke fill',
                backgroundImage: mono ? 'none' : `linear-gradient(${swipe}, ${swipe})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 92%',
                backgroundSize: `${(p * 100).toFixed(1)}% 22%`,
                transform: anthem ? `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)` : undefined,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
