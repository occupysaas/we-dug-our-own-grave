import {expect, test} from 'vitest';
import {rng} from '../src/lib/rng';
import {interp} from '../src/lib/anim';

test('rng is deterministic per seed', () => {
  const a = rng(42), b = rng(42);
  for (let i = 0; i < 5; i++) expect(a()).toBe(b());
});
test('rng in [0,1)', () => {
  const r = rng(7);
  for (let i = 0; i < 1000; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
});
test('interp clamps and interpolates', () => {
  expect(interp(0, [[10, 1], [20, 3]])).toBe(1);
  expect(interp(15, [[10, 1], [20, 3]])).toBe(2);
  expect(interp(99, [[10, 1], [20, 3]])).toBe(3);
});
