"""Detect beats in the song and write src/timing/beats.json as [[time_sec, strength_0_1], ...]."""
import json, sys
import numpy as np
import librosa

src, out = sys.argv[1], sys.argv[2]
y, sr = librosa.load(src, sr=22050, mono=True)
onset = librosa.onset.onset_strength(y=y, sr=sr)
tempo, frames = librosa.beat.beat_track(onset_envelope=onset, sr=sr, units='frames')
times = librosa.frames_to_time(frames, sr=sr)
rms = librosa.feature.rms(y=y)[0]
strength = np.array([onset[f] for f in frames]) * np.array([rms[min(f, len(rms) - 1)] for f in frames])
strength = strength / np.percentile(strength, 95)
beats = [[round(float(t), 3), round(float(min(1.0, s)), 3)] for t, s in zip(times, strength) if t < 359.0]
json.dump(beats, open(out, 'w'))
print('tempo', np.atleast_1d(tempo)[0], 'beats', len(beats))
