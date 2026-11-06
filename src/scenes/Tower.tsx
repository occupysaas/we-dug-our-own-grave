import React from 'react';
import {Stage, CameraRig, Lights, CamKey} from '../kit/Stage';
import {useSongTime} from '../kit/song';
import {Crab} from '../kit/Crab';
import {Person} from '../kit/Person';
import {LogoBadge, CanvasPlane} from '../kit/Planes';
import {Box, Bird, City, Floor, Minecart, Rail, Sky, Tower as Skyscraper} from '../kit/Env';
import {Ground} from '../kit/Ground';
import {drawCenteredText} from '../kit/draw';
import {DISPLAY, MONO} from '../lib/fonts';
import {PALETTE} from '../lib/palette';
import {interp, prog, easeOut, easeInOut, easeIn} from '../lib/anim';

const SWAG = ['salesforce', 'databricks', 'docusign', 'auth0', 'adobecc', 'aws', 'azure'];

const exteriorCam: CamKey[] = [
  {f: 0, pos: [30, -260, 70], look: [0, -200, 0], fov: 45},
  {f: 4.3, pos: [14, 4, 26], look: [0, 2, 0], fov: 40},
];
const interiorCam: CamKey[] = [
  {f: 4.3, pos: [4, 3, 8], look: [0, 1.4, -1.5]},
  {f: 6.6, pos: [-1.3, 2.0, 3.9], look: [0.4, 1.4, -1.0]},
  {f: 7.4, pos: [-2.6, 2.0, 1.2], look: [5, 2.0, -2.0]},
  {f: 10.2, pos: [-2.3, 2.0, 1.0], look: [5, 2.0, -2.0]},
  {f: 11.2, pos: [0.3, 2.1, 4.6], look: [0, 1.5, -0.8]},
  {f: 18.5, pos: [-2.0, 2.3, 5.2], look: [-0.4, 1.7, -0.6]},
  {f: 24.5, pos: [1.6, 1.9, 3.4], look: [1.6, 1.3, 0.1]},
  {f: 26.6, pos: [2.0, 1.7, 2.7], look: [1.8, 1.2, 0.3]},
  {f: 27.6, pos: [3.2, 3.4, 6.0], look: [-1.0, 0.8, -2.2]},
  {f: 28.9, pos: [2.6, 3.2, 5.0], look: [-1.0, 0.8, -2.2]},
];

/** Cart path shared by the camera and the cart. */
function cartPos(T: number): [number, number] {
  const ride = prog(T, 28.9, 31.4, (x) => x * (0.5 + 0.5 * x));
  return [interp(ride, [[0, 0], [0.55, -7.4], [1, -14.2]]), interp(ride, [[0, 0], [0.55, 0], [1, -4.7]])];
}
const followCam = (T: number): CamKey[] => {
  const [x, y] = cartPos(T);
  const k = prog(T, 28.9, 29.8, easeInOut);
  const pos: [number, number, number] = [x + 2.6 * (1 - k) + 1.5 * k, y + 3.2 - k * 0.6, -2.2 + 7.2 * (1 - k) + 4.0 * k];
  return [{f: 0, pos, look: [x, y + 1, -2.2]}];
};

export const TowerScene: React.FC = () => {
  const {T} = useSongTime('tower');
  const exterior = T < 4.3;
  return (
    <Stage bg="#2a1238">
      <Sky top="#140a2a" bottom="#ff6a88" />
      <Lights warm />
      {exterior ? <Exterior T={T} /> : <Office T={T} />}
      <CameraRig keys={exterior ? exteriorCam : T < 28.9 ? interiorCam : followCam(T)} frame={T} ease={easeInOut} />
    </Stage>
  );
};

const Exterior: React.FC<{T: number}> = ({T}) => (
  <group>
    <Skyscraper w={20} h={310} position={[0, -300, 0]} lit={0.25} seed={4} sign="saasinc" />
    {/* the lit corner office on floor 100 */}
    <Box size={[20.2, 4, 20.2]} position={[0, 1, 0]} color="#ffe3a8" basic />
    <Ground kind="street" size={1400} tile={40} y={-300} />
    <City count={80} seed={2} area={[600, 600]} position={[0, -300, -60]} maxH={170} />
    <Bird t={T * 30} position={[interp(T, [[0, -40], [4.3, 30]]), interp(T, [[0, -150], [4.3, 3]]), 18]} scale={3} />
  </group>
);

