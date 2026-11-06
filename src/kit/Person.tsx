import React from 'react';
import * as THREE from 'three';
import {Angles, Pose, poseAngles} from './pose';
import {CanvasPlane} from './Planes';
import {drawFawkes} from './draw';
import {useImage} from './tex';
import {PALETTE} from '../lib/palette';

type V3 = [number, number, number];
export type Outfit = 'suit' | 'board' | 'hoodie' | 'reaper' | 'sweater' | 'secretary' | 'casual';
export type Head = {photo: 'linus' | 'sam'} | {mask: 'anon' | 'fawkes'} | {skin?: string; hair?: string};

const OUTFITS: Record<Outfit, {jacket: string; pants: string; shirt: string}> = {
  suit: {jacket: '#2b2e36', pants: '#24262c', shirt: '#f2f2f2'},
  board: {jacket: '#26334d', pants: '#1e2638', shirt: '#eef2f7'},
  hoodie: {jacket: '#1a1a1a', pants: '#2c3440', shirt: '#1a1a1a'},
  reaper: {jacket: '#0d0d0d', pants: '#0d0d0d', shirt: '#0d0d0d'},
  sweater: {jacket: '#8d9097', pants: '#3b4250', shirt: '#8d9097'},
  secretary: {jacket: '#7a2235', pants: '#2a2a30', shirt: '#f4efe6'},
  casual: {jacket: '#5a6b7d', pants: '#35404d', shirt: '#5a6b7d'},
};

/** Oval paper cut-out photo face that wobbles like a puppet. */
export const PhotoHead: React.FC<{which: 'linus' | 'sam'; t: number; size?: number; wobble?: number; position?: V3}> = ({which, t, size = 0.62, wobble = 1, position}) => {
  const img = useImage(`heads/${which}.jpg`);
  const rot = Math.sin(t * 0.15) * 0.08 * wobble;
  const slide = Math.sin(t * 0.07) * 0.04 * wobble;
  return (
    <group position={position}>
      <group position={[slide, 0, 0]} rotation={[0, 0, rot]}>
        <CanvasPlane
          w={size}
          h={size * 1.25}
          px={420}
          animate={false}
          deps={[img]}
          position={[0, 0, 0.25]}
          doubleSide={false}
          draw={(ctx, w, h) => {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#fbfaf6';
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w / 2 - 14, h / 2 - 14, 0, 0, Math.PI * 2);
            ctx.clip();
            if (img) ctx.drawImage(img, 0, 0, w, h);
            ctx.restore();
          }}
        />
        {/* back of the cut-out: hair, so from behind you see a head, not a face */}
        <mesh position={[0, 0.02, 0.245]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[size * 0.5, 24]} />
          <meshToonMaterial color={which === 'linus' ? '#8a7356' : '#2b1d16'} />
        </mesh>
      </group>
    </group>
  );
};

const Mask: React.FC<{kind: 'anon' | 'fawkes'}> = ({kind}) => (
  <CanvasPlane w={0.5} h={0.62} px={400} animate={false} deps={[kind]} position={[0, 0, 0.21]} lit doubleSide={false} draw={(ctx, w, h) => drawFawkes(ctx, w, h, {pale: kind === 'anon'})} />
);

/**
 * Low-poly person made of simple shapes, ~1.8 units tall, feet at y=0.
 * Head options: photo cut-out, mask, or plain skin head.
 */
