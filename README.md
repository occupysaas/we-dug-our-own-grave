# We Dug Our Own Grave

The music video for the OccupySaaS theme song. It's a satirical doom-pop story about SaaS executives who automated away their engineers, and the engineers who came back with open source.

https://occupysaas.com

The whole video is code: 3D scenes in [Three.js](https://threejs.org) (react-three-fiber), rendered frame by frame with [Remotion](https://remotion.dev). It was directed by prompting [Claude Code](https://claude.com/claude-code).

## Render it

You need Node 22+ and ffmpeg. The song isn't in this repo, so put your copy of the audio at `public/song.wav` first.

```bash
npm install
npx remotion studio                 # preview and scrub in the browser
scripts/preview.sh                  # half-res render to out/preview.mp4 (~4 min)
npx remotion render src/index.ts Video out/we-dug-our-own-grave.mp4 --codec=h264 --crf=18
```

On Linux, headless WebGL needs the `angle-egl` renderer. That's already set in `remotion.config.ts`.

## How it's put together

- `src/timeline-times.ts` lists every scene with its start and end time in the song.
- `src/scenes/` holds one file per scene.
- `src/kit/` has the shared pieces: the voxel crab, people with photo heads, the masked protest crowd, cyberpunk towers, ground textures, and bloom.
- `src/timing/` syncs everything to the music: word timings (`cues.ts`), sing-along lyrics (`lyrics.ts`) and beat-synced screen shake (`shake.ts`).
- Every frame is a pure function of the frame number, so renders are deterministic and parallel.

To regenerate the timing data from the audio, use `scripts/align_lyrics.py` (needs Whisper word timings in `docs/lyrics-timing.json`) and `scripts/beats.py` (needs librosa).

The design brief is in `docs/design.md` and the build plan is in `docs/plan.md`.

## License

The code is licensed under [Apache 2.0](LICENSE). The photos, trademarks, fonts and song keep their own terms, listed in [NOTICE](NOTICE).
