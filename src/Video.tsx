import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENES} from './timeline';
import {PALETTE} from './lib/palette';
import {sec} from './timing/cues';

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: PALETTE.ink}}>
    <Audio src={staticFile('song.wav')} />
    {SCENES.map((s) => (
      <Sequence key={s.id} name={s.id} from={sec(s.from)} durationInFrames={sec(s.to) - sec(s.from)}>
        <s.Component />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** Plays one scene with the matching slice of the song (for fast previews). */
export const SceneClip: React.FC<{id: string}> = ({id}) => {
  const s = SCENES.find((x) => x.id === id)!;
  return (
    <AbsoluteFill style={{background: PALETTE.ink}}>
      <Audio src={staticFile('song.wav')} startFrom={sec(s.from)} />
      <s.Component />
    </AbsoluteFill>
  );
};
