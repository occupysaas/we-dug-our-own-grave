import React from 'react';
import {Composition} from 'remotion';
import {SceneClip, Video} from './Video';
import {SCENES} from './timeline';
import {KitPreview} from './scenes/KitPreview';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH, sec} from './timing/cues';

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene-kit" component={KitPreview} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={`Scene-${s.id}`}
        component={SceneClip}
        defaultProps={{id: s.id}}
        durationInFrames={sec(s.to) - sec(s.from)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
  </>
);