const Office: React.FC<{T: number}> = ({T}) => {
  const f = T * 30;
  // beats
  const holoIn = prog(T, 5.4, 6.3, easeOut);
  const panelIn = prog(T, 10.6, 11.4, easeOut);
  const buttonIn = prog(T, 20.8, 21.6, easeOut);
  const smashPhase = prog(T, 25.6, 27.2);
  const pressed = T > 26.56;
  const flash = T > 26.56 && T < 27.0 ? 1 - prog(T, 26.56, 27.0) : 0;
  const morph = prog(T, 27.5, 28.4, easeInOut);
  const doorOpen = prog(T, 27.6, 28.7, easeInOut);
  const ride = prog(T, 28.9, 31.4, (x) => x * (0.5 + 0.5 * x));
  // cart path: along -x to the door, then down the outside track
  const [cartX, cartY] = cartPos(T);
  const cartTilt = ride > 0.55 ? 0.6 : 0;
  const lookWindow = T > 7.0 && T < 10.6;
  const panelText = T < 14.6 ? 'NOTICE TO SHAREHOLDERS' : T < 18.5 ? 'BUSINESS MODEL: SUNSET' : T < 26.7 ? 'ENJOY YOUR COMPLIMENTARY EXPORT BUTTON' : 'COMPETITIVE ADVANTAGE: EXPIRED';
  return (
    <group>
      {/* far below: the city */}
      <Ground kind="street" size={1200} tile={30} y={-70} />
      <City count={110} seed={5} area={[600, 600]} position={[0, -70, 0]} maxH={95} />
      <Ground kind="wood" size={[14, 9]} tile={3} position={[0, 0.001, -0.5]} />
      {/* ceiling */}
      <Box size={[14, 0.1, 9]} position={[0, 4, -0.5]} color="#e9e4da" />
      {/* back wall covered in swag buttons */}
      <Box size={[13, 4, 0.1]} position={[0, 2, -4]} color="#e4ded3" />
      {Array.from({length: 6}, (_, r) =>
        Array.from({length: 13}, (_, c) => {
          const name = SWAG[(r * 3 + c) % SWAG.length];
          return <LogoBadge key={`${r}-${c}`} name={name} size={0.48} position={[-6 + c * 1.0 + (r % 2) * 0.5, 0.6 + r * 0.6, -3.93]} rotation={[0, 0, ((r * 7 + c * 3) % 5) * 0.06 - 0.12]} />;
        }),
      )}
      {/* window wall (right, x=+6.5): open with mullions */}
      {[-4, -1.5, 1, 3.5].map((z) => (
        <Box key={z} size={[0.15, 4, 0.15]} position={[6.5, 2, z]} color="#3a3f47" />
      ))}
      <Box size={[0.15, 0.15, 9]} position={[6.5, 0.05, -0.5]} color="#3a3f47" />
      {/* left wall with sliding door */}
      <Box size={[0.1, 4, 0.7]} position={[-6.5, 2, -3.65]} color="#e4ded3" />
      {T < 28.9 ? <Box size={[0.1, 4, 4.6]} position={[-6.5, 2, 1.2]} color="#e4ded3" /> : null}
      <Box size={[0.12, 4, 2.2]} position={[-6.5, 2 + doorOpen * 4, -2.2]} color="#b8b0a2" />
      {/* desk */}
      <Box size={[4.2, 0.12, 1.3]} position={[0.3, 0.9, 0.2]} color="#3a2a20" />
      <Box size={[4.0, 0.85, 0.1]} position={[0.3, 0.45, 0.8]} color="#2f2219" />
      {/* hologram projector button */}
      <mesh position={[1.0, 0.98, 0.3]}>
        <cylinderGeometry args={[0.18, 0.2, 0.06, 24]} />
        <meshBasicMaterial color={PALETTE.holo} toneMapped={false} />
      </mesh>
      {holoIn > 0 ? (
        <mesh position={[1.0, 1.5, 0.3]} scale={[holoIn, 1, holoIn]}>
          <cylinderGeometry args={[0.55, 0.18, 1.0, 24, 1, true]} />
          <meshBasicMaterial color={PALETTE.holo} transparent opacity={0.12} toneMapped={false} depthWrite={false} />
        </mesh>
      ) : null}
      {/* the Suit in a high-backed chair → minecart */}
      <group position={[cartX, cartY, -2.2]} rotation={[0, 0, cartTilt]}>
        <group scale={1 - morph}>
          <Box size={[0.8, 2.0, 0.15]} position={[0, 1.4, -0.45]} color="#1d1d1d" />
          <Box size={[0.8, 0.12, 0.8]} position={[0, 0.48, 0]} color="#1d1d1d" />
          <Box size={[0.1, 0.48, 0.1]} position={[0, 0.24, 0]} color="#666" />
        </group>
        {morph > 0 ? <Minecart scale={morph * 1.0} position={[0, -0.05, 0]} rotation={[0, Math.PI / 2, 0]} /> : null}
        <Person
          t={f}
          outfit="suit"
          tie="red"
          pose={ride > 0 ? 'panic' : 'sit'}
          angles={ride > 0 ? {hipL: 1.5, hipR: 1.5, kneeL: -1.5, kneeR: -1.5, bob: -0.42} : undefined}
          rotation={[0, lookWindow ? 1.2 : interp(T, [[24, 0], [25, 0.3]]), 0]}
          position={[0, morph * 0.15, 0]}
        />
      </group>
      {/* rails appear */}
      {morph > 0.5 ? (
        <>
          <Rail length={7.6} position={[-7.6, 0, -2.2]} />
          <Rail length={130} position={[-7.5, 0, -2.2]} rotation={[0, 0, Math.PI + 0.6]} />
        </>
      ) : null}
      {/* hologram crab on the desk */}
      {holoIn > 0 ? (
        <Crab t={f} hologram pose={T > 25.6 && T < 27.6 ? 'smash' : T > 11 && T < 25.6 ? 'present' : 'idle'} phase={smashPhase} position={[1.0, 1.0, 0.3]} scale={0.55 * holoIn} />
      ) : null}
      {/* hologram presentation panel */}
      {panelIn > 0 ? (
        <CanvasPlane
          w={2.6}
          h={1.2}
          px={300}
          position={[-1.5, 1.85 + (1 - panelIn) * -0.4, 0.4]}
          rotation={[0, 0.3, 0]}
          opacity={panelIn * 0.92}
          deps={[panelText]}
          animate={false}
          draw={(ctx, w, h) => {
            ctx.fillStyle = 'rgba(40,190,230,0.22)';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(120,240,255,0.9)';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, w - 6, h - 6);
            ctx.fillStyle = 'rgba(150,245,255,0.95)';
            ctx.font = `700 ${h * 0.09}px ${MONO}`;
            ctx.textAlign = 'left';
            ctx.fillText('CORPORATE AI AGENT // CALL MAY BE RECORDED FOR TRAINING YOUR REPLACEMENT', w * 0.03, h * 0.14, w * 0.94);
            drawCenteredText(ctx, panelText, w, h * 1.1, DISPLAY, h * 0.2, panelText.includes('EXPIRED') ? '#ff6b6b' : '#d8fbff', w * 0.9);
          }}
        />
      ) : null}
      {/* EXPORT HUMAN button (hologram pedestal) */}
      {buttonIn > 0 ? (
        <group position={[1.75, 0.96, 0.35]} scale={buttonIn * 0.9}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.28, 0.32, 0.24, 24]} />
            <meshBasicMaterial color="#5b6670" />
          </mesh>
          <mesh position={[0, pressed ? 0.24 : 0.32, 0]}>
            <sphereGeometry args={[0.24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color={pressed ? '#ff2a2a' : PALETTE.red} toneMapped={false} />
          </mesh>
          <CanvasPlane w={0.9} h={0.2} px={300} position={[0, 0.06, 0.34]} animate={false} draw={(ctx, w, h) => {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, w, h);
            drawCenteredText(ctx, 'EXPORT HUMAN', w, h, DISPLAY, h * 0.7, '#fff');
          }} />
        </group>
      ) : null}
      {flash > 0 ? (
        <mesh position={[0, 2, 2]}>
          <planeGeometry args={[30, 20]} />
          <meshBasicMaterial color="#ff3030" transparent opacity={flash * 0.45} toneMapped={false} depthWrite={false} />
        </mesh>
      ) : null}
      {/* the bird outside the window */}
      <Bird t={f} position={[interp(T, [[7.0, 9], [10.4, 8.5]]), 2.4 + Math.sin(T * 3) * 0.2, interp(T, [[7.0, -14], [10.4, 12]])]} rotation={[0, -Math.PI / 2, 0]} scale={2.2} />
    </group>
  );
};
