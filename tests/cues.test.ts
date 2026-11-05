import {describe, expect, test} from 'vitest';
import {cue, sec, FPS, TOTAL_FRAMES} from '../src/timing/cues';

describe('cue', () => {
  test('finds first SOS', () => expect(cue('SOS', 1)).toBeCloseTo(66.74, 1));
  test('finds "This is an S-O-S" line start', () => expect(cue('this', 2)).toBeCloseTo(65.8, 1));
  test('chorus-1 OUR OWN GRAVE hit is grave#2', () => expect(cue('grave', 2)).toBeCloseTo(102.12, 1));
  test('cared', () => expect(cue('cared', 1)).toBeCloseTo(245.54, 1));
  test('chorus hits after the silence', () => {
    expect(cue('hit1')).toBeCloseTo(101.7, 1);
    expect(cue('hit2')).toBeCloseTo(187.4, 1);
    expect(cue('hit3')).toBeCloseTo(319.4, 1);
  });
  test('the "No."', () => expect(cue('No')).toBeCloseTo(349.74, 1));
  test('unknown word throws', () => expect(() => cue('zzzz')).toThrow());
  test('occurrence past end throws', () => expect(() => cue('cared', 2)).toThrow());
});

describe('sec', () => {
  test('converts seconds to frames', () => expect(sec(1)).toBe(30));
  test('totals', () => { expect(FPS).toBe(30); expect(TOTAL_FRAMES).toBe(11040); });
});
