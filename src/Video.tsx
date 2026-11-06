import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENES} from './timeline';
import {PALETTE} from './lib/palette';
import {sec} from './timing/cues';
import {FontGate} from './FontGate';

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: PALETTE.ink}}>
    <Audio src={staticFile('song.wav')} />
    <FontGate>
      {SCENES.map((s) => (
        <Sequence key={s.id} name={s.id} from={sec(s.from)} durationInFrames={sec(s.to) - sec(s.from)}>
          <s.Component />
        </Sequence>
      ))}
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
