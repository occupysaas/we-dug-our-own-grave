import {useCurrentFrame} from 'remotion';
import {FPS} from '../timing/cues';
import {SCENE_TIMES, SceneId} from '../timeline-times';

/** Absolute song time (seconds) inside a scene, plus the local frame. */
export function useSongTime(id: SceneId) {
  const f = useCurrentFrame();
  const from = SCENE_TIMES.find((s) => s.id === id)!.from;
  return {T: from + f / FPS, f, from};
}
