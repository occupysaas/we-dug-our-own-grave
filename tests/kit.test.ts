import {expect, test} from 'vitest';
import {poseAngles, crowdLayout} from '../src/kit/pose';

test('poseAngles deterministic per frame', () => {
  expect(poseAngles('run', 15)).toEqual(poseAngles('run', 15));
});
test('poseAngles animates over time for run', () => {
  expect(poseAngles('run', 15)).not.toEqual(poseAngles('run', 16));
});
test('poseAngles sit bends hips', () => {
  expect(Math.abs(poseAngles('sit', 0).hipL)).toBeGreaterThan(1);
});
test('crowdLayout count, determinism, bounds', () => {
  const a = crowdLayout(200, 7, [40, 20]);
  expect(a).toHaveLength(200);
  expect(a).toEqual(crowdLayout(200, 7, [40, 20]));
  for (const p of a) {
    expect(Math.abs(p.x)).toBeLessThanOrEqual(20);
    expect(Math.abs(p.z)).toBeLessThanOrEqual(10);
  }
});
