import {expect, test} from 'vitest';
import {LYRICS, lineAt, placementAt} from '../src/timing/lyrics';

test('all 91 official lines, monotonic starts', () => {
  expect(LYRICS).toHaveLength(91);
  for (let i = 1; i < LYRICS.length; i++) expect(LYRICS[i].start).toBeGreaterThanOrEqual(LYRICS[i - 1].start);
});
test('SOS line lands on the SOS', () => {
  const l = LYRICS.find((x) => x.text.startsWith('This is an S-O-S, somebody'))!;
  expect(l.start).toBeCloseTo(65.8, 0);
});
test('OUR OWN GRAVE hits after the silence', () => {
  const hits = LYRICS.filter((x) => x.text === 'OUR OWN GRAVE!').map((x) => x.start);
  expect(hits).toEqual([101.7, 187.4, 319.4]);
});
test('lineAt shows the line being sung and nothing in the silent tag', () => {
  expect(lineAt(66.5)?.text).toMatch(/S-O-S/);
  expect(lineAt(364)).toBeNull();
  expect(lineAt(1.0)).toBeNull();
});
test('hit line stays up through its moment', () => expect(lineAt(102.0)?.text).toBe('OUR OWN GRAVE!'));
test('lyrics move to the top while the secretary bubble is at the bottom', () => {
  expect(placementAt(275)).toBe('top');
  expect(placementAt(60)).toBe('bottom');
});
