import React from 'react';
import {SCENE_TIMES, SceneId} from './timeline-times';
import {makePlaceholder} from './scenes/Placeholder';
import {TowerScene} from './scenes/Tower';
import {BoardroomScene, SosScene} from './scenes/Boardroom';
import {RocketScene} from './scenes/Rocket';
import {RocketCarScene, CrabDebrisScene, SlowmoScene} from './scenes/OpenSource';
import {OccupationScene} from './scenes/Occupation';
import {SamScene} from './scenes/Sam';
import {CelebrationScene} from './scenes/Celebration';

const COMPONENTS: Partial<Record<SceneId, React.FC>> = {
  tower: TowerScene,
  boardroom: BoardroomScene,
  sos: SosScene,
  rocket: RocketScene,
  rocketCar: RocketCarScene,
  crabDebris: CrabDebrisScene,
  slowmo: SlowmoScene,
  occupation: OccupationScene,
  sam: SamScene,
  celebration: CelebrationScene,
};

export const SCENES = SCENE_TIMES.map((s) => ({
  ...s,
  Component: COMPONENTS[s.id] ?? makePlaceholder(s.id, s.from),
}));
