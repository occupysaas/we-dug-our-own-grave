import {expect, test} from 'vitest';
import {shakeAt, BEATS} from '../src/timing/shake';

test('beats loaded, sorted, ~112 bpm', () => {
  expect(BEATS.length).toBeGreaterThan(500);
  for (let i = 1; i < BEATS.length; i++) expect(BEATS[i][0]).toBeGreaterThan(BEATS[i - 1][0]);
});
test('kick right on a strong chorus beat', () => {
  const b = BEATS.find(([t, s]) => t > 84 && s > 0.6)!;
  const k = shakeAt(b[0] + 0.01);
  expect(Math.hypot(k.x, k.y)).toBeGreaterThan(2);
});
test('decays to ~0 well after a beat', () => {
  const b = BEATS.find(([t]) => t > 84)!;
  const next = BEATS.find(([t]) => t > b[0])![0];
  const mid = b[0] + Math.min(0.35, (next - b[0]) * 0.9);
  expect(Math.hypot(shakeAt(mid).x, shakeAt(mid).y)).toBeLessThan(Math.hypot(shakeAt(b[0] + 0.01).x, shakeAt(b[0] + 0.01).y));
});
test('no shake in the silent tag', () => {
  const k = shakeAt(363);
  expect(k.x).toBe(0);
  expect(k.y).toBe(0);
});
test('deterministic', () => expect(shakeAt(100.123)).toEqual(shakeAt(100.123)));
