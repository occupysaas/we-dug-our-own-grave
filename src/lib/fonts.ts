import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const DISPLAY = loadArchivo('normal', {weights: ['800', '900'], subsets: ['latin']}).fontFamily;
export const MARKER = loadMarker('normal', {subsets: ['latin']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']}).fontFamily;
