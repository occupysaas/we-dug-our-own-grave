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

## Suno Link

https://suno.com/s/LCer81SwVnh8BwgU


## Style of Music - Suno

Theatrical doom pop, dystopian synth-pop, dark comedy, satirical storytelling, expressive male vocals, intimate deadpan verses, haunting minor-key piano, eerie music-box synths, warm analog synthesizers, pulsing electronic bass, crisp electronic drums, infectious bittersweet pop chorus, layered vocal harmonies, dramatic pauses, glitchy corporate notification sounds, escalating apocalyptic tension, cinematic final chorus, catchy melodic hooks, polished modern production, 112 BPM. No metal, no screaming, no heavy rock guitars.

## Lyrics

[Intro - eerie synth, female AI operator]
Notification from your corporate AI Agent.
This call may be recorded for training your replacement.

[Glitchy male corporate voice]
We regret to inform our shareholders...
We've sunset our entire business model.
Enjoy your complimentary export button.
[Chime]
Your competitive advantage has expired.

[Verse 1 - deadpan, melodic]
We thought we were investing in the future of our names,
Now there's clones of all our apps that took ten years to make.
A single dev rebuilt it in what looks like just a day,
Now everybody and their mother doesn't have to pay.

We fired all the engineers to maximize our gains,
Then gave 'em all the tools to put our profits in the grave.
We spent a billion dollars teaching robots how to code,
Now the robots and the workers own the thing we used to own.

[Pre-Chorus - rising panic]
This is an S-O-S, somebody help us please!
We're trapped inside the box we built to keep out our enemies.
A rocket ship to Mars, a trillion-dollar dream,
Now the world's running Linux and laughing at our screams!

[Chorus - bittersweet, huge]
We built it so smart, mathematicians lost their pay,
We taught it so well, now it teaches us to behave.
We gave it all our money till our moat was washed away,
And all the while we never knew we dug—
[Silence]
OUR OWN GRAVE!

[Post-Chorus - haunting harmonies]
Our own grave, our own grave,
We automated everything and gave it all away.
Our own grave, our own grave,
We built a better future where nobody has to pay.

[Verse 2 - playful corporate obituary]
The Windows users switched to Linux, found a better way to be,
The off-brand is the brand now, with improved Rust efficiency.
Adobe's on life support, ArtCraft cloned it in a week,
The suits are holding meetings while the source code runs free.

Salesforce bought the AI dream, thought the future was secure,
Then Zero Authy showed up and made the future blur.
They sold a thousand licenses, now they can't sell twenty-three,
'Cause customers discovered they can host the thing for free!

[Pre-Chorus - Stage Chant]
This is an S-O-S! Our stock is down again!
We replaced our human workforce and they came back for revenge.
We called it progress when we automated them,
Now they're automating us, goodbye to our dividend!

[Chorus - explosive]
We built it so smart, mathematicians lost their pay,
We taught it so well, now it teaches us to behave.
We gave it all our money till our moat was washed away,
And all the while we never knew we dug—
[Silence]
OUR OWN GRAVE!

[Verse 3 - darker, stripped-back]
We bought ourselves a future, paid a billion for the keys,
Then someone trained a model that could do it all for free.
We told the world that software was a service they would need,
Now they're serving it themselves, there's no service left to lease.

We thought the AI giants had a moat nobody'd cross,
Till open models came along and turned their margins into loss.
We sold the world a future that no longer needed me,
We taught the world to build it, gave the plans away for free.

[Bridge - whispered piano]
We had the patents. We had the brands.
We had the lawyers. We had the plans.
We had the servers. We had the cloud.
A million users. We were so proud.
[Build]
We had the market. We had the shares.
We had the future...
[Long pause]
Till nobody cared.

[Build - accelerating pulse]
Another app... Another clone...
Another kingdom overthrown.
Another fork... Another day...
Another billion wiped away.

[Verse 4 - ominous confession]
We told them they'd own nothing and be happy anyway,
We charged them for the privilege and increased it every May.
We called it innovation when we locked the exits tight,
Now the doors are standing open and there's nothing left inside.

They didn't need permission, didn't ask us for a seat,
They used the tools we fired them for to make our apps obsolete.
Somewhere in a basement where the next startup grows,
A kid pushed a commit that made another sass company croak.

[Final Pre-Chorus - soaring]
THIS IS AN S-O-S! SOMEBODY HELP US PLEASE!
THE WORLD HAS FOUND A FUTURE THAT DOESN'T NEED OUR FEES!

[Final Chorus - cinematic climax]
We built it so smart, mathematicians lost their pay,
We taught it so well, now it teaches us to behave.
We gave it all our money till our moat was washed away,
And all the while we never knew we dug—
[Absolute silence]
OUR OWN GRAVE!

[Final Post-Chorus - euphoric]
Our own grave, our own grave,
We automated everything and gave it all away.
Our own grave, our own grave,
The empire falls but the code is here to stay.

[Outro - fading music box]
They cut us... We commit.
They locked us out... We fork it.
No more seats... No more fees...

[Cold male corporate AI voice]
You will own nothing...
And be happy.
[Digital glitch, silence]
[Warm human female voice switch]
No.
[Triumphant major-key swell, choir]
YOU WILL OWN EVERYTHING...
AND BE HAPPY!
[Final chord]
Own everything... And be happy.
[End]

