import React from 'react';
import {SCENE_TIMES, SceneId} from './timeline-times';
import {makePlaceholder} from './scenes/Placeholder';

const COMPONENTS: Partial<Record<SceneId, React.FC>> = {};

export const SCENES = SCENE_TIMES.map((s) => ({
  ...s,
  Component: COMPONENTS[s.id] ?? makePlaceholder(s.id, s.from),
}));
