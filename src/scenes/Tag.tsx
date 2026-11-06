import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {useSongTime} from '../kit/song';
import {drawFawkes} from '../kit/draw';
import {MARKER} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {prog, easeInOut} from '../lib/anim';

/** Silent tag: Guy Fawkes mask fades in, "Remember, remember…", fades out (360–368). */
export const TagScene: React.FC = () => {
  const {T} = useSongTime('tag');
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    drawFawkes(ctx, c.width, c.height);
  }, []);
  const fadeIn = prog(T, 360.6, 362.6, easeInOut);
  const textIn = prog(T, 362.4, 363.6, easeInOut);
  const fadeOut = 1 - prog(T, 366.4, 367.9, easeInOut);
  const scale = 1 + (T - 360) * 0.01;
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <canvas ref={ref} width={760} height={1000} style={{height: 1060, opacity: fadeIn * fadeOut, transform: `scale(${scale})`}} />
      <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily: MARKER, fontSize: 84, color: PALETTE.paper, opacity: textIn * fadeOut, textShadow: '0 0 30px #000, 0 0 12px #000'}}>
        Remember, remember, the 5th of November.
      </div>
    </AbsoluteFill>
  );
};
