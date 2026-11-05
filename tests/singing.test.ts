import {expect, test} from 'vitest';
import {mouthOpen} from '../src/kit/singing';

test('mouth closed in instrumental intro', () => expect(mouthOpen(1.0)).toBe(0));
test('mouth open during a sung word', () => expect(mouthOpen(66.9)).toBeGreaterThan(0)); // "SOS" 66.74–67.38
