import {rng} from '../lib/rng';

export type Pose =
  | 'stand' | 'sit' | 'walk' | 'run' | 'panic' | 'throw' | 'crawl' | 'hide' | 'cheer' | 'sip' | 'point' | 'fall';

export type Angles = {
  shoulderL: number; shoulderR: number; // forward (+) / back (-) swing, radians
  spreadL: number; spreadR: number; // sideways raise, radians
  elbowL: number; elbowR: number;
  hipL: number; hipR: number; kneeL: number; kneeR: number;
  spine: number; // lean forward
  bob: number; // vertical offset (world units)
};

const Z: Angles = {shoulderL: 0, shoulderR: 0, spreadL: 0.08, spreadR: 0.08, elbowL: 0, elbowR: 0, hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, spine: 0, bob: 0};

/** Procedural pose as a pure function of pose and frame t. */
export function poseAngles(pose: Pose, t: number): Angles {
  const s = Math.sin;
  switch (pose) {
    case 'stand':
      return {...Z, bob: 0.01 * s(t * 0.08), shoulderL: 0.03 * s(t * 0.08), shoulderR: -0.03 * s(t * 0.08)};
    case 'sit':
      return {...Z, hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, shoulderL: 0.5, shoulderR: 0.5, elbowL: -0.9, elbowR: -0.9, bob: -0.42};
    case 'walk': {
      const p = t * 0.32;
      return {...Z, shoulderL: 0.5 * s(p), shoulderR: -0.5 * s(p), hipL: -0.5 * s(p), hipR: 0.5 * s(p), kneeL: -0.4 * Math.max(0, s(p + 1.2)), kneeR: -0.4 * Math.max(0, -s(p + 1.2)), bob: 0.03 * Math.abs(s(p))};
    }
    case 'run': {
      const p = t * 0.62;
      return {...Z, shoulderL: 1.1 * s(p), shoulderR: -1.1 * s(p), elbowL: -1.2, elbowR: -1.2, hipL: -0.9 * s(p), hipR: 0.9 * s(p), kneeL: -1.1 * Math.max(0, s(p + 1.4)), kneeR: -1.1 * Math.max(0, -s(p + 1.4)), spine: 0.25, bob: 0.08 * Math.abs(s(p))};
    }
    case 'panic': {
      const p = t * 0.9;
      return {...Z, spreadL: 2.6 + 0.4 * s(p), spreadR: 2.6 + 0.4 * s(p + 1.7), elbowL: -0.3, elbowR: -0.3, hipL: -0.9 * s(p * 0.7), hipR: 0.9 * s(p * 0.7), kneeL: -0.8 * Math.max(0, s(p * 0.7 + 1.4)), kneeR: -0.8 * Math.max(0, -s(p * 0.7 + 1.4)), bob: 0.1 * Math.abs(s(p * 0.7))};
    }
    case 'throw': {
      const c = (t % 40) / 40; // windup then release every 40 frames
      const arm = c < 0.6 ? -2.6 * (c / 0.6) : -2.6 + 4.2 * ((c - 0.6) / 0.4);
      return {...Z, shoulderR: arm, elbowR: -0.4, shoulderL: 0.6, spine: c < 0.6 ? -0.15 : 0.25};
    }
    case 'crawl': {
      const p = t * 0.3;
      return {...Z, spine: 1.35, shoulderL: 1.4 + 0.4 * s(p), shoulderR: 1.4 - 0.4 * s(p), hipL: 1.2 - 0.3 * s(p), hipR: 1.2 + 0.3 * s(p), kneeL: -1.4, kneeR: -1.4, bob: -0.55};
    }
    case 'hide':
      return {...Z, hipL: 2.2, hipR: 2.2, kneeL: -2.4, kneeR: -2.4, shoulderL: 1.3, shoulderR: 1.3, elbowL: -1.6, elbowR: -1.6, spine: 0.4, bob: -0.7 + 0.02 * s(t * 1.7)};
    case 'cheer': {
      const p = t * 0.45;
      return {...Z, spreadL: 2.7 + 0.3 * s(p), spreadR: 2.7 + 0.3 * s(p + 0.5), bob: 0.12 * Math.max(0, s(p))};
    }
    case 'sip':
      return {...Z, shoulderR: 1.2, elbowR: -1.9, bob: 0.01 * s(t * 0.08)};
    case 'point':
      return {...Z, shoulderR: 1.5, spreadR: 0.2, bob: 0.01 * s(t * 0.08)};
    case 'fall':
      return {...Z, spreadL: 2.0 + 0.6 * s(t * 0.8), spreadR: 2.0 + 0.6 * s(t * 0.8 + 2), hipL: 0.6 * s(t * 0.6), hipR: -0.6 * s(t * 0.6), kneeL: -0.6, kneeR: -0.6};
  }
}

export type CrowdMember = {x: number; z: number; s: number; phase: number; variant: number};

/** Deterministic scatter of `count` crowd members within a w×d rectangle centered at 0. */
export function crowdLayout(count: number, seed: number, area: [number, number]): CrowdMember[] {
  const r = rng(seed);
  const [w, d] = area;
  return Array.from({length: count}, () => ({
    x: (r() - 0.5) * w,
    z: (r() - 0.5) * d,
    s: 0.85 + r() * 0.3,
    phase: r() * Math.PI * 2,
    variant: Math.floor(r() * 4),
  }));
}
