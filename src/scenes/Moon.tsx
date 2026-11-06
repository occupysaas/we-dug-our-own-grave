import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useSongTime} from '../kit/song';
import {PALETTE} from '../lib/palette';
import {MARKER, DISPLAY} from '../lib/fonts';
import {rng} from '../lib/rng';
import {interp, prog, easeOut, easeInOut} from '../lib/anim';

const W = 1920, H = 1080;
const STARS = (() => {
  const r = rng(61);
  return Array.from({length: 160}, () => ({x: r() * W, y: r() * H * 0.7, s: 1 + r() * 3}));
})();

/** Flat-cartoon moon landing (352.6–360). */
export const MoonScene: React.FC = () => {
  const {T, f} = useSongTime('moon');
  const land = prog(T, 352.6, 354.4, easeOut);
  const carY = interp(land, [[0, -260], [1, 640]]);
  const dust = prog(T, 354.2, 355.6);
  const hop = prog(T, 354.5, 355.1, easeInOut);
  const linusX = interp(hop, [[0, 900], [1, 1180]]);
  const linusY = 690 - Math.sin(hop * Math.PI) * 90;
  const plant = prog(T, 355.1, 355.7, easeOut);
  const bubble = prog(T, 355.6, 356.0, easeOut);
  const wave = Math.sin(f * 0.25);
  return (
    <AbsoluteFill style={{background: '#07070d'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s * (0.7 + 0.3 * Math.sin(f * 0.1 + i))} fill="#fff" />
        ))}
        {/* earth */}
        <g transform="translate(330 170)">
          <circle r="110" fill="#2d6fb3" stroke="#000" strokeWidth="8" />
          <path d="M-60 -40 q30 -30 60 0 q20 30 -10 50 q-40 10 -50 -50z M20 30 q40 -10 50 30 q-20 30 -50 10z" fill="#4f9a4a" stroke="#000" strokeWidth="5" />
        </g>
        {/* moon surface */}
        <path d={`M0 760 Q 480 700 960 740 T 1920 730 L1920 1080 L0 1080 Z`} fill="#c9c6bd" stroke="#000" strokeWidth="10" />
        {[[300, 880, 70], [820, 960, 50], [1500, 900, 90], [1150, 1010, 40], [80, 1000, 45]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.35} fill="#a9a59b" stroke="#000" strokeWidth="6" />
        ))}
        {/* dust */}
        {dust > 0 && dust < 1
          ? [-1, 1].map((s) => <ellipse key={s} cx={760 + s * 160 * (0.5 + dust)} cy={735} rx={120 * dust} ry={40 * dust} fill="#e6e2d8" opacity={1 - dust} stroke="#000" strokeWidth="4" />)
          : null}
        {/* rocket car (flat), nose up while landing then level */}
        <g transform={`translate(760 ${carY}) rotate(${interp(land, [[0, -70], [0.85, -10], [1, 0]])})`}>
          {land < 0.98 ? <path d={`M-250 -10 L-${330 + Math.abs(wave) * 40} 0 L-250 25 Z`} fill="#ffb020" stroke="#000" strokeWidth="6" transform="rotate(0)" /> : null}
          <rect x="-250" y="-60" width="440" height="80" rx="18" fill={PALETTE.red} stroke="#000" strokeWidth="10" />
          <path d="M190 -60 L290 -20 L190 20 Z" fill="#111" stroke="#000" strokeWidth="10" />
          <rect x="-230" y="-30" width="400" height="16" fill={PALETTE.paper} />
          <text x="-30" y="-74" fontFamily={DISPLAY} fontWeight={900} fontSize="30" fill="#fff" stroke="#000" strokeWidth="2" textAnchor="middle">OPEN SOURCE EXPRESS</text>
          {/* crab waving from the car (flat pixel crab) */}
          <g transform={`translate(-120 -120) rotate(${wave * 6})`}>
            <rect x="-45" y="-30" width="90" height="55" fill={PALETTE.crab} stroke="#000" strokeWidth="6" />
            <rect x="-24" y="-18" width="10" height="20" fill="#111" />
            <rect x="14" y="-18" width="10" height="20" fill="#111" />
            <rect x="45" y={-20 - Math.max(0, wave) * 30} width="26" height="18" fill={PALETTE.crab} stroke="#000" strokeWidth="5" />
            <rect x="-71" y="-6" width="26" height="18" fill={PALETTE.crab} stroke="#000" strokeWidth="5" />
          </g>
        </g>
        {/* flag */}
        {plant > 0 ? (
          <g transform={`translate(1330 ${interp(plant, [[0, 420], [1, 745]])})`}>
            <rect x="-6" y="-330" width="12" height="340" fill="#ddd" stroke="#000" strokeWidth="5" />
            <path d={`M6 -325 L270 ${-315 + wave * 8} L270 ${-170 + wave * 8} L6 -180 Z`} fill={PALETTE.paper} stroke="#000" strokeWidth="7" />
            {/* simple feather emblem */}
            <path d={`M40 -200 q60 -90 140 -110 q-30 70 -140 110z`} fill={PALETTE.red} stroke="#000" strokeWidth="4" />
            <text x="150" y={-218 + wave * 6} fontFamily={DISPLAY} fontWeight={900} fontSize="36" fill="#111" textAnchor="middle">APACHE 2.0</text>
          </g>
        ) : null}
      </svg>
      {/* cartoon Linus: flat body + photo head */}
      {hop > 0 ? (
        <div style={{position: 'absolute', left: linusX - 70, top: linusY - 300, width: 140, height: 320, transform: 'scale(1.35)', transformOrigin: 'bottom center'}}>
          <div style={{position: 'absolute', left: 25, top: 120, width: 90, height: 130, background: '#1a1a1a', border: '7px solid #000', borderRadius: 26}} />
          <div style={{position: 'absolute', left: 30, top: 240, width: 26, height: 70, background: '#2c3440', border: '6px solid #000'}} />
          <div style={{position: 'absolute', left: 84, top: 240, width: 26, height: 70, background: '#2c3440', border: '6px solid #000'}} />
          <div style={{position: 'absolute', left: 110, top: 130, width: 22, height: 90, background: '#1a1a1a', border: '6px solid #000', transformOrigin: 'top', transform: `rotate(${plant < 1 ? -60 : -30}deg)`}} />
          <div style={{position: 'absolute', left: 8, top: -10, width: 124, height: 150, borderRadius: '50%', overflow: 'hidden', border: '7px solid #fbfaf6', boxShadow: '0 0 0 5px #000', transform: `rotate(${Math.sin(f * 0.15) * 6}deg)`}}>
            <Img src={staticFile('heads/linus.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </div>
      ) : null}
      {/* chat bubble */}
      {bubble > 0 ? (
        <div style={{position: 'absolute', left: 1060, top: 24, width: 780, transform: `scale(${bubble})`, transformOrigin: 'bottom left', background: '#fff', border: '8px solid #000', borderRadius: 40, padding: '26px 36px', fontFamily: MARKER, fontSize: 48, lineHeight: 1.2, color: PALETTE.ink}}>
          One small kernel for mankind, one LLM with open weights.
          <div style={{position: 'absolute', left: 80, bottom: -60, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: '60px solid #000'}} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
