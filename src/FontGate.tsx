import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {DISPLAY, MARKER, MONO} from './lib/fonts';

const SPECS = [`900 40px ${DISPLAY}`, `800 40px ${DISPLAY}`, `400 40px ${MARKER}`, `400 40px ${MONO}`, `700 40px ${MONO}`];
let loaded = false;

/** Renders children only after every canvas font is loaded, so canvas textures never bake a fallback font. */
export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [ready, setReady] = useState(loaded);
  useEffect(() => {
    if (ready) return;
    const handle = delayRender('canvas fonts');
    Promise.all(SPECS.map((s) => document.fonts.load(s)))
      .then(() => document.fonts.ready)
      .then(() => {
        loaded = true;
        setReady(true);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [ready]);
  return ready ? <>{children}</> : null;
};
