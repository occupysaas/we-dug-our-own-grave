import React from 'react';
import {SCENE_TIMES, SceneId} from './timeline-times';
import {makePlaceholder} from './scenes/Placeholder';
import {TowerScene} from './scenes/Tower';
import {BoardroomScene, SosScene} from './scenes/Boardroom';

const COMPONENTS: Partial<Record<SceneId, React.FC>> = {
  tower: TowerScene,
  boardroom: BoardroomScene,
  sos: SosScene,
};

export const SCENES = SCENE_TIMES.map((s) => ({
  ...s,
  Component: COMPONENTS[s.id] ?? makePlaceholder(s.id, s.from),
}));
