import * as THREE from 'three';
import {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

/** Canvas texture that is redrawn every time `deps` change (call inside a component that re-renders per frame). */
export function useCanvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const {canvas, tex} = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return {canvas, tex};
  }, [w, h]);
  // draw synchronously during render so the frame is always up to date
  useMemo(() => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
    tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, tex, ...deps]);
  return tex;
}

const imgCache = new Map<string, HTMLImageElement>();

/** Preload images at module load with delayRender, so 3D components get them synchronously on first render. */
export const PRELOAD = ['heads/linus.jpg', 'heads/sam.jpg', 'occupysaas.jpg'];
if (typeof window !== 'undefined') {
  for (const path of PRELOAD) {
    const handle = delayRender(`preload ${path}`);
    const el = new Image();
    el.onload = () => {
      imgCache.set(path, el);
      continueRender(handle);
    };
    el.onerror = () => continueRender(handle);
    el.src = staticFile(path);
  }
}

/** Loads an image from /public with delayRender so renders wait for it. */
export function useImage(path: string): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(() => {
    const c = imgCache.get(path);
    return c && c.complete ? c : null;
  });
  useEffect(() => {
    if (img) return;
    const handle = delayRender(`img ${path}`);
    const el = new Image();
    el.onload = () => {
      imgCache.set(path, el);
      setImg(el);
      continueRender(handle);
    };
    el.onerror = () => continueRender(handle);
    el.src = staticFile(path);
  }, [path, img]);
  return img;
}
