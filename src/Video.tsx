import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {shakeAt} from './timing/shake';
import {FPS} from './timing/cues';
import {SCENES} from './timeline';
import {PALETTE} from './lib/palette';
import {sec} from './timing/cues';
import {FontGate} from './FontGate';
import {Lyrics} from './Lyrics';

/** Whole-frame beat kick (slightly zoomed so edges never show). */
const BeatShake: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const k = shakeAt(f / FPS);
  return <AbsoluteFill style={{transform: `translate(${k.x.toFixed(2)}px, ${k.y.toFixed(2)}px) rotate(${k.rot.toFixed(3)}deg) scale(1.025)`}}>{children}</AbsoluteFill>;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: PALETTE.ink}}>
    <Audio src={staticFile('song.wav')} />
    <BeatShake>
    <FontGate>
      {SCENES.map((s) => (
        <Sequence key={s.id} name={s.id} from={sec(s.from)} durationInFrames={sec(s.to) - sec(s.from)}>
          <s.Component />
        </Sequence>
      ))}
    </FontGate>
    </BeatShake>
    <FontGate>
      <Lyrics />
    </FontGate>
  </AbsoluteFill>
);

/** Plays one scene with the matching slice of the song (for fast previews). */
export const SceneClip: React.FC<{id: string}> = ({id}) => {
  const s = SCENES.find((x) => x.id === id)!;
  return (
    <AbsoluteFill style={{background: PALETTE.ink}}>
      <Audio src={staticFile('song.wav')} startFrom={sec(s.from)} />
      <FontGate>
        <s.Component />
      </FontGate>
    </AbsoluteFill>
  );
};
