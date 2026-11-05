import {expect, test} from 'vitest';
import {SCENE_TIMES} from '../src/timeline-times';

test('timeline starts at 0 and ends at 368', () => {
  expect(SCENE_TIMES[0].from).toBe(0);
  expect(SCENE_TIMES[SCENE_TIMES.length - 1].to).toBe(368);
});
test('scenes are contiguous with no gaps/overlaps', () => {
  for (let i = 0; i < SCENE_TIMES.length - 1; i++) expect(SCENE_TIMES[i].to).toBe(SCENE_TIMES[i + 1].from);
});
test('ids unique and durations positive', () => {
  expect(new Set(SCENE_TIMES.map((s) => s.id)).size).toBe(SCENE_TIMES.length);
  for (const s of SCENE_TIMES) expect(s.to).toBeGreaterThan(s.from);
});