export const Person: React.FC<{
  outfit?: Outfit;
  tie?: 'red' | 'gold' | 'none';
  head?: Head;
  pose?: Pose;
  t: number;
  angles?: Partial<Angles>;
  position?: V3;
  rotation?: V3;
  scale?: number;
  holding?: React.ReactNode; // attached to right hand
  hood?: boolean;
  scythe?: boolean;
  headExtra?: React.ReactNode;
}> = ({outfit = 'suit', tie = 'none', head = {}, pose = 'stand', t, angles, position, rotation, scale = 1, holding, hood, scythe, headExtra}) => {
  const a = {...poseAngles(pose, t), ...angles};
  const o = OUTFITS[outfit];
  const skin = 'skin' in head && head.skin ? head.skin : '#e9b99a';
  const hair = 'hair' in head && head.hair ? head.hair : '#3b2a20';
  const robe = outfit === 'reaper';
  const hooded = hood ?? (outfit === 'hoodie' || robe);
  const limb = (len: number, w: number, color: string) => (
    <mesh position={[0, -len / 2, 0]}>
      <boxGeometry args={[w, len, w]} />
      <meshToonMaterial color={color} />
    </mesh>
  );
  const arm = (side: 1 | -1) => {
    const sh = side === -1 ? a.shoulderL : a.shoulderR;
    const sp = side === -1 ? a.spreadL : a.spreadR;
    const el = side === -1 ? a.elbowL : a.elbowR;
    return (
      <group position={[side * 0.3, 1.42, 0]} rotation={[-sh, 0, side * sp]}>
        {limb(0.32, 0.13, o.jacket)}
        <group position={[0, -0.32, 0]} rotation={[el, 0, 0]}>
          {limb(0.3, 0.12, o.jacket)}
          <mesh position={[0, -0.34, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshToonMaterial color={robe ? '#e8e4da' : skin} />
          </mesh>
          {side === 1 && holding ? <group position={[0, -0.38, 0.05]}>{holding}</group> : null}
        </group>
      </group>
    );
  };
  const leg = (side: 1 | -1) => (
    <group position={[side * 0.12, 0.85, 0]} rotation={[-(side === -1 ? a.hipL : a.hipR), 0, 0]}>
      {limb(0.42, 0.16, o.pants)}
      <group position={[0, -0.42, 0]} rotation={[-(side === -1 ? a.kneeL : a.kneeR), 0, 0]}>
        {limb(0.4, 0.15, o.pants)}
        <mesh position={[0, -0.42, 0.05]}>
          <boxGeometry args={[0.15, 0.08, 0.26]} />
          <meshToonMaterial color="#141414" />
        </mesh>
      </group>
    </group>
  );
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, a.bob, 0]}>
        {robe ? (
          <mesh position={[0, 0.78, 0]}>
            <coneGeometry args={[0.45, 1.6, 8]} />
            <meshToonMaterial color={o.jacket} />
          </mesh>
        ) : (
          <>
            {leg(-1)}
            {leg(1)}
          </>
        )}
        <group position={[0, 0.85, 0]} rotation={[a.spine, 0, 0]}>
          <group position={[0, -0.85, 0]}>
            {/* torso */}
            <mesh position={[0, 1.18, 0]}>
              <boxGeometry args={[0.52, 0.62, 0.3]} />
              <meshToonMaterial color={o.jacket} />
            </mesh>
            {outfit === 'suit' || outfit === 'board' || outfit === 'secretary' ? (
              <mesh position={[0, 1.3, 0.151]}>
                <planeGeometry args={[0.16, 0.36]} />
                <meshToonMaterial color={o.shirt} />
              </mesh>
            ) : null}
            {tie !== 'none' ? (
              <mesh position={[0, 1.24, 0.156]}>
                <planeGeometry args={[0.07, 0.34]} />
                <meshToonMaterial color={tie === 'red' ? PALETTE.red : PALETTE.gold} side={THREE.DoubleSide} />
              </mesh>
            ) : null}
            {arm(-1)}
            {arm(1)}
            {/* neck + head */}
            <group position={[0, 1.66, 0]}>
              {'photo' in head ? (
                <>
                  <mesh>
                    <sphereGeometry args={[0.2, 10, 8]} />
                    <meshToonMaterial color={skin} />
                  </mesh>
                  <PhotoHead which={head.photo} t={t} position={[0, 0.02, 0]} />
                </>
              ) : (
                <>
                  <mesh>
                    <sphereGeometry args={[0.2, 10, 8]} />
                    <meshToonMaterial color={robe ? '#e8e4da' : skin} />
                  </mesh>
                  {!hooded && !('mask' in head) ? (
                    <>
                      <mesh position={[0, 0.08, -0.02]} scale={[1.05, 0.7, 1.05]}>
                        <sphereGeometry args={[0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshToonMaterial color={hair} />
                      </mesh>
                      {[-0.07, 0.07].map((x) => (
                        <mesh key={x} position={[x, 0.02, 0.19]}>
                          <boxGeometry args={[0.035, 0.05, 0.01]} />
                          <meshBasicMaterial color="#111" />
                        </mesh>
                      ))}
                    </>
                  ) : null}
                  {'mask' in head ? <Mask kind={head.mask} /> : null}
                </>
              )}
              {hooded ? (
                <mesh position={[0, 0.03, -0.04]} scale={[1.25, 1.3, 1.25]}>
                  <sphereGeometry args={[0.2, 12, 8, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5]} />
                  <meshToonMaterial color={o.jacket} side={THREE.DoubleSide} />
                </mesh>
              ) : null}
              {headExtra}
            </group>
          </group>
        </group>
        {scythe ? (
          <group position={[0.42, 0.9, 0.1]} rotation={[0, 0, -0.1]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 2.1, 6]} />
              <meshToonMaterial color="#4a3526" />
            </mesh>
            <mesh position={[-0.3, 1.0, 0]} rotation={[0, 0, 0.25]}>
              <boxGeometry args={[0.7, 0.07, 0.02]} />
              <meshToonMaterial color="#c9ccd3" />
            </mesh>
          </group>
        ) : null}
      </group>
    </group>
  );
};
