"""Align official lyric lines (docs/lyrics.txt) to Whisper word timings (docs/lyrics-timing.json).
Writes src/timing/lyrics-aligned.json: [{"text": line, "start": s, "end": e, "words": [{"w": word, "s": s, "e": e}]}]."""
import json, re, sys, difflib

lines = [l.strip() for l in open('docs/lyrics.txt') if l.strip()]
segs = json.load(open('docs/lyrics-timing.json'))
asr = [w for s in segs for w in s['words']]
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower().replace('s-o-s', 'sos'))
asr_tok = [norm(w['w']) for w in asr]

lyr = []  # (line_idx, display_word, token)
for li, line in enumerate(lines):
    for w in line.split():
        for t in re.split(r'[-—]', w.lower().replace('s-o-s', 'sos')) if 'S-O-S' not in w else ['sos']:
            pass
        lyr.append((li, w, norm(w)))

sm = difflib.SequenceMatcher(a=[t for _, _, t in lyr], b=asr_tok, autojunk=False)
times = [None] * len(lyr)
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        times[a + k] = (asr[b + k]['s'], asr[b + k]['e'])

# interpolate gaps between known neighbours
i = 0
while i < len(lyr):
    if times[i] is None:
        j = i
        while j < len(lyr) and times[j] is None:
            j += 1
        prev_e = times[i - 1][1] if i > 0 else 0.0
        next_s = times[j][0] if j < len(lyr) else prev_e + 2.0 * (j - i)
        span = max(0.2 * (j - i), next_s - prev_e)
        step = span / (j - i)
        for k in range(i, j):
            s = prev_e + (k - i) * step
            times[k] = (s, s + step * 0.9)
        i = j
    else:
        i += 1

# the three "OUR OWN GRAVE!" hits land after the short silence (measured by RMS)
HITS = [101.7, 187.4, 319.4]
hit_n = 0
out = []
for li, line in enumerate(lines):
    idx = [k for k, (l, _, _) in enumerate(lyr) if l == li]
    words = [{"w": lyr[k][1], "s": round(times[k][0], 3), "e": round(times[k][1], 3)} for k in idx]
    if line.upper() == 'OUR OWN GRAVE!' and hit_n < len(HITS):
        h = HITS[hit_n]; hit_n += 1
        words = [{"w": w["w"], "s": round(h + j * 0.35, 3), "e": round(h + j * 0.35 + 0.35, 3)} for j, w in enumerate(words)]
    out.append({"text": line, "start": words[0]["s"], "end": words[-1]["e"], "words": words})

# enforce monotonic starts
for k in range(1, len(out)):
    if out[k]["start"] < out[k - 1]["start"]:
        out[k]["start"] = out[k - 1]["start"] + 0.05
json.dump(out, open('src/timing/lyrics-aligned.json', 'w'), indent=0)
matched = sum(1 for a, b, n in sm.get_matching_blocks() for _ in range(n))
print(f"lines {len(out)} words {len(lyr)} matched {matched}")
for l in out:
    print(f"{l['start']:7.2f}-{l['end']:7.2f} {l['text']}")
