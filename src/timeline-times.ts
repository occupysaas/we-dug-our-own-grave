export type SceneId =
  | 'tower' | 'boardroom' | 'sos' | 'rocket' | 'rocketCar' | 'crabDebris'
  | 'slowmo' | 'occupation' | 'sam' | 'celebration' | 'moon' | 'outro' | 'tag';

export const SCENE_TIMES: {id: SceneId; from: number; to: number}[] = [
  {id: 'tower', from: 0, to: 31.5},
  {id: 'boardroom', from: 31.5, to: 65.8},
  {id: 'sos', from: 65.8, to: 72.3},
  {id: 'rocket', from: 72.3, to: 118},
  {id: 'rocketCar', from: 118, to: 130.2},
  {id: 'crabDebris', from: 130.2, to: 134.6},
  {id: 'slowmo', from: 134.6, to: 151.6},
  {id: 'occupation', from: 151.6, to: 187.8},
  {id: 'sam', from: 187.8, to: 287.8},
  {id: 'celebration', from: 287.8, to: 337.4},
  {id: 'outro', from: 337.4, to: 352.6},
  {id: 'moon', from: 352.6, to: 360},
  {id: 'tag', from: 360, to: 368},
];
