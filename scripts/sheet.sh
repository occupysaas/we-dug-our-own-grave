#!/usr/bin/env bash
# usage: scripts/sheet.sh name t1 t2 ... (8 times) → out/stills/name-sheet.jpg
set -e
name=$1; shift
cd "$(dirname "$0")/.."
ins=()
for t in "$@"; do
  f=$(python3 -c "print(round($t*30))")
  npx remotion still src/index.ts Video out/stills/$name-$t.png --frame=$f --scale=0.5 >/dev/null 2>&1 || echo "fail $t"
  ins+=(-i out/stills/$name-$t.png)
done
n=$#
if [ $n -eq 8 ]; then fc="[0][1][2][3]hstack=4[a];[4][5][6][7]hstack=4[b];[a][b]vstack"; else fc="hstack=$n"; fi
ffmpeg -loglevel error -y "${ins[@]}" -filter_complex "$fc" out/stills/$name-sheet.jpg
