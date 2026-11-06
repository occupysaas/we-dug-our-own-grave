import {useMemo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer, EffectPass, RenderPass, BloomEffect, VignetteEffect} from 'postprocessing';
import * as THREE from 'three';

/** Bloom + vignette composer that is sized synchronously (Remotion renders single frames on demand). */
export const Post: React.FC<{bloom: number; threshold: number; vignette: number}> = ({bloom, threshold, vignette}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, {frameBufferType: THREE.HalfFloatType, multisampling: 4});
    c.addPass(new RenderPass(scene, camera));
    const effects = [];
    if (bloom > 0) effects.push(new BloomEffect({intensity: bloom, luminanceThreshold: threshold, luminanceSmoothing: 0.15, mipmapBlur: true}));
    if (vignette > 0) effects.push(new VignetteEffect({offset: 0.3, darkness: vignette}));
    c.addPass(new EffectPass(camera, ...effects));
    c.setSize(size.width, size.height);
    return c;
  }, [gl, scene, camera, size.width, size.height, bloom, threshold, vignette]);
  useFrame(() => {
    composer.render(1 / 30);
  }, 1);
  return null;
};
