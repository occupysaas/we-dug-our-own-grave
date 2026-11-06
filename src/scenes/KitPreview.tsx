import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Stage, CameraRig, Lights} from '../kit/Stage';
import {Crab} from '../kit/Crab';
import {Person} from '../kit/Person';
import {Crowd} from '../kit/Crowd';
import {Bubble, Cutout2D, LogoBadge, Screen} from '../kit/Planes';
import {drawChart} from '../kit/draw';
import {PALETTE} from '../lib/palette';

export const KitPreview: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Stage bg="#120d1c">
      <CameraRig keys={[{f: 0, pos: [0, 2.4, 11], look: [0, 1.2, 0]}]} />
      <Lights />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshToonMaterial color={PALETTE.grey1} />
      </mesh>
      <Crab t={t} pose="cheer" position={[-5, 0, 1]} scale={1.3} />
      <Crab t={t} pose="idle" hologram position={[-3.2, 0, 1]} scale={1} />
      <Person t={t} outfit="suit" tie="red" pose="stand" position={[-1.6, 0, 1]} />
      <Person t={t} outfit="hoodie" head={{photo: 'linus'}} pose="throw" position={[-0.3, 0, 1]} />
      <Person t={t} outfit="sweater" head={{photo: 'sam'}} pose="stand" position={[1, 0, 1]} />
      <Person t={t} outfit="reaper" head={{mask: 'fawkes'}} scythe pose="stand" position={[2.3, 0, 1]} />
      <Person t={t} outfit="board" tie="gold" pose="panic" position={[3.5, 0, 1]} />
      <Cutout2D kind="mickey" height={1.7} position={[4.8, 0.9, 1]} />
      <Cutout2D kind="clippy" height={1.5} position={[5.9, 0.8, 1]} />
      <Bubble text="Would you like help seizing the means of production?" w={3} position={[5.6, 2.8, 1]} />
      <Crowd count={40} seed={3} area={[16, 3]} t={t} cheer={1} position={[0, 0, -4]} />
      {['salesforce', 'aws', 'linux', 'occupysaas', 'ubuntu', 'adobecc'].map((n, i) => (
        <LogoBadge key={n} name={n} size={0.8} position={[-5 + i * 1.0, 4.2, -1]} />
      ))}
      <Screen w={3} h={1.7} position={[3.5, 4.3, -1]} draw={(ctx, w, h) => drawChart(ctx, w, h, [0.5, 0.52, 0.5, 0.53, 0.51, 0.1, -0.4], PALETTE.red, {title: 'SAAS INDEX', ticker: '-98.2%'})} />
    </Stage>
  );
};
