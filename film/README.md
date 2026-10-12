# دستگاه رتیکولو اندوتلیال — a five-minute hand-drawn explainer

A five-minute Persian explainer film about the reticuloendothelial system
(mononuclear phagocyte system), drawn procedurally on a canvas in a
hand-drawn pencil/ink-on-paper language, with narration by Google's Gemini TTS
voice **Aoede** in a colloquial, conversational register.

## Deliverables

| File | What it is |
|---|---|
| `out/res-film-final.mp4` | the finished film: 1920×1080, 24 fps, narration + quiet music bed |
| `out/res-film.mp4` | the picture alone, no audio |
| `res-film.html` | the film itself: open it in a browser for the player, the scrubber and frame export |
| `out/narration.wav` | the mixed narration track (speech + pad), 48 kHz stereo |
| `build/narration.py` | the Persian narration script, one entry per scene |
| `durations.js` | scene durations measured from the generated speech, written by `build/mix.py` |

## How it is put together

```
build/narration.py   scene text (colloquial Persian)
        │
        ▼  build/gen_audio.py      Gemini TTS, voice Aoede, one request per scene
film/audio/sNN.wav   raw speech, 24 kHz mono  (manifest.json holds the durations)
        │
        ▼  build/mix.py            trim silence, atempo to hit ~5:00, place on the
        │                          timeline, add a slow pad, duck it under the voice
film/out/narration.wav   +  film/durations.js   (scene lengths for the timeline)
        │
        ▼  node render_all.mjs     N headless Chrome pages, each rendering a frame
        │                          range straight into its own ffmpeg segment
film/out/res-film.mp4  ──►  mux narration  ──►  film/out/res-film-final.mp4
```

The picture is one HTML file. `core.js` is the drawing engine (palettes, brush
strokes, watercolour washes, lattices, camera, timeline); everything the film
draws on top of it lives in `res-film.html`: the paper, the cells, the organs,
the Persian lettering and the ten scenes.

## The film

| # | Scene | Content |
|---|---|---|
| 1 | قلاب و معرفی | the body's nightly cleaning crew; the title |
| 2 | اسم و تعریف | where the name "reticulo-endothelial" comes from, and why the accurate name today is *mononuclear phagocyte system* |
| 3 | اعضای خانواده | monocytes, tissue macrophages, dendritic cells |
| 4 | نقشه‌ی پراکندگی | Kupffer cells, red-pulp macrophages, lymph nodes, alveolar macrophages, marrow, skin, gut, microglia |
| 5 | فاگوسیتوز | chemotaxis, recognition and opsonins, engulfment, lysosomal digestion |
| 6 | کارخانه‌ی بازیافت خون | two million red cells a second, iron recycling, bilirubin and jaundice |
| 7 | خط اول دفاع | sepsis, the cytokine storm, silent clearance of apoptotic cells |
| 8 | پل به ایمنی اختصاصی | antigen presentation, the dendritic cell, vaccines and immune memory |
| 9 | نکته‌های بالینی | splenectomy, Howell-Jolly bodies, vaccination; fatty liver, atherosclerosis, tumours |
| 10 | جمع‌بندی | the three jobs, and the everyday habits that keep the crew healthy |

## Rebuilding

System Chrome/Chromium and ffmpeg are required, plus `npm i` in this folder for
`puppeteer-core`.

```bash
# 1. narration (needs Gemini API keys in build/tts.py)
python3 build/gen_audio.py         # writes audio/sNN.wav + audio/manifest.json
python3 build/mix.py               # writes out/narration.wav + durations.js

# 2. picture
CHROME=/path/to/chrome WORKERS=4 node render_all.mjs res-film.html out

# 3. previews
node preview.mjs res-film.html /tmp/prev 0,120,240    # a few frames as PNGs
node prevscenes.mjs                                   # three frames from each scene
```

`render_all.mjs` splits the 7 293 frames across four Chrome pages and pipes each
range straight into an ffmpeg segment, so no frame ever lands on disk.

## Notes

* The drawing is pure canvas 2D: seeded wobble and brush pressure, watercolour
  washes on multiply, no bitmaps, no stock art.
* Persian text is set in Vazirmatn and Lalezar (both OFL), embedded from
  `fonts/`; canvas shapes RTL text with the browser's own shaper.
* `durations.js` is generated, not hand-edited: change the script or the pace in
  `build/mix.py` and re-run the pipeline.
* The music bed is synthesised in `build/mix.py` with numpy — a slow four-chord
  pad, ducked under the voice; there is no third-party audio in the film.
