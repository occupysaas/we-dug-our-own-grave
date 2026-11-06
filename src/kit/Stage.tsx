import React from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {interp, easeInOut, Ease} from '../lib/anim';
import {Post} from './Post';

/** Full-frame Three canvas. Children render in a frame-driven scene. */
export const Stage: React.FC<{children: React.ReactNode; bg?: string; fog?: [string, number, number]; bloom?: number; threshold?: number; vignette?: number}> = ({children, bg = '#111', fog, bloom = 0.8, threshold = 0.9, vignette = 0.45}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{background: bg}}
      gl={{antialias: true, preserveDrawingBuffer: true}}
      camera={{fov: 40, near: 0.1, far: 2000, position: [0, 2, 10]}}
      dpr={1}
    >
      <color attach="background" args={[bg]} />
      {fog ? <fog attach="fog" args={fog} /> : null}
      {children}
      {bloom > 0 || vignette > 0 ? <Post bloom={bloom} threshold={threshold} vignette={vignette} /> : null}
    </ThreeCanvas>
  );
};

export type CamKey = {f: number; pos: [number, number, number]; look: [number, number, number]; fov?: number; roll?: number};

/** Keyframed camera. `f` keys are frames relative to the scene. Optional handheld shake. */
export const CameraRig: React.FC<{keys: CamKey[]; ease?: Ease; shake?: number; frame?: number}> = ({keys, ease = easeInOut, shake = 0, frame}) => {
  const cf = useCurrentFrame();
  const f = frame ?? cf;
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const ch = (sel: (k: CamKey) => number) => interp(f, keys.map((k) => [k.f, sel(k)] as [number, number]), ease);
  const sx = shake ? (Math.sin(cf * 1.7) + Math.sin(cf * 2.9)) * 0.5 * shake : 0;
  const sy = shake ? (Math.sin(cf * 2.3) + Math.sin(cf * 1.1)) * 0.5 * shake : 0;
  camera.position.set(ch((k) => k.pos[0]) + sx, ch((k) => k.pos[1]) + sy, ch((k) => k.pos[2]));
  camera.lookAt(ch((k) => k.look[0]), ch((k) => k.look[1]), ch((k) => k.look[2]));
  const roll = ch((k) => k.roll ?? 0);
  if (roll) camera.rotateZ(roll);
  const fov = ch((k) => k.fov ?? 40);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

/** Default toon-friendly lighting. */
export const Lights: React.FC<{intensity?: number; warm?: boolean; key?: [number, number, number]}> = ({intensity = 1, warm = false, key = [6, 10, 8]}) => (
  <>
    <hemisphereLight args={[warm ? '#ffe9d0' : '#e8f0ff', '#3a3530', 0.9 * intensity]} />
    <directionalLight position={key} intensity={1.6 * intensity} color={warm ? '#ffd9b0' : '#ffffff'} />
    <directionalLight position={[-8, 4, -6]} intensity={0.5 * intensity} color="#9fb3c8" />
  </>
);

/** Toon material shortcut. */
export const Toon: React.FC<{color: string; emissive?: string; emissiveIntensity?: number; transparent?: boolean; opacity?: number; side?: THREE.Side}> = (p) => (
  <meshToonMaterial color={p.color} emissive={p.emissive ?? '#000'} emissiveIntensity={p.emissiveIntensity ?? 1} transparent={p.transparent} opacity={p.opacity ?? 1} side={p.side} />
);
