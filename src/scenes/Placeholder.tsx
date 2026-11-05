import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PALETTE} from '../lib/palette';
import {DISPLAY, MONO} from '../lib/fonts';
import {FPS, lyricAt} from '../timing/cues';

export const makePlaceholder = (id: string, fromSec: number): React.FC => () => {
  const f = useCurrentFrame();
  const t = fromSec + f / FPS;
  return (
    <AbsoluteFill style={{background: PALETTE.grey2, color: PALETTE.paper, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120}}>{id}</div>
      <div style={{fontFamily: MONO, fontSize: 40}}>{t.toFixed(2)}s</div>
      <div style={{fontFamily: DISPLAY, fontSize: 48, marginTop: 40, maxWidth: 1600, textAlign: 'center'}}>{lyricAt(t)}</div>
    </AbsoluteFill>
  );
};
